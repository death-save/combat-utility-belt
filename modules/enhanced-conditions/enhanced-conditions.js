import * as BUTLER from "../butler.js";
import { ConditionLab } from "./condition-lab.js";
/**
 * Builds a mapping between status icons and journal entries that represent conditions
 */
export class EnhancedConditions {
    constructor() {
        this.coreStatusIcons = this.coreStatusIcons || this._backupCoreStatusIcons();
        this._updateStatusIcons();
        this.currentToken = {};
    }

    /**
     * Defines the maps used in the gadget
     * @todo: needs a redesign -- change to arrays of objects?
     * @todo: map to entryId and then rebuild on import
     */
    static async getDefaultMaps(path, extensions=["json"]) {
        // get the json files
        // for each fetch and parse the json
        // add the result to a variable -- CUB.enhancedConditions.maps ???
        const defaultMaps = [];
        const fp = await FilePicker.browse("data", path, {extensions});

        if (!fp.files.length) {
            return;
        }

        for (const file of fp.files) {
            const jsonFile = await fetch(fp);
            const json = await jsonFile.json();
            const map = JSON.parse(json);

            if (map) {
                defaultMaps.push(map);
            }
        }
        return defaultMaps;
    }

    static getDefaultMap(system) {
        if (!game.cub.enhancedConditions.defaultMaps) {
            game.cub.enhancedConditions.defaultsMaps = EnhancedConditions.getDefaultMaps(BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionMapsPath)
        }

        return game.cub.enhancedConditions.defaultMaps[system];
    }


    /**
     * Retrieve the statusEffect icons from the Foundry CONFIG
     */
    _backupCoreStatusIcons() {
        CONFIG.defaultStatusEffects = CONFIG.defaultStatusEffects || duplicate(CONFIG.statusEffects);
        if (!Object.isFrozen(CONFIG.defaultStatusEffects)) {
            Object.freeze(CONFIG.defaultStatusEffects);
        }
        return CONFIG.defaultStatusEffects;
    }

    /**
     * Creates journal entries for any conditions that don't have one
     * @param {String} condition - the condition being evaluated
     */
    static async _createJournalEntry(condition) {
        let entry = null;

        try {
            entry = await JournalEntry.create({
                name: condition,
                permission: {
                    default: ENTITY_PERMISSIONS.LIMITED
                }
            }, {
                displaySheet: false
            });
        } catch (e) {
            //console.log(e);
        } finally {
            return entry;
        }

    }

    /**
     * Updates the core CONFIG.statusEffects with the new icons
     */
    static _updateStatusIcons(conditionMap) {
        const map = conditionMap || this.settings.maps[this.settings.system];
        let entries;

        //save the original icons
        if (!this.coreStatusIcons) {
            this.coreStatusIcons = this._backupCoreStatusIcons();
        }
        /*
        if(!CONFIG.defaultStatusEffects) {
            CONFIG.defaultStatusEffects = duplicate(CONFIG.statusEffects);
            Object.freeze(CONFIG.defaultStatusEffects);
        }
       */

        //console.log(this.settings.maps);
        //killswitch for further execution of the function
        if (this.settings.enhancedConditions) {
            if (this.settings.removeDefaultEffects) {
                CONFIG.statusEffects = this.settings.maps[this.settings.system] ? this.icons : [];
            } else {
                if (map instanceof Map) {
                    entries = map.entries();
                    for (let [k, v] of entries) {
                        CONFIG.statusEffects.push(v);
                        //console.log(k,v);
                    }
                } else if (map instanceof Array) {
                    //add the icons from the condition map to the status effects array
                    CONFIG.statusEffects = this.coreStatusIcons.concat(this.icons);
                } else {
                    entries = [];
                }
            }
        } else {
            CONFIG.statusEffects = this.coreStatusIcons;
        }
    }

    /**
     * Displays the condition map for the selected system
     */
    get map() {
        return this.settings.maps[this.settings.system];
    }

    /**
     * Inverts the key and value in the map
     * @todo: rework
     */
    get inverseMap() {
        let newMap = new Map();
        for (let [k, v] of this.map) {
            newMap.set(v, k);
        }
        return newMap;
    }

    /**
     * Returns just the icon side of the map
     */
    get icons() {
        if (this.map instanceof Map) {
            return Array.from((this.settings.maps[this.settings.system]).values());
        } else if (this.map instanceof Array && this.map[0] instanceof Array) {
            let iconArray = [];
            this.map.forEach((value, index, array) => {
                iconArray.push(value[1]);
            });

            return iconArray;
        } else if (this.map instanceof Array) {
            return this.map;
        } else {
            return [];
        }
    }

