import * as BUTLER from "../butler.js";
import { ConditionLab } from "./condition-lab.js";
import { Sidekick } from "../sidekick.js";
/**
 * Builds a mapping between status icons and journal entries that represent conditions
 */
export class EnhancedConditions {
    /**
     * Ready Hook handler
     */
    static async _onReady() {
        const setting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.maps);
        const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

        if (!setting || (setting instanceof Object && Object.entries(setting).length === 0)) {
            const defaultMaps = await EnhancedConditions.loadDefaultMaps();
            Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.maps, defaultMaps);
        }

        const conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        if (enable) {
            EnhancedConditions._updateStatusIcons(conditionMap);
        }

    }

    /**
     * Returns the default maps supplied with the module
     * 
     * @todo: map to entryId and then rebuild on import
     */
    static async loadDefaultMaps() {
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
    static getDefaultMap(system) {
        const defaultMaps = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.maps);
        return defaultMaps[system] ? defaultMaps[system] : [];
    }


    /**
     * Duplicate the core status icons, freeze the duplicate then store a copy in settings
     */
    static _backupCoreIcons() {
        CONFIG.defaultStatusEffects = CONFIG.defaultStatusEffects || duplicate(CONFIG.statusEffects);
        if (!Object.isFrozen(CONFIG.defaultStatusEffects)) {
            Object.freeze(CONFIG.defaultStatusEffects);
        }
        Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreIcons, CONFIG.defaultStatusEffects);
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
        const coreIconSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreIcons);

        //save the original icons
        if (!coreIconSetting) {
            EnhancedConditions._backupCoreIcons();
        }

        const removeDefaultEffects = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.removeDefaultEffects);
        const activeConditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        const icons = EnhancedConditions.getConditionIcons(activeConditionMap);

        if (removeDefaultEffects) {
            CONFIG.statusEffects = activeConditionMap ? icons : [];
        } else {
            if (map instanceof Array) {
                //add the icons from the condition map to the status effects array
                const coreIcons = CONFIG.defaultStatusEffects || Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreIcons);
                CONFIG.statusEffects = coreIcons.concat(icons);
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
        
        if (conditionMap instanceof Array) {
            return conditionMap.map(mapEntry => mapEntry.icon);
        }

        return [];
    }

    /**
     * Creates a button for the Condition Lab
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
            game.cub.conditionLab = new ConditionLab().render(true);
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

        // array of objects: {name, icon, journalId, trigger}
        const map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        const conditionIcons = EnhancedConditions.getConditionIcons(map);
        const effectIcons = html.find("img.effect-control");
        // jquery .filter()
        const enhancedIcons = jQuery.makeArray(effectIcons).filter(i => {
            const src = i.attributes.src.value;
            if (conditionIcons.includes(src)) {
                return true;
            }
        })

        return enhancedIcons.forEach(i => {
            const src = i.attributes.src.value;
            const matchedCondition = map.find(m => m.icon === src);
            i.setAttribute("title", matchedCondition.name);
        });
    }

    static _onRenderChatMessage(app, html, data) {
        if (data.message.content && !data.message.content.match("enhanced-conditions")) {
            return;
        }

        const removeConditionAnchor = html.find("a[name='remove-row']");

        removeConditionAnchor.on("click", event => {
            const li = event.target.closest("li");
            const conditionName = li.dataset.conditionName;
            const contentDiv = event.target.closest("div.content");
            const tokenId = contentDiv.dataset.tokenId;
            const token = canvas.tokens.get(tokenId);

            if (!token) {
                return;
            }

            EnhancedConditions.removeCondition(token, conditionName);
        });
    }

    /**
     * Checks statusEffect icons against map and returns matching condition mappings
     * @param {Array} icons 
     */
    static async lookupEntryMapping(token, map, icons) {
        const conditionEntries = map.filter(row => icons.includes(row.icon));

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

        if (entries.length === 0) {
            return;
        }

        // iterate over the entries and mark any with references for use in the template
        entries.forEach((v, i, a) => {
            if (v.referenceId) {
                a[i].hasReference = true;
            }
        });

        const templateData = {
            tokenId: token.id,
            alias: tokenSpeaker.alias,
            conditions: entries
        };

        const chatContent = await renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.chatOutput, templateData);

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

    /**
     * Applies the named condition to the provided tokens
     * @param {*} tokens
     * @param {*} conditionName
     */
    static applyCondition(tokens, conditionName) {
        if (!tokens) {
            console.log("No token provided");
            return;
        }

        const map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        const condition = map.find(c => c.name === conditionName);

        if (!condition) {
            console.log("Coult not find condition with name: ", conditionName);
            return;
        }

        const effect = condition ? condition.icon : null;
        
        if (!effect) {
            console.log("No icon is setup for condition: ", conditionName);
            return;
        }
        
        if (tokens && !(tokens instanceof Array)) {
            tokens = [tokens];
        }

        for (let token of tokens) {
            if (token.data.effects.includes(effect)) {
                console.log(`Condition ${conditionName} is already active on token.`);
                return;
            }

            token.toggleEffect(effect);
        }
        
    }

    /**
     * Removes the named condition from a token or tokens
     * @param {*} tokens 
     * @param {*} conditionName 
     */
    static removeCondition(tokens, conditionName) {
        // iterate tokens removing conditions
        if (!tokens) {
            console.log("No token provided");
            return;
        }

        const map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        const condition = map.find(c => c.name === conditionName);

        if (!condition) {
            console.log("Coult not find condition with name: ", conditionName);
            return;
        }

        const effect = condition ? condition.icon : null;
        
        if (!effect) {
            console.log("No icon is setup for condition: ", conditionName);
            return;
        }
        
        if (tokens && !(tokens instanceof Array)) {
            tokens = [tokens];
        }

        for (let token of tokens) {
            if (!token.data.effects.includes(effect)) {
                console.log(`Condition ${conditionName} is not active on token.`);
                return;
            }

            token.toggleEffect(effect);
        }
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