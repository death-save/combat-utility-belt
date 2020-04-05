import * as BUTLER from "../butler.js";
import { ConditionLab } from "./condition-lab.js";
import { Sidekick } from "../sidekick.js";
/**
 * Builds a mapping between status icons and journal entries that represent conditions
 */
export class EnhancedConditions {
    constructor() {
        this.coreStatusIcons = this.coreStatusIcons || EnhancedConditions._backupCoreStatusIcons();
        this.system = this.system || Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.system);
        this.maps = this.maps || EnhancedConditions.getDefaultMaps();
        this.map = this.map || EnhancedConditions.getDefaultMap(this.system);
        //EnhancedConditions._updateStatusIcons();
    }

    /**
     * Returns the default maps supplied with the module
     * @todo: needs a redesign -- change to arrays of objects?
     * @todo: map to entryId and then rebuild on import
     */
    static async getDefaultMaps() {
        const source = "data";
        const path = BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionMapsPath;
        const jsons = await Sidekick.fetchJsons(source, path);

        const defaultMaps = jsons.filter(j => !j.system.includes("example")).reduce((obj, current) => {
            obj[current.system] = current.map;
            return obj;
        },{});

        return defaultMaps;
    }

    /**
     * Parses a condition map JSON and returns a map
     * @param {*} json 
     */
    static parseJson(json) {
        const map = {
            [json.system]: json.map
        };

        return map;
    }

    /**
     * Returns the default condition map for a given system
     * @param {*} system 
     */
    static async getDefaultMap(system) {
        const defaultMaps = await EnhancedConditions.getDefaultMaps();

        return defaultMaps[system];
    }


    /**
     * Retrieve the statusEffect icons from the Foundry CONFIG
     */
    static _backupCoreStatusIcons() {
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
        const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

        if (!enable) {
            // maybe restore the core icons?
            return;
        }

        const map = conditionMap || Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        let entries;

        //save the original icons
        if (!this.coreStatusIcons) {
            this.coreStatusIcons = EnhancedConditions._backupCoreStatusIcons();
        }

        const removeDefaultEffects = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.removeDefaultEffects);
        const activeConditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        const icons = EnhancedConditions.getConditionIcons(activeConditionMap);

        if (removeDefaultEffects) {
            CONFIG.statusEffects = activeConditionMap ? icons : [];
        } else {
            if (map instanceof Map) {
                entries = map.entries();
                for (let [k, v] of entries) {
                    CONFIG.statusEffects.push(v);
                    //console.log(k,v);
                }
            } else if (map instanceof Array) {
                //add the icons from the condition map to the status effects array
                CONFIG.statusEffects = this.coreStatusIcons.concat(icons);
            } else {
                entries = [];
            }
        }
    }

    /**
     * Returns just the icon side of the map
     */
    static getConditionIcons(conditionMap) {
        if (!conditionMap) {
            //maybe log an error?
            return;
        }

        if (conditionMap instanceof Map) {
            return Array.from(conditionMap.values());            
        } else if (conditionMap instanceof Array) {
            return conditionMap[0] instanceof Array ? conditionMap.map(value => value[1]) : conditionMap;
        }

        return [];
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
        } else if (labButton && (!game.user.isGM || !display)) {
            labButton.style.display = "none";
        }
    }

    /**
     * Hooks on token updates. If the update includes effects, calls the journal entry lookup
     */
    static _hookOnUpdateToken(scene, sceneID, update, options, userId) {
        const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

        if (!enable || !game.user.isGM || (game.users.get(userId).isGM && !game.userId === userId)) {
            return;
        }

        //console.log(token,sceneId,update);
        let effects = update.effects;

        if (!effects || effects.length === 0) {
            return;
        }

        //If the update has effects in it, lookup mapping and set the current token
        const token = canvas.tokens.get(update._id);
        const map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        return EnhancedConditions.lookupEntryMapping(token, map, effects);
    }

    /**
     * Hooks on token updates. If the update includes effects, calls the journal entry lookup
     */
    static _hookOnPreUpdateToken(scene, sceneID, update, options) {
        const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

        if (!enable) {
            return;
        }

        //console.log(token,sceneId,update);
        let effects = update.effects;

        if (!effects || effects.length === 0) {
            return;
        }

        //If the update has effects in it, lookup mapping and set the current token
        const token = canvas.tokens.get(update._id);
        const map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        return EnhancedConditions.lookupEntryMapping(token, map, effects);
    }

    /**
     * Adds a title/tooltip with the matched Condition name
     */
    static _hookOnRenderTokenHUD(app, html, data) {
        const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

        if (!enable) {
            return;
        }

        const map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        const conditionIcons = EnhancedConditions.getConditionIcons(map);
        const effectIcons = html.find("img.effect-control");
        const enhancedIcons = effectIcons.filter(i => {
            const src = i.attributes.src.value;
            if (conditionIcons.includes(src)) {
                return true;
            }
        });

        return enhancedIcons.forEach(i => i.setAttribute("title", Sidekick.getKeyByValue(map, i)));
    }

    /**
     * Checks statusEffect icons against mapping and returns matching journal entries
     * @param {Array} icons 
     */
    static async lookupEntryMapping(token, map, icons) {
        const conditionEntries = map.filter(row => {
            const [c, i, j] = row;
            return icons.includes(i) ? true : false;
        });

        if (conditionEntries.length === 0) {
            return;
        }

        return EnhancedConditions.outputChatMessage(token, conditionEntries);
    }

    /**
     * Output condition entries to chat
     */
    static async outputChatMessage(token, entries) {
        const chatUser = game.userId;
        //const token = token || this.currentToken;
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