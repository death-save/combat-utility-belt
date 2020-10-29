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
        const cubOption = options[BUTLER.NAME] = options[BUTLER.NAME] ?? {};

        if (hasProperty(update, "actorData.effects")) {
            cubOption.existingEffects = tokenData.actorData.effects ?? [];
            cubOption.updateEffects = update.actorData.effects ?? [];
        }

        if (hasProperty(update, "overlayEffect")) {
            cubOption.existingOverlay = tokenData.overlayEffect ?? null;
            cubOption.updateOverlay = update.overlayEffect ?? null;
        }

        return true;
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
        const addUpdate = cubOption ? cubOption?.updateEffects?.length > cubOption?.existingEffects?.length : false;
        const removeUpdate = cubOption ? cubOption?.existingEffects?.length > cubOption?.updateEffects?.length : false;
        const updateEffects = [];
        
        if (addUpdate) {
            for (const e of cubOption.updateEffects) {
                if (!cubOption.existingEffects.find(x => x._id === e._id)) updateEffects.push({effect: e, type: "effect", changeType: "add"});
            }
        }
        
        if (removeUpdate) {
            for (const e of cubOption.existingEffects) {
                if (!cubOption.updateEffects.find(u => u._id === e._id)) updateEffects.push({effect: e, type: "effect", changeType: "remove"});
            }
        }

        if (!cubOption.existingOverlay && cubOption.updateOverlay) updateEffects.push({effect: cubOption.updateOverlay, type: "overlay", changeType: "add"});
        else if (cubOption.existingOverlay && !cubOption.updateOverlay) updateEffects.push({effect: cubOption.existingOverlay, type: "overlay", changeType: "remove"});

        if (!updateEffects.length) return;

        const addConditions = [];
        const removeConditions = [];

        for (const effect of updateEffects) {
            let condition = null;
            // based on the type, get the condition
            if (effect.type === "overlay") condition = EnhancedConditions.getConditionsByIcon(effect.effect) 
            else if (effect.type === "effect") {
                if (!hasProperty(effect, `effect.flags.${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.conditionId}`)) continue;
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
        if (addConditions.some(c => c?.options?.markDefeated)) EnhancedConditions._toggleDefeated(token);

        // If any of the removeConditions Marks Defeated, remove the defeated from the token's combatants
        if (removeConditions.some(c => c?.options?.markDefeated)) EnhancedConditions._toggleDefeated(token, {markDefeated: false});

        // If any of the conditions Removes Others, remove the other Conditions
        addConditions.some(c => {
            if (c?.options?.removeOthers) {
                EnhancedConditions._removeOtherConditions(token, c.id);
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

        const conditions = EnhancedConditions.getConditions(token, {warn: false});

        if (!conditions || !conditions?.conditions.length) return;

        const chatConditions = [];

        for (const condition of conditions.conditions) {
            const outputSetting = condition.options?.outputChat ?? Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat);

            if (outputSetting) {
                chatConditions.push(condition);
            }
        }

        EnhancedConditions.outputChatMessage(token, chatConditions, {type: "active"});
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

        const speaker = data.message.speaker;

        if (!speaker) return;

        const actor = game.actors.get(speaker.actor) ?? null;
        const scene = game.scenes.get(speaker.scene) ?? null;
        const token = (canvas ? canvas?.tokens.get(speaker.token) : null) ?? (scene ? scene.data.tokens.find(t => t._id === speaker.token) : null);
        const removeConditionAnchor = html.find("a[name='remove-row']");
        const undoRemoveAnchor = html.find("a[name='undo-remove']");

        if (!token || (token && !game.user.isGM)) {
            removeConditionAnchor.parent().hide();
            undoRemoveAnchor.parent().hide();
        }

        /**
         * @todo #284 move to chatlog listener instead
         */
        removeConditionAnchor.on("click", event => {
            const conditionListItem = event.target.closest("li");
            const conditionName = conditionListItem.dataset.conditionName;
            const messageListItem = conditionListItem?.parentElement?.closest("li");
            const messageId = messageListItem?.dataset?.messageId;
            const message = messageId ? game.messages.get(messageId) : null;

            if (!message) return;

            const speaker = message?.data?.speaker;

            if (!speaker) return;

            const token = canvas.tokens.get(speaker.token);
            const actor = game.actors.get(speaker.actor);
            const entity = token ?? actor;

            if (!entity) return;

            EnhancedConditions.removeCondition(conditionName, entity, {warn: false});
        });

        undoRemoveAnchor.on("click", event => {
            const conditionListItem = event.target.closest("li");
            const conditionName = conditionListItem.dataset.conditionName;
            const messageListItem = conditionListItem?.parentElement?.closest("li");
            const messageId = messageListItem?.dataset?.messageId;
            const message = messageId ? game.messages.get(messageId) : null;

            if (!message) return;

            const speaker = message?.data?.speaker;

            if (!speaker) return;

            const token = canvas.tokens.get(speaker.token);
            const actor = game.actors.get(speaker.actor);
            const entity = token ?? actor;

            if (!entity) return;

            EnhancedConditions.addCondition(conditionName, entity);
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

        if (!hasProperty(changeData, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.conditionId}`)) return;
        
        const effectId = changeData.flags[BUTLER.NAME][BUTLER.FLAGS.enhancedConditions.conditionId];

        const condition = EnhancedConditions.lookupEntryMapping(effectId);

        if (!condition) return;

        const outputSetting = condition.options.outputChat ?? Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat);
        const outputType = type === "delete" ? "removed" : "added";

        if (outputSetting) EnhancedConditions.outputChatMessage(actor, condition, {type: outputType});
        
        switch (type) {
            case "create":
                // If condition marks combatants defeated, look for matching combatant
                
                if (condition.options?.removeOthers) EnhancedConditions._removeOtherConditions(actor, condition.id);
                break;

            case "delete":
                // If condition marks combatants defeated, untoggle defeated
                if (condition.options?.markDefeated) EnhancedConditions._toggleDefeated(actor, {markDefeated: false});

            default:
                break;
        }
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

        const conditionEntries = map.filter(row => effectIds.includes(row.id ?? Sidekick.generateUniqueSlugId(row.name)));

        if (conditionEntries.length === 0) return;
        
        return conditionEntries.length > 1 ? conditionEntries : conditionEntries.shift();
    }

    /**
     * Output one or more condition entries to chat
     * @todo refactor to use actor or token
     */
    static async outputChatMessage(entity, entries, options={type: "active"}) {
        const isActorEntity = entity instanceof Actor;
        const isTokenEntity = entity instanceof Token;
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
        
        const speaker = isActorEntity ? ChatMessage.getSpeaker({actor: entity}) : ChatMessage.getSpeaker({token: entity});

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
     * @param {Actor | Token} entities  the entity to mark defeated
     * @param {Boolean} options.markDefeated  an optional state flag (default=true)
     */
    static _toggleDefeated(entities, {markDefeated=true}={}) {
        const combat = game.combat;

        if (!entities) {
            // First check for any controlled tokens
            if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
            else if (game.user.character) entities = game.user.character;
        }
        
        if (!entities) {
            return;
        }

        entities = entities instanceof Array ? entities : [entities];

        const tokens = entities.flatMap(e => e instanceof Token ? e : e instanceof Actor ? e.getActiveTokens() : null);

        const updates = [];

        // loop through tokens, and if there's matching combatants, add them to the update
        for (const token of tokens) {
            
            const combatants = combat ? game.combat?.combatants.filter(c => c.tokenId === token.id && c.defeated != markDefeated) : [];

            if (!combatants.length) return;

            const update = combatants.map(c => {
                return {
                    _id: c._id,
                    defeated: markDefeated
                }
            });

            updates.push(update);
        }

        if (!updates.length) return;

        // update all combatants at once
        combat.updateEmbeddedEntity("Combatant", updates.length > 1 ? update : updates.shift());
    }

    /**
     * For a given entity, removes conditions other than the one supplied
     * @param {*} entity 
     * @param {*} conditionId 
     */
    static async _removeOtherConditions(entity, conditionId) {
        const entityConditions = EnhancedConditions.getConditions(entity, {warn: false});
        const conditions = entityConditions ? entityConditions.conditions : [];

        if (!conditions.length) return;

        const removeConditions = conditions.filter(c => c.id !== conditionId);

        if (!removeConditions.length) return;

        for (const c of removeConditions) await EnhancedConditions.removeCondition(c.name, entity, {warn: true});
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

    /**
     * Gets one or more conditions from the map by their name
     * @param {String} conditionName  the condition to get
     * @param {Array} map  the condition map to search
     */
    static _lookupConditionByName(conditionName, map=null) {
        if (!conditionName) return;

        conditionName = conditionName instanceof Array ? conditionName : [conditionName];

        if (!map) map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        const conditions = map.filter(c => conditionName.includes(c.name)) ?? [];

        if (!conditions.length) return null;

        return conditions.length > 1 ? conditions : conditions.shift();
    }

    /**
     * Updates the CONFIG.statusEffect effects with Condition Map ones
     * @param {*} conditionMap 
     */
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

        const statusEffects = conditionMap.map((c, i, a) => {
            const existingIds = a.length ? a.filter(c => c.id).map(c => c.id) : [];
            const id = c.id ? `${BUTLER.NAME}.${c.id}` : Sidekick.generateUniqueSlugId(c.name, existingIds);
            return {
                id,
                flags: {
                    core: {
                        statusId: `${[BUTLER.NAME]}.${c.id}` ?? `${[BUTLER.NAME]}.${c.name?.slugify()}`
                    },
                    [BUTLER.NAME]: {
                        [BUTLER.FLAGS.enhancedConditions.conditionId]: c.id ?? c.name?.slugify(),
                        [BUTLER.FLAGS.enhancedConditions.overlay]: c?.options?.overlay ?? false
                    }
                },
                label: c.name,
                icon: c.icon,
                changes: c.activeEffect?.changes || [],
                duration: c.duration || {}
            }
        });

        return statusEffects.length > 1 ? statusEffects : statusEffects.shift();
    }

    /**
     * Prepares one or more ActiveEffects from Conditions for placement on an actor
     * @param {Object | Array} effects  a single ActiveEffect data object or an array of ActiveEffect data objects
     */
    static _prepareActiveEffects(effects) {
        if (!effects) return;

        for (const effect of effects) {
            const overlay = getProperty(effect, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.overlay}`);
            // If the parent Condition for the ActiveEffect defines it as an overlay, mark the ActiveEffect as an overlay
            if (overlay) {
                effect.flags.core.overlay = overlay;
            }
        }
        
        return effects;
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

    /* -------------------------------------------- */
    /*                      API                     */
    /* -------------------------------------------- */

    /**
     * Applies the named condition to the provided entities (Actors or Tokens)
     * @param {Actor | Token} entities  one or more Actors or Tokens to apply the Condition to
     * @param {String} conditionName  the name of the condition to add
     * @param {Boolean} options.warn  raise warnings on errors
     * @example
     * // Add the Condition "Blinded" to an Actor named "Bob"
     * game.cub.addCondition("Blinded", game.actors.getName("Bob"));
     * @example
     * // Add the Condition "Charmed" to the currently controlled Token/s
     * game.cub.addCondition("Charmed");
     */
    static async addCondition(conditionName, entities=null, {warn=true}={}) {
        if (!entities) {
            // First check for any controlled tokens
            if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
            else if (game.user.character) entities = game.user.character;
        }
        
        if (!entities) {
            ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.ApplyCondition.Failed.NoToken"));
            console.log(`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.ApplyCondition.Failed.NoToken")}`);
            return;
        }

        let conditions = EnhancedConditions._lookupConditionByName(conditionName);
        
        if (!conditions) {
            ui.notifications.error(`${game.i18n.localize("ENHANCED_CONDITIONS.ApplyCondition.Failed.NoCondition")} ${conditionName}`);
            console.log(`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.ApplyCondition.Failed.NoCondition")}`, conditionName);
            return;
        }

        conditions = conditions instanceof Array ? conditions : [conditions];
        const conditionNames = conditions.map(c => c.name);

        let effects = EnhancedConditions.getActiveEffect(conditions);
        
        if (!effects) {
            ui.notifications.error(`${game.i18n.localize("ENHANCED_CONDTIONS.ApplyCondition.Failed.NoEffect")} ${conditions}`);
            console.log(`Combat Utility Belt - Enhanced Condition | ${game.i18n.localize("ENHANCED_CONDTIONS.ApplyCondition.Failed.NoEffect")}`, conditions);
            return;
        }

        effects = effects instanceof Array ? EnhancedConditions._prepareActiveEffects(effects) : EnhancedConditions._prepareActiveEffects([effects]);
        
        if (entities && !(entities instanceof Array)) {
            entities = [entities];
        }

        for (let entity of entities) {
            const actor = entity instanceof Actor ? entity : entity instanceof Token ? entity.actor : null;
            const existingConditions = EnhancedConditions.hasCondition(conditionNames, actor, {warn: false});

            if (existingConditions) {
                if (warn) {
                    ui.notifications.warn(`${entity.name}: ${conditionName} ${game.i18n.localize("ENHANCED_CONDITIONS.ApplyCondition.Failed.AlreadyActive")}`);
                    console.log(`Combat Utility Belt - Enhanced Conditions | ${entity.name}: ${conditionName} ${game.i18n.localize("ENHANCED_CONDITIONS.ApplyCondition.Failed.AlreadyActive")}`);
                }
                continue;
            }

            if (conditions.some(c => c?.options?.removeOthers)) {
                await EnhancedConditions.removeAllConditions(actor, {warn: false});
            }

            const createData = effects;

            await actor.createEmbeddedEntity("ActiveEffect", createData);
        }
        
    }

    /**
     * Gets a condition by name from the Condition Map
     * @param {*} conditionName 
     * @param {*} map 
     * @param {*} options.warn 
     */
    static getCondition(conditionName, map=null, {warn=false}={}) {
        if (!conditionName) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.GetCondition.Failed.NoCondition"));
        }

        if (!map) map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        return EnhancedConditions._lookupConditionByName(conditionName, map);
    }

    /**
     * Retrieves all active conditions for one or more given entities (Actors or Tokens)
     * @param {Actor | Token} entities  one or more Actors or Tokens to get Conditions from
     * @param {Boolean} options.warn  output notifications
     * @returns {Array} entityConditionMap  a mapping of conditions for each provided entity
     * @example
     * // Get conditions for an Actor named "Bob"
     * game.cub.getConditions(game.actors.getName("Bob"));
     * @example
     * // Get conditions for the currently controlled Token
     * game.cub.getConditions();
     */
    static getConditions(entities=null, {warn=true}={}) {
        if (!entities) {
            // First check for any controlled tokens
            if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;

            // Then check if the user has an assigned character
            else if (game.user.character) entities = game.user.character;
        }
        

        if (!entities) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.GetConditions.Failed.NoToken"));
            console.log(`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.GetConditions.Failed.NoToken")}`);
            return;
        }

        const map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        if (!map || !map.length) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.GetConditions.Failed.NoCondition"));
            console.log(`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.GetConditions.Failed.NoCondition")}`);
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

            const effectIds = effects instanceof Array ? effects.map(e => e.getFlag(BUTLER.NAME, BUTLER.FLAGS.enhancedConditions.conditionId)) : effects.getFlag(BUTLER.NAME, BUTLER.FLAGS.enhancedConditions.conditionId);

            if (!effectIds.length) continue;

            const entityConditions = {
                entity: entity, 
                conditions: EnhancedConditions.lookupEntryMapping(effectIds)
            };

            results.push(entityConditions);
        }
        
        if (!results.length) {
            if (warn) ui.notifications.notify(game.i18n.localize("ENHANCED_CONDITIONS.GetConditions.Failed.NoResults"));
            console.log(`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.GetConditions.Failed.NoResults")}`);
            return null;
        }

        return results.length > 1 ? results : results.shift();
    }

    /**
     * Gets the Active Effect data (if any) for the given condition
     * @param {*} condition 
     */
    static getActiveEffect(condition) {
        return EnhancedConditions._prepareStatusEffects(condition);
    }

    /**
     * Gets any Active Effect instances present on the entities (Actor/s or Token/s) that are mapped Conditions
     * @param {String} entities  the entities to check
     * @param {Array} map  the Condition map to check (optional)
     * @param {Boolean} warn  output notifications
     * @returns {Map | Object} A Map containing the Actor Id and the Condition Active Effect instances if any
     */
    static getConditionEffects(entities, map=null, {warn=true}={}) {
        if (!entities) {
            // First check for any controlled tokens
            if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
            else if (game.user.character) entities = game.user.character;
        }
        
        if (!entities) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.GetConditionEffects.Failed.NoEntity"));
            console.log(`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoToken")}`);
            return;
        }

        entities = entities instanceof Array ? entities : [entities];

        if (!map) map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        let results = new Collection();

        for (const entity of entities) {
            const actor = entity instanceof Actor ? entity : entity instanceof Token ? entity.actor : null;
            const activeEffects = actor.effects.entries;

            if (!activeEffects.length) continue;
            
            const conditionEffects = activeEffects.filter(ae => ae.getFlag(BUTLER.NAME, BUTLER.FLAGS.enhancedConditions.conditionId));

            if (!conditionEffects.length) continue;

            results.set(entity.id, conditionEffects.length > 1 ? conditionEffects : conditionEffects.shift());
        }

        if (!results.size) return null;

        return results.size > 1 ? results : results.values().next().value;
    }

    /**
     * Checks if the provided Entity (Actor or Token) has the given condition
     * @param {String | Array} conditionName  the name/s of the condition or conditions to check for
     * @param {Actor | Token | Array} entities  the entity or entities to check (Actor/s or Token/s)
     * @param {Boolean} options.warn  output notifications
     * @returns {Boolean} hasCondition  Returns true if one or more of the provided entities has one or more of the provided conditions
     * @example
     * // Check for the "Blinded" condition on Actor "Bob"
     * game.cub.hasCondition("Blinded", game.actors.getName("Bob"));
     * @example
     * // Check for the "Charmed" and "Deafened" conditions on the controlled tokens
     * game.cub.hasCondition(["Charmed", "Deafened"]);
     */
    static hasCondition(conditionName, entities=null, {warn=true}={}) {
        if (!conditionName) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.HasCondition.Failed.NoCondition"));
            console.log(`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.HasCondition.Failed.NoCondition")}`);
            return false;
        }

        if (!entities) {
            // First check for any controlled tokens
            if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;

            // Then check if the user has an assigned character
            else if (game.user.character) entities = game.user.character;
        }

        if (!entities) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.HasCondition.Failed.NoToken"));
            console.log(`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.HasCondition.Failed.NoToken")}`);
            return false;
        }

        entities = entities instanceof Array ? entities : [entities];

        let conditions = EnhancedConditions._lookupConditionByName(conditionName);

        if (!conditions) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.HasCondition.Failed.NoMapping"));
            console.log(`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoMapping")}`);
            return false;
        }

        conditions = EnhancedConditions._prepareStatusEffects(conditions);
        conditions = conditions instanceof Array ? conditions : [conditions];

        for (let entity of entities) {
            const actor = entity instanceof Actor ? entity : entity instanceof Token ? entity.actor : null;

            if (!actor.effects.size) continue;

            const conditionEffect = actor.effects.entries.some(ae => {
                return conditions.some(e => e?.flags[BUTLER.NAME][BUTLER.FLAGS.enhancedConditions.conditionId] === ae.getFlag(BUTLER.NAME, BUTLER.FLAGS.enhancedConditions.conditionId));
            });

            if (conditionEffect) return true;
        }

        return false;
    }

    /**
     * Removes one or more named conditions from an Entity (Actor/Token)
     * @param {Actor | Token} entities  One or more Actors or Tokens
     * @param {String} conditionName  the name of the Condition to remove
     * @param {Object} options  options for removal
     * @param {Boolean} options.warn  whether or not to raise warnings on errors
     * @example 
     * // Remove Condition named "Blinded" from an Actor named Bob
     * game.cub.removeCondition("Blinded", game.actors.getName("Bob"));
     * @example 
     * // Remove Condition named "Charmed" from the currently controlled Token, but don't show any warnings if it fails.
     * game.cub.removeCondition("Charmed", {warn=false});
     */
    static async removeCondition(conditionName, entities=null, {warn=true}={}) {
        if (!entities) {
            // First check for any controlled tokens
            if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
            else if (game.user.character) entities = game.user.character;
            else entities = null;
        }
        

        if (!entities) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoToken"));
            console.log(`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoToken")}`);
            return;
        }

        if (!(conditionName instanceof Array)) conditionName = [conditionName];

        const conditions = EnhancedConditions._lookupConditionByName(conditionName);

        if (!conditions || (conditions instanceof Array && !conditions.length)) {
            if (warn) ui.notifications.error(`${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoCondition")} ${conditionName}`);
            console.log(`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoCondition")}`, conditionName);
            return;
        }

        let effects = EnhancedConditions.getActiveEffect(conditions);

        if (!effects) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDTIONS.RemoveCondition.Failed.NoEffect"));
            console.log(`Combat Utility Belt - Enhanced Condition | ${game.i18n.localize("ENHANCED_CONDTIONS.RemoveCondition.Failed.NoEffect")}`, condition);
            return;
        }

        if (!(effects instanceof Array)) effects = [effects];
        
        if (entities && !(entities instanceof Array)) entities = [entities];

        for (let entity of entities) {
            const actor = entity instanceof Actor ? entity : entity instanceof Token ? entity.actor : null;
            const activeEffects = actor.effects.entries.filter(e => effects.map(e => e.flags[BUTLER.NAME].conditionId).includes(e.getFlag(BUTLER.NAME, BUTLER.FLAGS.enhancedConditions.conditionId)));

            if (!activeEffects || (activeEffects && !activeEffects.length)) {
                if (warn) ui.notifications.warn(`${conditionName} ${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NotActive")}`);
                console.log(`Combat Utility Belt - Enhanced Conditions | ${conditionName} ${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NotActive")}")`);
                return;
            }

            const effectIds = activeEffects.map(e => e.id);

            await actor.deleteEmbeddedEntity("ActiveEffect", effectIds);
        }
    }

    /**
     * Removes all conditions from the provided entities
     * @param {Actors | Tokens} entities  One or more Actors or Tokens to remove Conditions from
     * @param {Boolean} options.warn  output notifications
     * @example 
     * // Remove all Conditions on an Actor named Bob
     * game.cub.removeAllConditions(game.actors.getName("Bob"));
     * @example
     * // Remove all Conditions on the currently controlled Token
     * game.cub.removeAllConditions();
     */
    static async removeAllConditions(entities=null, {warn=true}={}) {
        if (!entities) {
            // First check for any controlled tokens
            if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
            else if (game.user.character) entities = game.user.character;
        }
        
        if (!entities) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoToken"));
            console.log(`Combat Utility Belt - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoToken")}`);
            return;
        }

        entities = entities instanceof Array ? entities : [entities];

        for (let entity of entities) {
            const actor = entity instanceof Actor ? entity : entity instanceof Token ? entity.actor : null;

            let actorConditionEffects = EnhancedConditions.getConditionEffects(actor, {warn: false});

            if (!actorConditionEffects) continue;

            actorConditionEffects = actorConditionEffects instanceof Array ? actorConditionEffects : [actorConditionEffects];

            const effectIds = actorConditionEffects.map(ace => ace.id);

            await actor.deleteEmbeddedEntity("ActiveEffect", effectIds);
        }
    }
}