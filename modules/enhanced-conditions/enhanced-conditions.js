import * as BUTLER from "../butler.js";
import { ConditionLab } from "./condition-lab.js";
import { Sidekick } from "../sidekick.js";

/**
 * Builds a mapping between status icons and journal entries that represent conditions
 */
export class EnhancedConditions {


    /* -------------------------------------------- */
    /*                   Handlers                   */
    /* -------------------------------------------- */

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
                const storedMaps = await EnhancedConditions._loadDefaultMaps();
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
                const preparedMap = EnhancedConditions._prepareMap(conditionMap);
                Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, preparedMap);
            }
        }

        // If the gadget is enabled, update status icons accordingly
        if (enable) {
            if (game.user.isGM) {
                EnhancedConditions._backupCoreEffects();
            }

            EnhancedConditions._updateStatusEffects(conditionMap);
        }

        // Save the active condition map to a convenience property
        if (game.cub) {
            game.cub.conditions = conditionMap;
        }
    }

    /**
     * Handle PreUpdate Token Hook.
     * If the update includes effect data, add an `option` for the update hook handler to look for
     * @param {*} scene 
     * @param {*} tokenData 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    static _onPreUpdateToken(scene, tokenData, update, options, userId) {
        const cubOption = options[BUTLER.NAME] = {};

        if (hasProperty(update, "actorData.effects")) {
            cubOption.existingEffects = tokenData.actorData.effects ?? [];
            cubOption.updateEffects = update.actorData.effects ?? [];
        }

        if (hasProperty(update, "overlayEffect")) {
            cubOption.existingOverlay = tokenData.overlayEffect ?? null;
            cubOption.updateOverlay = update.overlayEffect ?? null;
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

        if (!hasProperty(options, `${BUTLER.NAME}`)) return;

        const cubOption = options[BUTLER.NAME];
        const updateEffects = [];
        
        for (const e of cubOption.updateEffects) {
            if (!cubOption.existingEffects.includes(e)) updateEffects.push({effect: e, type: "effect", changeType: "add"});
        }

        for (const e of cubOption.existingEffects) {
            if (!cubOption.updateEffects.includes(e)) updateEffects.push({effect: e, type: "effect", changeType: "remove"});
        }

        if (!cubOption.existingOverlay && cubOption.updateOverlay) updateEffects.push({effect: updateOverlay, type: "overlay", changeType: "add"});
        else if (cubOption.existingOverlay && !cubOption.updateOverlay) updateEffects.push({effect: existingOverlay, type: "overlay", changeType: "remove"});

        if (!updateEffects.length) return;

        const addConditions = [];
        const removeConditions = [];

        for (const effect of updateEffects) {
            let condition = null;
            // based on the type, get the condition
            if (effect.type === "overlay") condition = EnhancedConditions.getConditionsByIcon(effect.effect) 
            else if (effect.type === "effect") {
                const effectId = effect.effect.flags[BUTLER.NAME][BUTLER.FLAGS.enhancedConditions.conditionId];
                condition = EnhancedConditions.lookupEntryMapping(effectId);
            }

            if (!condition) continue;

            if (effect.changeType === "add") addConditions.push(condition);
            else if (effect.changeType === "remove") removeConditions.push(condition);
        }

        if (!addConditions.length && !removeConditions.length) return;

        const token = canvas.tokens.get(tokenData._id);
        const outputChatSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat);

        // If any of the addConditions Marks Defeated, mark the token's combatants defeated
        if (addConditions.some(c => c.options.markDefeated)) EnhancedConditions._markDefeated(token);

        // If any of the conditions Removes Others, remove the other Conditions
        addConditions.some(c => {
            if (c.options.removeOthers) {
                EnhancedConditions._removeOtherConditions(token, c);
                return true;
            }
        });

        const chatAddConditions = addConditions.filter(c => c.options?.outputChat ?? outputChatSetting);
        const chatRemoveConditions = removeConditions.filter(c => c.options?.outputChat ?? outputChatSetting);
        
        // If there's any conditions to output to chat, do so
        if (chatAddConditions.length) EnhancedConditions.outputChatMessage(token, chatAddConditions, {type: "added"});
        if (chatRemoveConditions.length) EnhancedConditions.outputChatMessage(token, chatRemoveConditions, {type: "removed"});
    }

    /**
     * Create Active Effect handler
     * @param {*} actor 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    static _onCreateActiveEffect(actor, createData, options, userId) {
        const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

        if (!enable || !game.user.isGM || (game.users.get(userId).isGM && game.userId !== userId)) {
            return;
        }

        EnhancedConditions._processActiveEffectChange(actor, createData, "create");
    }

    /**
     * Create Active Effect handler
     * @param {*} actor 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    static _onDeleteActiveEffect(actor, deleteData, options, userId) {
        const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

        if (!enable || !game.user.isGM || (game.users.get(userId).isGM && game.userId !== userId)) {
            return;
        }

        EnhancedConditions._processActiveEffectChange(actor, deleteData, "delete");
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

        const effects = token.actor.effects.size ? token.actor.effects.entries : [];
        const overlayCondition = token.data.overlayEffect ? EnhancedConditions.getConditionsByIcon(token.data.overlayEffect) : null;
        
        if (overlayCondition) {
            effects.push({label: overlayCondition.name});
        }

        if (!effects.length) {
            return;
        }

        const conditionIds = effects.map(e => e?.data?.flags?.core?.statusId);
        const conditions = EnhancedConditions.lookupEntryMapping(conditionIds) || [];

        if (!conditions.length) return;

        const chatConditions = [];

        for (const condition of conditions) {
            const outputSetting = condition.options.outputChat ?? Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat);

            if (outputSetting) {
                chatConditions.push(condition);
            }
        }

        EnhancedConditions.outputChatMessage(token, chatConditions, {type: "active"});
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
        const token = canvas?.tokens.get(tokenId) || canvas.scene.data.tokens.find(t => t._id === tokenId);
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

    /* -------------------------------------------- */
    /*                    Workers                   */
    /* -------------------------------------------- */

    /**
     * 
     * @param {*} actor  the entity
     * @param {*} update  the update data
     * @param {String} type  the type of change to process
     */
    static _processActiveEffectChange(actor, changeData, type) {
        const effectId = changeData.flags[BUTLER.NAME][BUTLER.FLAGS.enhancedConditions.conditionId];

        const [condition] = EnhancedConditions.lookupEntryMapping(effectId);

        if (!condition) return;

        const outputSetting = condition.options.outputChat ?? Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat);

        const outputType = type === "delete" ? "removed" : "added";

        if (outputSetting) EnhancedConditions.outputChatMessage(actor, condition, {type: outputType});
        
        // If condition marks combatants defeated, look for matching combatant
        if (type === "create" && condition.options?.markDefeated) EnhancedConditions._markDefeated(actor);
    }

    /**
     * Checks statusEffect icons against map and returns matching condition mappings
     * @param {Array | String} effectIds  A list of effectIds, or a single effectId to check
     * @param {Array} [map=[]]  the condition map to look in
     */
    static lookupEntryMapping(effectIds, map=[]) {
        if (!(effectIds instanceof Array)) {
            effectIds = [effectIds];
        }

        if (!map.length) {
            map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
            if (!map.length) return null;
        }

        const conditionEntries = map.filter(row => effectIds.includes(row.id ?? row.name.slugify()));

        if (conditionEntries.length === 0) {
            return;
        }
        
        return conditionEntries.length > 1 ? conditionEntries : conditionEntries.shift();
    }

    /**
     * Output one or more condition entries to chat
     * @todo refactor to use actor or token
     */
    static async outputChatMessage(entity, entries, options={type: "active"}) {
        // Turn a single condition mapping entry into an array
        entries = entries instanceof Array ? entries : [entries];

        const type = {};

        switch (options.type) {
            case "added":
                type.added = true;
                break;

            case "removed":
                type.removed = true;
                break;

            case "active":
            default:
                type.active = true;
                break;
        }

        const chatUser = game.userId;
        //const token = token || this.currentToken;
        const chatType = CONST.CHAT_MESSAGE_TYPES.OTHER;

        let speaker = ChatMessage.getSpeaker({entity});

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
            type,
            entityId: entity.id,
            alias: speaker.alias,
            conditions: entries,
            isOwner: entity.owner || game.user.isGM
        };

        const content = await renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.chatOutput, templateData);

        return await ChatMessage.create({
            speaker,
            content,
            type: chatType,
            user: chatUser
        });
    }

    /**
     * Marks a Combatants for a particular entity as defeated
     * @param {Actor | Token} entity 
     */
    static _markDefeated(entity) {
        const combat = game.combat;
        let tokens;

        if (entity instanceof Token) {
            tokens = [entity];
        }

        if (entity instanceof Actor) {
            tokens = entity.getActiveTokens();
        }

        const updates = [];

        // loop through tokens, and if there's matching combatants, add them to the update
        for (const t of tokens) {
            const combatants = combat ? game.combat?.combatants.filter(c => c.tokenId === t.id) : [];

            if (!combatants.length) {
                return;
            }

            const update = combatants.map(c => {
                return {
                    _id: c._id,
                    defeated: true
                }
            });

            updates.push(update);
        }

        if (!updates.length) return;

        // update all combatants at once
        combat.updateEmbeddedEntity("Combatant", updates);
    }

    /**
     * For a given entity, removes conditions other than the one supplied
     * @param {*} entity 
     * @param {*} condition 
     */
    _removeOtherConditions(entity, condition) {
        
    }

    /* -------------------------------------------- */
    /*                    Helpers                   */
    /* -------------------------------------------- */

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

        labButton.on("click", event => game.cub.conditionLab = new ConditionLab().render(true));
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
     * Returns the default maps supplied with the module
     * 
     * @todo: map to entryId and then rebuild on import
     */
    static async _loadDefaultMaps() {
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
     * Parse the provided Condition Map and prepare it for storage, validating and correcting bad or missing data where possible
     * @param {*} conditionMap 
     */
    static _prepareMap(conditionMap) {
        if (!conditionMap.length) return;

        const preparedMap = duplicate(conditionMap);

        // Map existing ids for ease of access
        const existingIds = conditionMap.map(c => c.id);

        // Iterate through the map validating and fixing the data
        preparedMap.forEach(c => {
            c.id = c.id || Sidekick.generateUniqueSlugId(c.name, existingIds);
            c.options = c.options || {};
        });

        return preparedMap;
    }

    /**
     * Duplicate the core status icons, freeze the duplicate then store a copy in settings
     */
    static _backupCoreEffects() {
        CONFIG.defaultStatusEffects = CONFIG.defaultStatusEffects || duplicate(CONFIG.statusEffects);
        if (!Object.isFrozen(CONFIG.defaultStatusEffects)) {
            Object.freeze(CONFIG.defaultStatusEffects);
        }
        Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreEffects, CONFIG.defaultStatusEffects);
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

    static _updateStatusEffects(conditionMap) {
        const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

        if (!enable) {
            // maybe restore the core icons?
            return;
        }

        let entries;
        const coreEffectsSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreEffects);

        //save the original icons
        if (!coreEffectsSetting.length) {
            EnhancedConditions._backupCoreEffects();
        }

        const removeDefaultEffects = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.removeDefaultEffects);
        const activeConditionMap = conditionMap || Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        if (!removeDefaultEffects && !activeConditionMap) {
            return;
        }

        const activeConditionEffects = EnhancedConditions._prepareStatusEffects(activeConditionMap);

        if (removeDefaultEffects) {
            return CONFIG.statusEffects = activeConditionEffects ?? [];
        } 
        
        if (activeConditionMap instanceof Array) {
            //add the icons from the condition map to the status effects array
            const coreEffects = CONFIG.defaultStatusEffects || Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreEffects);

            // Create a Set based on the core status effects and the Enhanced Condition effects. Using a Set ensures unique icons only
            return CONFIG.statusEffects = coreEffects.concat(activeConditionEffects);
        }
    }

    /**
     * Converts the given Condition Map (one or more Conditions) into a Status Effects array or object
     * @param {Array | Object} conditionMap 
     * @returns {Array} statusEffects
     */
    static _prepareStatusEffects(conditionMap) {
        conditionMap = conditionMap instanceof Array ? conditionMap : [conditionMap];

        if (!conditionMap.length) return;

        const statusEffects = conditionMap.map(c => {
            return {
                id: c.id ?? c.name?.slugify(),
                flags: {
                    [BUTLER.NAME]: {
                        [BUTLER.FLAGS.enhancedConditions.conditionId]: c.id ?? c.name?.slugify()
                    }
                },
                label: c.name,
                icon: c.icon,
                data: c.activeEffect?.data || [],
                duration: c.duration || {}
            }
        });

        return statusEffects.length > 1 ? statusEffects : statusEffects.shift();
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

    /* -------------------------------------------- */
    /*                      API                     */
    /* -------------------------------------------- */

    /**
     * Parses a condition map JSON and returns a map
     * @param {*} json 
     */
    static mapFromJson(json) {
        if (json.system !== game.system.id) {
            ui.notifications.warn(game.i18n.localize("ENHANCED_CONDITIONS.MapMismatch"));
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
     * @todo #281 update for active effects
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
     * Applies the named condition to the provided entities
     * @param {*} tokens
     * @param {*} conditionName
     * @todo coalesce into a single update
     */
    static async applyCondition(conditionName, entities=null, {warn=true}={}) {
        if (!entities) {
            // First check for any controlled tokens
            if (canvas?.tokens?.controlled) entities = canvas.tokens.controlled;
            else if (game.user.character) entities = game.user.character;
            else entities = null;
        }
        

        if (!entities) {
            ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.ApplyCondition.Failed.NoToken"));
            console.log("Combat Utility Belt - Enhanced Conditions | No token provided");
            return;
        }

        const condition = EnhancedConditions.getConditionByName(conditionName);

        if (!condition) {
            ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.ApplyCondition.Failed.NoCondition"));
            console.log("Combat Utility Belt - Enhanced Conditions | Could not find condition with name: ", conditionName);
            return;
        }

        const effect = EnhancedConditions.getActiveEffect(condition);

        if (!effect) {
            ui.notifications.error(game.i18n.localize("ENHANCED_CONDTIONS.ApplyCondition.Failed.NoEffect"));
            console.log("Combat Utility Belt - Enhanced Condition | Cound not find effect matching condition: ", condition);
            return;
        }
        
        if (entities && !(entities instanceof Array)) {
            entities = [entities];
        }

        for (let entity of entities) {
            const actor = entity instanceof Actor ? entity : entity instanceof Token ? entity.actor : null;

            if (actor.effects.get(effect?.id)) {
                if (warn) {
                    ui.notifications.warn(game.i18n.localize("ENHANCED_CONDITIONS.ApplyCondition.Failed.AlreadyActive"));
                    console.log(`Combat Utility Belt - Enhanced Conditions | Condition ${conditionName} is already active on token.`);
                }
                return;
            }

            if (condition?.options?.removeOthers) {
                await actor.update({"effects": []});
            }

            await actor.createEmbeddedEntity("ActiveEffect", effect);
        }
        
    }

    /**
     * Gets a condition from the map by its name
     * @param {*} conditionName 
     */
    static getConditionByName(conditionName, map=[]) {
        if (!conditionName) return;

        if (!map.length) map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        const condition = map.find(c => c.name === conditionName) ?? null;

        return condition;
    }

    /**
     * Retrieves all active conditions for the given tokens
     * @param {*} tokens 
     */
    static getConditions(entities=null) {
        if (!entities) {
            // First check for any controlled tokens
            if (canvas?.tokens?.controlled) entities = canvas.tokens.controlled;

            // Then check if the user has an assigned character
            else if (game.user.character) entities = game.user.character;
        }
        

        if (!entities) {
            ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.ApplyCondition.Failed.NoToken"));
            console.log("Combat Utility Belt - Enhanced Conditions | No token provided");
            return;
        }

        const map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        if (!map || !map.length) {
            ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.GetConditions.Failed.NoCondition"));
            console.log("Combat Utility Belt - Enhanced Conditions | Get Conditions failed. No Condition Map found");
            return;
        }

        if (!(entities instanceof Array)) {
            entities = [entities];
        }

        const results = [];

        for (let entity of entities) {
            const actor = entity instanceof Actor ? entity : entity instanceof Token ? entity.actor : null;

            const effects = actor.effects.entries;

            if (!effects) continue;

            const effectIds = effects instanceof Array ? effects.map(e => e.data?.flags?.core?.statusId) : effects.data?.flags?.core?.statusId;

            if (!effectIds.length) continue;

            const entityConditions = {
                entity: entity, 
                conditions: EnhancedConditions.lookupEntryMapping(effectIds)
            };

            results.push(entityConditions);
        }
        
        return results.length > 1 ? results : results.length ? results.shift() : null;
    }

    /**
     * Checks if the provided token or tokens has the given condition
     * @param {*} condition 
     * @param {*} tokens 
     */
    static hasCondition(condition, tokens=null) {
        if (!condition) {
            ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoCondition"));
            console.log("Combat Utility Belt - Enhanced Conditions | No condition provided");
            return false;
        }

        tokens = tokens ? tokens : canvas?.tokens?.controlled?.length ? canvas.tokens.controlled : null;

        if (!tokens) {
            ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoToken"));
            console.log("Combat Utility Belt - Enhanced Conditions | No token provided");
            return false;
        }

        const conditionIcons = EnhancedConditions.getIconsByCondition(condition) || [];

        if (!conditionIcons.length) {
            ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoMapping"));
            console.log("Combat Utility Belt - Enhanced Conditions | No condition mapping");
            return false;
        }

        if (tokens && !(tokens instanceof Array)) {
            tokens = [tokens];
        }

        for (let token of tokens) {
            if (token.data.effects.some(e => conditionIcons.includes(e)) || conditionIcons.includes(token.data.overlayEffect)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Removes the named condition from a token or tokens
     * @param {*} tokens 
     * @param {*} conditionName
     * @todo coalesce into a single update
     */
    static async removeCondition(conditionName, tokens=null, {warn=true}={}) {
        tokens = tokens ? tokens : canvas?.tokens?.controlled?.length ? canvas.tokens.controlled : null;

        // iterate tokens removing conditions
        if (!tokens) {
            ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoToken"));
            console.log("Combat Utility Belt - Enhanced Conditions | No token provided");
            return;
        }

        const map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        const condition = map.find(c => c.name === conditionName);

        if (!condition) {
            ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoCondition"));
            console.log("Combat Utility Belt - Enhanced Conditions | Could not find condition with name: ", conditionName);
            return;
        }

        const effect = condition ? condition.icon : null;
        
        if (!effect) {
            ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoIcon"));
            console.log("Combat Utility Belt - Enhanced Conditions | No icon is setup for condition: ", conditionName);
            return;
        }
        
        if (tokens && !(tokens instanceof Array)) {
            tokens = [tokens];
        }

        for (let token of tokens) {
            if (!token?.data?.effects.includes(effect) && token?.data?.overlayEffect !== effect) {
                if (warn) {
                    ui.notifications.warn(game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NotActive"));
                    console.log(`Combat Utility Belt - Enhanced Conditions | Condition ${conditionName} is not active on token.`);
                }
                return;
            }

            if (token?.data?.effects.includes(effect)) {
                await token.toggleEffect(effect);
            }

            if (token?.data?.overlayEffect === effect) {
                await token.toggleOverlay(effect);
            }
        }
    }

    /**
     * Removes all conditions from the mapped tokens
     * @param {*} tokens 
     */
    static removeAllConditions(tokens=null) {
        tokens = tokens ? tokens : canvas?.tokens?.controlled?.length ? canvas.tokens.controlled : null;

        if (!tokens) {
            ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.RemoveAllConditions.Failed.NoToken"));
            console.log("Combat Utility Belt - Enhanced Conditions | Remove Condition failed: No token/s provided");
            return;
        }
        const conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        
        if (!conditionMap) {
            ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.RemoveAllConditions.Failed.NoCondition"));
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

    /**
     * Gets the Active Effect data (if any) for the given condition
     * @param {*} condition 
     */
    static getActiveEffect(condition) {
        return EnhancedConditions._prepareStatusEffects(condition);
    }
}