    /**
     * Creates a div for the module and button for the Condition Lab
     * @param {Object} html the html element where the button will be created
     */
    static _createLabButton(html) {
        const cubDiv = html.find("#combat-utility-belt");

        const labButton = $(
            `<button id="condition-lab" data-action="condition-lab">
                    <i class="fas fa-flask"></i> ${BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionLab.title}
                </button>`
        );

        cubDiv.append(labButton);


        labButton.click(ev => {
            new ConditionLab().render(true);
        });

        

    }

    /**
     * Determines whether to display the combat utility belt div in the settings sidebar
     * @param {Boolean} display 
     * @todo: extract to helper in sidekick class?
     */
    static _toggleLabButtonVisibility(display) {
        if (!game.settings.isGM) {
            return;
        }

        let labButton = document.getElementById("condition-lab");

        if (display && !labButton) {
            labButton.style.display = "block";
        } else if (sidebarButton && (!game.user.isGM || !display)) {
            sidebarButton.style.display = "none";
        }
    }

    /**
     * Hooks on token updates. If the update includes effects, calls the journal entry lookup
     */
    _hookOnUpdateToken(scene, sceneID, update, options, userId) {
        if (!this.settings.enhancedConditions || !game.user.isGM || (game.users.get(userId).isGM && !game.userId === userId)) {
            return;
        }

        //console.log(token,sceneId,update);
        let effects = update.effects;

        if (!effects || effects.length === 0) {
            return;
        }

        //If the update has effects in it, lookup mapping and set the current token
        this.currentToken = canvas.tokens.get(update._id);
        return this.lookupEntryMapping(effects);
    }

    /**
     * Hooks on token updates. If the update includes effects, calls the journal entry lookup
     */
    _hookOnPreUpdateToken(scene, sceneID, update, options) {
        if (!this.settings.enhancedConditions) {
            return;
        }

        //console.log(token,sceneId,update);
        let effects = update.effects;

        if (!effects || effects.length === 0) {
            return;
        }

        //If the update has effects in it, lookup mapping and set the current token
        this.currentToken = canvas.tokens.get(update._id);
        return this.lookupEntryMapping(effects);
    }

    /**
     * Adds a title/tooltip with the matched Condition name
     */
    _hookOnRenderTokenHUD(app, html, data) {
        const conditionIcons = this.icons;
        let statusIcons = html.find("img.effect-control");

        //console.log(app,html);
        //killswitch for further execution of function
        if (this.settings.enhancedConditions) {
            for (let i of statusIcons) {
                const src = i.attributes.src.value;

                if (conditionIcons.includes(src)) {
                    i.setAttribute("title", this.inverseMap.get(src));
                }
            }
        }
    }

    /**
     * Checks statusEffect icons against mapping and returns matching journal entries
     * @param {Array} icons 
     */
    async lookupEntryMapping(icons) {
        const conditionEntries = this.map.filter(row => {
            const [c, i, j] = row;
            return icons.includes(i) ? true : false;
        });

        if (conditionEntries.length === 0) {
            return;
        }

        return this.outputChatMessage(conditionEntries);
    }

    /**
     * Output condition entries to chat
     */
    async outputChatMessage(entries) {
        const chatUser = game.userId;
        const token = this.currentToken;
        const chatType = CONST.CHAT_MESSAGE_TYPES.OTHER;

        let tokenSpeaker = ChatMessage.getSpeaker({token});
        let chatContent;

        if (entries.length === 0) {
            return;
        }

        //create some boiler text for prepending to the conditions array
        chatContent = `<h3>${this.DEFAULT_CONFIG.enhancedConditions}</h3><p>${tokenSpeaker.alias} is:</p><ul class="chat-message condition-list">`;

        const chatConditions = entries.map(row => {
            const [condition, icon, journalId] = row;
            return `<li>${icon ? `<img src="${icon}" class="icon chat-message" title="${condition}">` : ""}${journalId.trim() ? `@JournalEntry[${journalId}]` : ` ${condition}`}</li>`
        })

        if (chatConditions.length === 0) {
            return;
        }

        //add the conditions to the boiler text
        chatContent += `${chatConditions.join("")}</ul>`;

        return await ChatMessage.create({
            speaker: tokenSpeaker,
            content: chatContent,
            type: chatType,
            user: chatUser
        });
    }

    /**
     * looks up the corresponding actor entity for the token
     * @param {String} id 
     * @returns {Actor} actor
     */
    async lookupTokenActor(id) {
        let actor = {};
        if (id) {
            actor = await game.actors.entities.find(a => a._id === id);
        }
        //console.log("found actor: ",actor)
        return actor;
    }

    /* future features
    get compendiumChoices() {
        const compendiums = game.packs;
        let result = {};

        for(let n of compendiums) {
            result[n.metadata.name] = n.metadata.label; 
        }
        
        return result;
    }
    */

}