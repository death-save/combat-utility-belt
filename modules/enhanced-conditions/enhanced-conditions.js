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
        let maps;
        let defaultMaps = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMaps);
        const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);
        const system = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.system);
        const mapType = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType);
        const defaultMapType = Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.default);
        let conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        // If there's no defaultMaps or defaultMaps doesn't include game system, check storage then set appropriately
        if (!defaultMaps || (defaultMaps instanceof Object && Object.keys(defaultMaps).length === 0) || (defaultMaps instanceof Object && !Object.keys(defaultMaps).includes(system))) {
            if (game.user.isGM) {
                const storedMaps = await EnhancedConditions.loadDefaultMaps();
                defaultMaps = await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMaps, storedMaps);
            }            
        }

        // If map type is not set and a default map exists for the system, set maptype to default
        if (!mapType && (defaultMaps instanceof Object && Object.keys(defaultMaps).includes(system))) {
            
            Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType, defaultMapType);
        }

        // If there's no condition map, get the default one
        if (!conditionMap.length) {
            conditionMap = EnhancedConditions.getDefaultMap(system);

            if (game.user.isGM) {
                Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, conditionMap);
            }
        }

        // If the gadget is enabled, update status icons accordingly
        if (enable) {
            if (game.user.isGM) {
                EnhancedConditions._backupCoreIcons();
            }
            EnhancedConditions._updateStatusIcons(conditionMap);
        }

        // Save the active condition map to a convenience property
        if (game.cub) {
            game.cub.conditions = conditionMap;
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
    static mapFromJson(json) {
        if (json.system !== game.system.id) {
            ui.notifications.warn("This map does not match your game system and may not work as expected.")
        }
        
        const map = json.map;

        return map;
    }

    /**
     * Returns the default condition map for a given system
     * @param {*} system 
     */
    static getDefaultMap(system) {
        const defaultMaps = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMaps);
        let defaultMap = defaultMaps[system] || [];

        if (!defaultMap.length) {
            defaultMap = EnhancedConditions.buildDefaultMap(system);
        }
        return defaultMap;
    }

    /**
     * Builds a default map for a given system
     * @param {*} system 
     */
    static buildDefaultMap(system) {
        const coreIcons = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreIcons);

        // iterate over icons, set condition to icon file name, try to find a matching reference
        const map = coreIcons.map(i => {
            const icon = i;
            let name = i.split("/").pop().split(".").shift();
            name = name ? Sidekick.toTitleCase(name) : "";
            
            return {
                name,
                icon
            }
        });

        return map;
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
                    default: CONST.ENTITY_PERMISSIONS.LIMITED
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

        let entries;
        const coreIconSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreIcons);

        //save the original icons
        if (!coreIconSetting.length) {
            EnhancedConditions._backupCoreIcons();
        }

        const removeDefaultEffects = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.removeDefaultEffects);
        const activeConditionMap = conditionMap || Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        const icons = EnhancedConditions.getConditionIcons(activeConditionMap);

        if (!removeDefaultEffects && !activeConditionMap) {
            return;
        }

        if (removeDefaultEffects) {
            return CONFIG.statusEffects = activeConditionMap ? icons : [];
        } 
        
        if (activeConditionMap instanceof Array) {
            //add the icons from the condition map to the status effects array
            const coreIcons = CONFIG.defaultStatusEffects || Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreIcons);

            // Create a Set based on the core status icons and the Enhanced Condition icons. Using a Set ensures unique icons only
            return CONFIG.statusEffects = [...new Set(coreIcons.concat(...icons))];
        }
    }

    /**
     * Returns just the icon side of the map
     */
    static getConditionIcons(conditionMap={}) {
        if (!conditionMap) {
            //maybe log an error?
            return;
        }
        
        if (Object.keys(conditionMap).length === 0) {
            conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

            if (!conditionMap || Object.keys(conditionMap).length === 0) {
                return [];
            }
        }
        
        if (conditionMap instanceof Array) {
            return conditionMap.map(mapEntry => mapEntry.icon);
        }

        return [];
    }

    /**
     * Retrieves a condition icon by its mapped name
     * @param {*} condition 
     */
    static getIconsByCondition(condition, {firstOnly=false}={}) {
        const conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        if (!conditionMap || !condition) {
            return;
        }

        if (conditionMap instanceof Array) {
            const filteredConditions = conditionMap.filter(c => c.name === condition).map(c => c.icon);
            if (!filteredConditions.length) {
                return;
            }

            return firstOnly ? filteredConditions[0] : filteredConditions;
        }

        return null;
    }

    /**
     * Retrieves a condition name by its mapped icon
     * @param {*} icon 
     */
    static getConditionsByIcon(icon, {firstOnly=false}={}) {
        const conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        if (!conditionMap || !icon) {
            return;
        }

        if (conditionMap instanceof Array && conditionMap.length) {
            const filteredIcons = conditionMap.filter(c => c.icon === icon).map(c => c.name);
            if (!filteredIcons.length) {
                return null;
            }
            return firstOnly ? filteredIcons[0] : filteredIcons;
        }

        return null;
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
        if (!game.user.isGM) {
            return;
        }

        let labButton = document.getElementById("condition-lab");

        if (display && labButton && labButton.style.display !== "block") {
            return labButton.style.display = "block";
        } 
        
        if (labButton && !display && labButton.style.display !== "none") {
            return labButton.style.display = "none";
        }
    }

    /**
     * Hooks on token updates. If the update includes effects, calls the journal entry lookup
     */
    static _onUpdateToken(scene, tokenData, update, options, userId) {
        const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

        if (!enable || !game.user.isGM || (game.users.get(userId).isGM && game.userId !== userId)) {
            return;
        }

        if (!hasProperty(update, "effects") && !hasProperty(update, "overlayEffect")) {
            return;
        }

        const conditions = update.effects ? duplicate(update.effects) : tokenData?.effects?.length ? duplicate(tokenData.effects) : [];
        update.overlayEffect ? conditions.push(update.overlayEffect) : tokenData.overlayEffect ? conditions.push(tokenData.overlayEffect) : null;

        if (!conditions.length) {
            return;
        }

        

        //If the update has effects in it, lookup mapping and set the current token
        //const token = new Token(tokenData);
        const token = canvas.tokens.get(tokenData._id);
        const map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        return EnhancedConditions.lookupEntryMapping(token, map, conditions);
    }

    /**
     * Hooks on token updates. If the update includes effects, calls the journal entry lookup
     */
    static _onPreUpdateToken(scene, tokenData, update, options, userId) {
        /* WIP
        const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

        if (!enable) {
            return;
        }

        //console.log(token,sceneId,update);
        const conditions = update.effects ? duplicate(update.effects) : [];
        update.overlayEffect ? conditions.push(update.overlayEffect) : null;

        if (!conditions.length) {
            return;
        } 

        //If the update has effects in it, lookup mapping and set the current token
        //const token = canvas.tokens.get(update._id);
        const map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        return EnhancedConditions.lookupEntryMapping(token, map, conditions);
        */
    }

    /**
     * Update Combat Handler
     * @param {*} combat 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    static _onUpdateCombat(combat, update, options, userId) {
        const enableEnhancedConditions = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);
        const enableOutputCombat = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputCombat);

        if (!hasProperty(update, "turn") || !enableEnhancedConditions || !enableOutputCombat|| !game.user.isGM) {
            return;
        }

        const token = canvas.tokens.get(game.combat.combatant.tokenId);
        const conditions = token.data.effects.length ? duplicate(token.data.effects) : [];
        token.data.overlayEffect ? conditions.push(token.data.overlayEffect) : null;

        if (!conditions.length) {
            return;
        }

        const map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        return EnhancedConditions.lookupEntryMapping(token, map, conditions);
    }

    /**
     * Adds a title/tooltip with the matched Condition name
     */
    static _onRenderTokenHUD(app, html, data) {
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

    /**
     * Render Chat Message handler
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     * @todo move to chatlog render?
     */
    static _onRenderChatMessage(app, html, data) {
        if (data.message.content && !data.message.content.match("enhanced-conditions")) {
            return;
        }

        const contentDiv = html.find("div.content");
        const messageDiv = contentDiv.closest("li.message");
        const messageId = messageDiv.data().messageId;
        const tokenId = contentDiv.data().tokenId;
        const token = canvas.tokens.get(tokenId) || canvas.scene.data.tokens.find(t => t._id === tokenId);
        const message = game.messages.get(messageId);
        const removeConditionAnchor = html.find("a[name='remove-row']");

        if (!token || (token && !game.user.isGM)) {
            removeConditionAnchor.parent().hide();
        }

        /**
         * @todo move to chatlog listener instead
         */
        removeConditionAnchor.on("click", event => {
            const li = event.target.closest("li");
            const contentDiv = li.closest("div.content");
            const tokenId = contentDiv.dataset.tokenId;
            const token = canvas.tokens.get(tokenId);
            const conditionName = li.dataset.conditionName;
            
            if (!token) {
                return;
            }

            EnhancedConditions.removeCondition(conditionName, token);

            /**
             * @todo need a solution for dealing with chat log spam -- once chat output is just a diff it will be better
             */
            //const newContent = duplicate(message.data.content);
            //const update = $(newContent).find(li).remove();
            //message.delete()
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

        // If condition marks combatants defeated, look for matching combatant
        if (conditionEntries.some(c => c?.options?.markDefeated)) {
            const combat = game.combat;
            const combatants = combat ? game.combat?.combatants.filter(c => c.tokenId === token.id) : [];

            if (!combatants.length) {
                return;
            }

            const update = combatants.map(c => {
                return {
                    _id: c._id,
                    defeated: true
                }
            });

            combat.updateEmbeddedEntity("Combatant", update);
        }

        const outputSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat);

        if (!outputSetting) {
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
            conditions: entries,
            isOwner: token.owner || game.user.isGM
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
     * Applies the named condition to the provided tokens
     * @param {*} tokens
     * @param {*} conditionName
     * @todo coalesce into a single update
     */
    static async applyCondition(conditionName, tokens, {warn=true}={}) {
        if (!tokens) {
            ui.notifications.error("Apply Condition failed. No token provided");
            console.log("Combat Utility Belt - Enhanced Conditions | No token provided");
            return;
        }

        const map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        const condition = map.find(c => c.name === conditionName);

        if (!condition) {
            ui.notifications.error("Apply Condition failed. Could not find condition.");
            console.log("Combat Utility Belt - Enhanced Conditions | Could not find condition with name: ", conditionName);
            return;
        }

        const effect = condition ? condition.icon : null;
        
        if (!effect) {
            ui.notifications.error("Apply Condition failed. Could not find icon.");
            console.log("Combat Utility Belt - Enhanced Conditions | No icon is setup for condition: ", conditionName);
            return;
        }
        
        if (tokens && !(tokens instanceof Array)) {
            tokens = [tokens];
        }

        for (let token of tokens) {
            if ((!condition?.options?.overlay && token?.data?.effects.includes(effect)) || (condition?.options?.overlay && token?.data?.overlayEffect === effect)) {
                if (warn) {
                    ui.notifications.warn("Apply Condition failed. Condition already active.");
                    console.log(`Combat Utility Belt - Enhanced Conditions | Condition ${conditionName} is already active on token.`);
                }
                return;
            }

            if (condition?.options?.removeOthers) {
                await token.update({effects: []});
            }

            condition?.options?.overlay === true ? await token.toggleOverlay(effect) : await token.toggleEffect(effect);

            
        }
        
    }

    /**
     * Retrieves all active conditions for the given tokens
     * @param {*} tokens 
     */
    static getConditions(tokens) {
        if (!tokens) {
            ui.notifications.error("Get Conditions failed. No token provided");
            console.log("Combat Utility Belt - Enhanced Conditions | Get Conditions failed. No token provided");
            return;
        }

        const map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        if (!map || !map.length) {
            ui.notifications.error("Get Conditions failed. No Condition Map found");
            console.log("Combat Utility Belt - Enhanced Conditions | Get Conditions failed. No Condition Map found");
            return;
        }

        if (tokens && !(tokens instanceof Array)) {
            tokens = [tokens];
        }

        for (let token of tokens) {
            const conditions = token.data.effects.length ? duplicate(token.data.effects) : [];
            token.data.overlayEffect ? conditions.push(token.data.overlayEffect) : null;

            if (!conditions.length) {
                return;
            }

            EnhancedConditions.lookupEntryMapping(token, map, conditions);
        }
        
    }

    /**
     * Removes the named condition from a token or tokens
     * @param {*} tokens 
     * @param {*} conditionName
     * @todo coalesce into a single update
     */
    static removeCondition(conditionName, tokens, {warn=true}={}) {
        // iterate tokens removing conditions
        if (!tokens) {
            ui.notifications.error("Remove Condition failed. No token provided");
            console.log("Combat Utility Belt - Enhanced Conditions | No token provided");
            return;
        }

        const map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        const condition = map.find(c => c.name === conditionName);

        if (!condition) {
            ui.notifications.error("Remove Condition failed. Could not find condition.");
            console.log("Combat Utility Belt - Enhanced Conditions | Could not find condition with name: ", conditionName);
            return;
        }

        const effect = condition ? condition.icon : null;
        
        if (!effect) {
            ui.notifications.error("Remove Condition failed. Could not find icon");
            console.log("Combat Utility Belt - Enhanced Conditions | No icon is setup for condition: ", conditionName);
            return;
        }
        
        if (tokens && !(tokens instanceof Array)) {
            tokens = [tokens];
        }

        for (let token of tokens) {
            if (!token?.data?.effects.includes(effect) && token?.data?.overlayEffect !== effect) {
                if (warn) {
                    ui.notifications.warn("Remove Condition failed. Condition is not active on token");
                    console.log(`Combat Utility Belt - Enhanced Conditions | Condition ${conditionName} is not active on token.`);
                }
                return;
            }

            if (token?.data?.effects.includes(effect)) {
                token.toggleEffect(effect);
            }

            if (token?.data?.overlayEffect === effect) {
                token.toggleOverlay(effect);
            }
        }
    }

    /**
     * Removes all conditions from the mapped tokens
     * @param {*} tokens 
     */
    static removeAllConditions(tokens) {
        if (!tokens) {
            ui.notifications.error("Remove Condition failed. No token/s provided");
            console.log("Combat Utility Belt - Enhanced Conditions | Remove Condition failed: No token/s provided");
            return;
        }
        const conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        
        if (!conditionMap) {
            ui.notifications.error("Remove conditions failed. There is no active Condition Map");
            console.log("Combat Utility Belt - Enhanced Conditions | Remove Condition failed: No token/s provided");
            return;
        }

        const conditionMapIcons = EnhancedConditions.getConditionIcons(conditionMap);
        const updates = [];

        if (tokens && !(tokens instanceof Array)) {
            tokens = [tokens];
        }

        for (let token of tokens) {
            const effects = token.data.effects;
            const overlay = token.data.overlayEffect;
            const matchedEffects = effects.filter(e => conditionMapIcons.includes(e));
            const matchedOverlay = conditionMapIcons.includes(overlay) ? overlay : null;
            const update = {
                _id: token.id
            }

            matchedOverlay ? update.overlayEffect = "" : null;
            matchedEffects.length ? update.effects = [] : null;

            if (hasProperty(update, "overlayEffect") || hasProperty(update, "effects")) {
                updates.push(update);
            }

            continue;
        }

        if (!updates.length) {
            return;
        }

        game.scenes.active.updateEmbeddedEntity("Token", updates);
    }
}