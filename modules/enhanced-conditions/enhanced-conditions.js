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
     * Steps:
     * 1. Get default maps
     * 2. Get mapType
     * 3. Get Condition Map
     * 4. Override status effects
     */
    static async _onReady() {
        game.cub.enhancedConditions.supported = false;
        const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

        // Return early if gadget not enabled
        if (!enable) return;

        if (CONFIG.statusEffects.length && typeof CONFIG.statusEffects[0] == "string") {
            console.warn(game.i18n.localize(`ENHANCED_CONDITIONS.SimpleIconsNotSupported`));           
            return;
        }

        let defaultMaps = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMaps);
        let conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        const system = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.system);
        const mapType = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType);
        const defaultMapType = Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.default);

        // If there's no defaultMaps or defaultMaps doesn't include game system, check storage then set appropriately
        if (!defaultMaps || (defaultMaps instanceof Object && Object.keys(defaultMaps).length === 0) || (defaultMaps instanceof Object && !Object.keys(defaultMaps).includes(system))) {
            if (game.user.isGM) {
                defaultMaps = await EnhancedConditions._loadDefaultMaps();
                Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMaps, defaultMaps);
            }
        }

        // If map type is not set and a default map exists for the system, set maptype to default
        if (!mapType && (defaultMaps instanceof Object && Object.keys(defaultMaps).includes(system))) {
            
            Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType, defaultMapType);
        }

        // If there's no condition map, get the default one
        if (!conditionMap.length) {
            // Pass over defaultMaps since the storage version is still empty
            conditionMap = EnhancedConditions.getDefaultMap(system, defaultMaps);

            if (game.user.isGM) {
                const preparedMap = EnhancedConditions._prepareMap(conditionMap);

                if (preparedMap?.length) {
                    conditionMap = preparedMap?.length ? preparedMap : conditionMap;
                    Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, preparedMap);
                }
            }
        }

        // If map type is not set, now set to default
        if (!mapType && conditionMap.length) {
            Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType, defaultMapType);
        }

        // If the gadget is enabled, update status icons accordingly
        if (enable) {
            if (game.user.isGM) {
                EnhancedConditions._backupCoreEffects();
                EnhancedConditions._backupCoreSpecialStatusEffects();
                // If the reminder is not suppressed, advise users to save the Condition Lab
                const suppressPreventativeSaveReminder = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.suppressPreventativeSaveReminder);
                if (!suppressPreventativeSaveReminder) {
                    EnhancedConditions._preventativeSaveReminder();
                }
            }
            const specialStatusEffectMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.specialStatusEffectMapping);
            if (conditionMap.length) EnhancedConditions._updateStatusEffects(conditionMap);
            if (specialStatusEffectMap) foundry.utils.mergeObject(CONFIG.specialStatusEffects, specialStatusEffectMap);
            setInterval(EnhancedConditions.updateConditionTimestamps, 15000);
        }

        // Save the active condition map to a convenience property
        if (game.cub) {
            game.cub.conditions = conditionMap;
        }

        game.cub.enhancedConditions.supported = true;
    }

    /**
     * Handle PreUpdate Token Hook.
     * If the update includes effect data, add an `option` for the update hook handler to look for
     * @param {*} scene 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    static _onPreUpdateToken(token, update, options, userId) {
        const cubOption = options[BUTLER.NAME] = options[BUTLER.NAME] ?? {};

        if (hasProperty(update, "actorData.effects")) {
            cubOption.existingEffects = token.actorData.effects ?? [];
            cubOption.updateEffects = update.actorData.effects ?? [];
        }

        if (hasProperty(update, "overlayEffect")) {
            cubOption.existingOverlay = token.overlayEffect ?? null;
            cubOption.updateOverlay = update.overlayEffect ?? null;
        }

        return true;
    }

    /**
     * Hooks on token updates. If the update includes effects, calls the journal entry lookup
     */
    static _onUpdateToken(token, update, options, userId) {
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

        const chatAddConditions = addConditions.filter(c => outputChatSetting && c.options?.outputChat);
        const chatRemoveConditions = removeConditions.filter(c => outputChatSetting && c.options?.outputChat);
        
        // If there's any conditions to output to chat, do so
        if (chatAddConditions.length) EnhancedConditions.outputChatMessage(token, chatAddConditions, {type: "added"});
        if (chatRemoveConditions.length) EnhancedConditions.outputChatMessage(token, chatRemoveConditions, {type: "removed"});

        // process macros
        const addMacroIds = addConditions.flatMap(c => c.macros?.filter(m => m.id && m.type === "apply").map(m => m.id));
        const removeMacroIds = removeConditions.flatMap(c => c.macros?.filter(m => m.id && m.type === "remove").map(m => m.id));
        const macroIds = [...addMacroIds, ...removeMacroIds];
        if (macroIds.length) EnhancedConditions._processMacros(macroIds, token);
    }

    /**
     * Create Active Effect handler
     * @param {*} actor 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    static _onCreateActiveEffect(effect, options, userId) {
        const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

        if (!enable || !game.user.isGM || (game.users.get(userId).isGM && game.userId !== userId)) {
            return;
        }

        const actor = effect.parent;

        // Handled in Token Update handler
        if (actor?.isToken) return;

        EnhancedConditions._processActiveEffectChange(effect, "create");
    }

    /**
     * Create Active Effect handler
     * @param {*} actor 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    static _onDeleteActiveEffect(effect, options, userId) {
        const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

        if (!enable || !game.user.isGM || (game.users.get(userId).isGM && game.userId !== userId)) {
            return;
        }

        const actor = effect.parent;

        // Handled in Token Update handler
        if (actor?.isToken) return;

        EnhancedConditions._processActiveEffectChange(effect, "delete");
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
        const outputChatSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat);
        const combatant = combat.combatant;

        if (!hasProperty(update, "turn") || !combatant || !enableEnhancedConditions || !outputChatSetting || !enableOutputCombat|| !game.user.isGM) {
            return;
        }

        const token = combatant.token;

        if (!token) return;

        const tokenConditions = EnhancedConditions.getConditions(token, {warn: false});
        let conditions = (tokenConditions && tokenConditions.conditions) ? tokenConditions.conditions : [];
        conditions = conditions instanceof Array ? conditions : [conditions];

        if (!conditions.length) return;

        const chatConditions = conditions.filter(c => c.options?.outputChat);

        if (!chatConditions.length) return;

        EnhancedConditions.outputChatMessage(token, chatConditions, {type: "active"});
    }

    /**
     * Render Chat Message handler
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     * @todo move to chatlog render?
     */
    static async _onRenderChatMessage(app, html, data) {
        if (data.message.content && !data.message.content.match("enhanced-conditions")) {
            return;
        }

        const speaker = data.message.speaker;

        if (!speaker) return;

        const actor = ChatMessage.getSpeakerActor(speaker);
        const token = (speaker.scene && speaker.token) ? await fromUuid(`Scene.${speaker.scene}.Token.${speaker.token}`) : null;

        const removeConditionAnchor = html.find("a[name='remove-row']");
        const undoRemoveAnchor = html.find("a[name='undo-remove']");

        if (!game.user.isGM) {
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

            const actor = ChatMessage.getSpeakerActor(message.speaker);

            EnhancedConditions.removeCondition(conditionName, actor, {warn: false});
        });

        undoRemoveAnchor.on("click", event => {
            const conditionListItem = event.target.closest("li");
            const conditionName = conditionListItem.dataset.conditionName;
            const messageListItem = conditionListItem?.parentElement?.closest("li");
            const messageId = messageListItem?.dataset?.messageId;
            const message = messageId ? game.messages.get(messageId) : null;

            if (!message) return;

            const speaker = message?.speaker;

            if (!speaker) return;

            const token = canvas.tokens.get(speaker.token);
            const actor = game.actors.get(speaker.actor);
            const entity = token ?? actor;

            if (!entity) return;

            EnhancedConditions.addCondition(conditionName, entity);
        });
    }

    /**
     * ChatLog render hook
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    static async _onRenderChatLog(app, html, data) {
        EnhancedConditions.updateConditionTimestamps();
    }

    /**
     * 
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    static async _onRenderCombatTracker(app, html, data) {
        const enabled = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

        if (!enabled) return;

        const effectIcons = html.find("img[class='token-effect']");

        effectIcons.each((index, element) => {
            const url = new URL(element.src);
            const path = url?.pathname?.substring(1); 
            const conditions = EnhancedConditions.getConditionsByIcon(path);
            const statusEffect = CONFIG.statusEffects.find(e => e.icon === path);

            if (conditions?.length) {
                element.title = conditions[0];
            } else if (statusEffect?.label) {
                element.title = game.i18n.localize(statusEffect.label);
            }
        });
    }

    /* -------------------------------------------- */
    /*                    Workers                   */
    /* -------------------------------------------- */

    /**
     * Process the addition/removal of an Active Effect
     * @param {ActiveEffect} effect  the effect
     * @param {String} type  the type of change to process
     */
    static _processActiveEffectChange(effect, type="create") {
        if (!(effect instanceof ActiveEffect)) return;
        
        const effectId = effect.getFlag(`${BUTLER.NAME}`, `${BUTLER.FLAGS.enhancedConditions.conditionId}`);
        if (!effectId) return;

        const condition = EnhancedConditions.lookupEntryMapping(effectId);

        if (!condition) return;

        const shouldOutput = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat) && condition.options.outputChat;
        const outputType = type === "delete" ? "removed" : "added";
        const actor = effect.parent;
        
        if (shouldOutput) EnhancedConditions.outputChatMessage(actor, condition, {type: outputType});
        let macros = [];

        switch (type) {
            case "create":
                macros = condition.macros?.filter(m => m.type === "apply");
                if (condition.options?.removeOthers) EnhancedConditions._removeOtherConditions(actor, condition.id);
                if (condition.options?.markDefeated) EnhancedConditions._toggleDefeated(actor, {markDefeated: true});
                
                break;

            case "delete":
                macros = condition.macros?.filter(m => m.type === "remove");
                if (condition.options?.markDefeated) EnhancedConditions._toggleDefeated(actor, {markDefeated: false});
                break;

            default:
                break;
        }

        const macroIds = macros?.length ? macros.filter(m => m.id).map(m => m.id) : null;

        if (macroIds?.length) EnhancedConditions._processMacros(macroIds, actor);
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
        const isTokenEntity = entity instanceof Token || entity instanceof TokenDocument;
        // Turn a single condition mapping entry into an array
        entries = entries instanceof Array ? entries : [entries];

        if (!entity || !entries.length) return;

        const type = {};

        switch (options.type) {
            case "added":
                type.added = true;
                type.title = game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.ChatCard.Title.Added`);
                break;

            case "removed":
                type.removed = true;
                type.title = game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.ChatCard.Title.Removed`);
                break;

            case "active":
            default:
                type.active = true;
                type.title = game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.ChatCard.Title.Active`);
                break;
        }

        const chatUser = game.userId;
        //const token = token || this.currentToken;
        const chatType = CONST.CHAT_MESSAGE_TYPES.OTHER;
        const speaker = isActorEntity ? ChatMessage.getSpeaker({actor: entity}) : ChatMessage.getSpeaker({token: entity});
        const timestamp = type.active ? null : Date.now();

        // iterate over the entries and mark any with references for use in the template
        entries.forEach((v, i, a) => {
            if (v.referenceId) {
                if (!v.referenceId.match(/\{.+\}/)) {
                    v.referenceId += `{${v.name}}`;
                }

                a[i].hasReference = true;
            }
        });

        const chatCardHeading = game.i18n.localize(type.active ? `${BUTLER.NAME}.ENHANCED_CONDITIONS.ChatCard.HeadingActive` : `${BUTLER.NAME}.ENHANCED_CONDITIONS.ChatCard.Heading`);

        const templateData = {
            chatCardHeading,
            type,
            timestamp,
            entityId: entity.id,
            alias: speaker.alias,
            conditions: entries,
            isOwner: entity.isOwner || game.user.isGM
        };



        // if the last message Enhanced conditions, append instead of making a new one
        const lastMessage = game.messages.contents[game.messages.contents.length - 1];
        const lastMessageSpeaker = lastMessage?.speaker;
        const sameSpeaker = isActorEntity ? lastMessageSpeaker?.actor === speaker.actor : lastMessageSpeaker?.token === speaker.token;
        
        // hard code the recent timestamp to 30s for now
        const recentTimestamp = Date.now() <= lastMessage?.timestamp + 30000;
        const enhancedConditionsDiv = lastMessage?.content.match("enhanced-conditions");

        if (!type.active && enhancedConditionsDiv && sameSpeaker && recentTimestamp) {
            let newContent = "";
            for (const condition of entries) {
                const newRow = await renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.chatConditionsPartial, {condition, type, timestamp});
                newContent += newRow;
            }
            const existingContent = lastMessage.content;
            const ulEnd = existingContent?.indexOf(`</ul>`);
            if (!ulEnd) return;
            const content = existingContent.slice(0, ulEnd) + newContent + existingContent.slice(ulEnd);
            await lastMessage.update({content});
            EnhancedConditions.updateConditionTimestamps();
            ui.chat.scrollBottom();
        } else {
            const content = await renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.chatOutput, templateData);

            await ChatMessage.create({
                speaker,
                content,
                type: chatType,
                user: chatUser
            });
        }
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

        const tokens = entities.flatMap(e => (e instanceof Token || e instanceof TokenDocument) ? e : e instanceof Actor ? e.getActiveTokens() : null);

        const updates = [];

        // loop through tokens, and if there's matching combatants, add them to the update
        for (const token of tokens) {
            
            const combatants = combat ? combat.combatants?.contents?.filter(c => c.tokenId === token.id && c.defeated != markDefeated) : [];

            if (!combatants.length) return;

            const update = combatants.map(c => {
                return {
                    _id: c.id,
                    defeated: markDefeated
                }
            });

            updates.push(update);
        }

        if (!updates.length) return;

        // update all combatants at once
        combat.updateEmbeddedDocuments("Combatant", updates.length > 1 ? update : updates.shift());
    }

    /**
     * For a given entity, removes conditions other than the one supplied
     * @param {*} entity 
     * @param {*} conditionId 
     */
    static async _removeOtherConditions(entity, conditionId) {
        const entityConditions = EnhancedConditions.getConditions(entity, {warn: false});
        let conditions = entityConditions ? entityConditions.conditions : [];
        conditions = conditions instanceof Array ? conditions : [conditions];

        if (!conditions.length) return;

        const removeConditions = conditions.filter(c => c.id !== conditionId);

        if (!removeConditions.length) return;

        for (const c of removeConditions) await EnhancedConditions.removeCondition(c.name, entity, {warn: true});
    }

    /**
     * Migrates Condition Ids to be truly unique-ish
     * @param {*} conditionMap 
     */
    static async _migrateConditionIds(conditionMap) {
        if (!conditionMap?.length) return;

        const existingIds = conditionMap.filter(c => c.id).map(c => c.id);
        const processedIds = [];
        const newMap = foundry.utils.deepClone(conditionMap);
        newMap.forEach((c) => {
            if (processedIds.includes(c.id)) {
                console.log(`${BUTLER.NAME} | Duplicate Condition found:`, c);
                const oldId = c.id;
                c.id = Sidekick.createId(existingIds);
                console.log(`${BUTLER.NAME} | New id:`, c.id);
            }
            processedIds.push(c.id);
        });
        await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, newMap);
    }

    /**
     * Process macros based on given Ids
     * @param {*} macroIds 
     * @param {*} entity 
     */
    static async _processMacros(macroIds, entity=null) {
        const isToken = entity instanceof Token || entity instanceof TokenDocument;
        const isActor = entity instanceof Actor;

        for (const macroId of macroIds) {
            const macro = game.macros.get(macroId);
            if (!macro) continue;

            const scope = isToken ? {token: entity} : (isActor ? {actor: entity} : null);
            await macro.execute(scope);
        }
    }

    /**
     * Update condition added/removed timestamps
     */
    static updateConditionTimestamps() {
        const conditionRows = document.querySelectorAll("ol#chat-log ul.condition-list li");
        for ( const li of conditionRows ) {
            const timestamp = typeof li.dataset.timestamp === "string" ? parseInt(li.dataset.timestamp) : li.dataset.timestamp;
            const iconSpanWrapper = li.querySelector("span.add-remove-icon");

            if (!timestamp || !iconSpanWrapper) continue;

            const type = li.dataset.changeType;
            iconSpanWrapper.title = `${type} ${foundry.utils.timeSince(timestamp)}`;
        }
    }

    // !! TODO: reassess this -- will it replace valid status effects because the duplicate id matches the remaining unique id???
    // static async _migrateActiveEffectConditionId(oldId, newId) {
    //     const updates = [];

    //     for (const scene of game.scenes) {
    //         const sceneTokens = scene.data?.tokens?.contents;
    //         for (const token of sceneTokens) {
    //             const matchingEffect = token.actor?.effects?.contents?.find(e => e.getFlag('core', 'statusId') === oldId);
    //             if (matchingEffect) {
    //                 const newFlags = foundry.utils.duplicate(matchingEffect.data.flags);
    //                 foundry.utils.mergeObject(newFlags, {
    //                     "core.statusId": newId,
    //                     [`${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.conditionId}`]: newId
    //                 });
    //                 const update = {_id: matchingEffect.id, flags: newFlags};
                    
    //                 await token.actor.updateEmbeddedDocuments("ActiveEffect", update);
    //             }
    //         }
    //     }
    // }

    /* -------------------------------------------- */
    /*                    Helpers                   */
    /* -------------------------------------------- */

    /**
     * Creates a button for the Condition Lab
     * @param {Object} html the html element where the button will be created
     */
    static _createLabButton(html) {
        if (!game.user.isGM) return;

        const cubDiv = html.find("#combat-utility-belt");

        const labButton = $(
            `<button id="condition-lab" data-action="condition-lab">
                    <i class="fas fa-flask"></i> ${BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionLab.title}
                </button>`
        );
        
        cubDiv.append(labButton);

        labButton.on("click", event => {
            if (game.cub.enhancedConditions.supported) {
                return game.cub.conditionLab = new ConditionLab().render(true)
            } else {
                ui.notifications.warn(game.i18n.localize(`ENHANCED_CONDITIONS.GameSystemNotSupported`));
            }
            
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
        const preparedMap = [];

        if (!conditionMap || !conditionMap?.length) {
            return preparedMap;
        }

        
        const outputChatSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat);

        // Map existing ids for ease of access
        const existingIds = conditionMap.filter(c => c.id).map(c => c.id);
        const processedIds = [];
        
        // Iterate through the map validating/preparing the data
        for (let i = 0; i < conditionMap.length; i++) {           
            let condition = duplicate(conditionMap[i]);

            // Delete falsy values
            if (!condition) preparedMap.splice(i, 1);

            // Convert string values (eg. icon path) to condition/effect object
            // @todo #580 Consider re-adding support for systems that use simple icons for status effects
            //condition = typeof condition == "string" ? {icon: condition} : condition;
            if (typeof condition == "string") continue;

            if (!condition.name) {
                condition.name = condition.label ?? (condition.icon ? Sidekick.getNameFromFilePath(condition.icon) : "");
            }

            // If conditionId doesn't exist, or is a duplicate, create a new Id
            condition.id = (!condition.id || processedIds.includes(condition.id)) ? Sidekick.createId(existingIds) : condition.id;
            processedIds.push(condition.id);

            condition.options = condition.options || {};
            if (condition.options.outputChat === undefined) condition.options.outputChat = outputChatSetting;
            preparedMap.push(condition);
        }

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
     * Duplicate the core special status effect mappings, freeze the duplicate then store a copy in settings
     */
     static _backupCoreSpecialStatusEffects() {
        CONFIG.defaultSpecialStatusEffects = CONFIG.defaultSpecialStatusEffects || foundry.utils.duplicate(CONFIG.specialStatusEffects);
        if (!Object.isFrozen(CONFIG.defaultSpecialStatusEffects)) {
            Object.freeze(CONFIG.defaultSpecialStatusEffects);
        }
        Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultSpecialStatusEffects, CONFIG.defaultSpecialStatusEffects);
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
                    default: CONST.DOCUMENT_PERMISSION_LEVELS.LIMITED
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

        const existingIds = conditionMap.filter(c => c.id).map(c => c.id);
        
        const statusEffects = [];
        
        for (const c of conditionMap) {
            const id = c.id ?? Sidekick.createId(existingIds);
            const longId = `${BUTLER.NAME}.${id}`;

            const effect = {
                id: longId,
                flags: {
                    ...c.activeEffect?.flags,
                    core: {
                        statusId: longId
                    },
                    [BUTLER.NAME]: {
                        [BUTLER.FLAGS.enhancedConditions.conditionId]: id,
                        [BUTLER.FLAGS.enhancedConditions.overlay]: c?.options?.overlay ?? false
                    }
                },
                label: c.name,
                icon: c.icon,
                changes: c.activeEffect?.changes || [],
                duration: c.duration || c.activeEffect?.duration || {}
            }

            statusEffects.push(effect);
        };

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
        
        const map = json.map ? EnhancedConditions._prepareMap(json.map) : [];

        return map;
    }

    /**
     * Returns the default condition map for a given system
     * @param {*} system 
     */
    static getDefaultMap(system, defaultMaps=null) {
        defaultMaps = defaultMaps instanceof Object ? defaultMaps : Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMaps);
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
        const coreEffectsSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreEffects) 
        const coreEffects = (coreEffectsSetting && coreEffectsSetting.length) ? coreEffectsSetting : CONFIG.statusEffects;
        const map = EnhancedConditions._prepareMap(coreEffects);

        return map;
    }

    /**
     * Create a dialog reminding users to Save the Condition Lab as a preventation for issues arising from the transition to Active Effects
     */
    static async _preventativeSaveReminder() {
        const content = await renderTemplate(`${BUTLER.PATH}/templates/preventative-save-dialog.hbs`);

        const dialog = new Dialog({
            title: game.i18n.localize("ENHANCED_CONDITIONS.PreventativeSaveReminder.Title"),
            content,
            buttons: {
                ok: {
                    label: game.i18n.localize("WORDS.IUnderstand"),
                    icon: `<i class="fas fa-check"></i>`,
                    callback: (html, event) => {
                        const suppressCheckbox = html.find("input[name='suppress']");
                        const suppress = suppressCheckbox.val();
                        if (suppress) {
                            Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.suppressPreventativeSaveReminder, true)
                        }
                    }
                }
            }
        });

        dialog.render(true);
    }

    /* -------------------------------------------- */
    /*                      API                     */
    /* -------------------------------------------- */

    /**
     * Apply the named condition to the provided entities (Actors or Tokens)
     * @deprecated
     * @param  {...any} params 
     * @see EnhancedConditions#addCondition
     */
    static async applyCondition(...params) {
        Sidekick.consoleMessage("warn", BUTLER.GADGETS.enhancedConditions.name, {message: game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.Warnings.ApplyCondition`)});
        return EnhancedConditions.addCondition(...params);
    }

    /**
     * Applies the named condition to the provided entities (Actors or Tokens)
     * @param {String[] | String} conditionName  the name of the condition to add
     * @param {(Actor[] | Token[] | Actor | Token)} [entities=null] one or more Actors or Tokens to apply the Condition to
     * @param {Boolean} [options.warn=true]  raise warnings on errors
     * @param {Boolean} [options.allowDuplicates=false]  if one or more of the Conditions specified is already active on the Entity, this will still add the Condition. Use in conjunction with `replaceExisting` to determine how duplicates are handled
     * @param {Boolean} [options.replaceExisting=false]  whether or not to replace existing Conditions with any duplicates in the `conditionName` parameter. If `allowDuplicates` is true and `replaceExisting` is false then a duplicate condition is created. Has no effect is `keepDuplicates` is `false`
     * @example
     * // Add the Condition "Blinded" to an Actor named "Bob". Duplicates will not be created.
     * game.cub.addCondition("Blinded", game.actors.getName("Bob"));
     * @example
     * // Add the Condition "Charmed" to the currently controlled Token/s. Duplicates will not be created.
     * game.cub.addCondition("Charmed");
     * @example
     * // Add the Conditions "Blinded" and "Charmed" to the targeted Token/s and create duplicates, replacing any existing Conditions of the same names.
     * game.cub.addCondition(["Blinded", "Charmed"], [...game.user.targets], {allowDuplicates: true, replaceExisting: true});
     */
    static async addCondition(conditionName, entities=null, {warn=true, allowDuplicates=false, replaceExisting=false}={}) {
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
            const actor = entity instanceof Actor ? entity : entity instanceof Token || entity instanceof TokenDocument ? entity.actor : null;
            
            if (!actor) continue;

            const hasDuplicates = EnhancedConditions.hasCondition(conditionNames, actor, {warn: false});
            const newEffects = [];
            const updateEffects = [];
            

            // If there are duplicate Condition effects on the Actor take extra steps
            if (hasDuplicates) {
                // @todo #348 determine the best way to raise warnings in this scenario
                /*
                if (warn) {
                    ui.notifications.warn(`${entity.name}: ${conditionName} ${game.i18n.localize("ENHANCED_CONDITIONS.ApplyCondition.Failed.AlreadyActive")}`);
                    console.log(`Combat Utility Belt - Enhanced Conditions | ${entity.name}: ${conditionName} ${game.i18n.localize("ENHANCED_CONDITIONS.ApplyCondition.Failed.AlreadyActive")}`);
                }
                */

                // Get the existing conditions on the actor
                let existingConditionEffects = EnhancedConditions.getConditionEffects(actor, {warn: false});
                existingConditionEffects = existingConditionEffects instanceof Array ? existingConditionEffects : [existingConditionEffects];

                // Loop through the effects sorting them into either existing or new effects
                for (const effect of effects) {
                    // Scenario 1: if duplicates are allowed, but existing conditions are not replaced, everything is new
                    if (allowDuplicates && !replaceExisting) {
                        newEffects.push(effect);
                        continue;
                    }

                    const conditionId = getProperty(effect, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.conditionId}`);
                    const matchedConditionEffects = existingConditionEffects.filter(e => e.getFlag(BUTLER.NAME, BUTLER.FLAGS.enhancedConditions.conditionId) === conditionId);

                    // Scenario 2: if duplicates are allowed, and existing conditions should be replaced, add any existing conditions to update
                    if (replaceExisting) {
                        for (const matchedCondition of matchedConditionEffects) {
                            updateEffects.push({id: matchedCondition.id, ...effect});
                        }
                    }
                    
                    // Scenario 2 cont'd: if the condition is not matched, it must be new, so add to the new effects
                    // Scenario 3: if duplicates are not allowed, and existing conditions are not replaced, just add the new conditions
                    if (!matchedConditionEffects.length) newEffects.push(effect);
                }
            }

            // If the any of the conditions remove others, remove all conditions
            // @todo maybe add this to the logic above?
            if (conditions.some(c => c?.options?.removeOthers)) {
                await EnhancedConditions.removeAllConditions(actor, {warn: false});
            }

            const createData = hasDuplicates ? newEffects : effects;
            const updateData = updateEffects;
            // If system is dnd3.5e, then prevent upstream updates to avoid condition being immediately removed
            const stopUpdates = game.system.id === "D35E";

            if (createData.length) await actor.createEmbeddedDocuments("ActiveEffect", createData, {stopUpdates});
            if (updateData.length) await actor.updateEmbeddedDocuments("ActiveEffect", updateData, {stopUpdates});
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
            const actor = entity instanceof Actor ? entity : (entity instanceof Token || entity instanceof TokenDocument) ? entity.actor : null;

            const effects = actor?.effects.contents;

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
            const actor = entity instanceof Actor ? entity : (entity instanceof Token || entity instanceof TokenDocument) ? entity.actor : null;
            const activeEffects = actor.effects.contents;

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
     * @param {Object} [options]  options object  
     * @param {Boolean} [options.warn]  whether or not to output notifications
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
            const actor = entity instanceof Actor ? entity : (entity instanceof Token || entity instanceof TokenDocument) ? entity.actor : null;

            if (!actor.effects.size) continue;

            const conditionEffect = actor.effects.contents.some(ae => {
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
            const actor = entity instanceof Actor ? entity : (entity instanceof Token || entity instanceof TokenDocument) ? entity.actor : null;
            const activeEffects = actor.effects.contents.filter(e => effects.map(e => e.flags[BUTLER.NAME].conditionId).includes(e.getFlag(BUTLER.NAME, BUTLER.FLAGS.enhancedConditions.conditionId)));

            if (!activeEffects || (activeEffects && !activeEffects.length)) {
                if (warn) ui.notifications.warn(`${conditionName} ${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NotActive")}`);
                console.log(`Combat Utility Belt - Enhanced Conditions | ${conditionName} ${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NotActive")}")`);
                return;
            }

            const effectIds = activeEffects.map(e => e.id);

            await actor.deleteEmbeddedDocuments("ActiveEffect", effectIds);
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
            const actor = entity instanceof Actor ? entity : (entity instanceof Token || entity instanceof TokenDocument) ? entity.actor : null;

            let actorConditionEffects = EnhancedConditions.getConditionEffects(actor, {warn: false});

            if (!actorConditionEffects) continue;

            actorConditionEffects = actorConditionEffects instanceof Array ? actorConditionEffects : [actorConditionEffects];

            const effectIds = actorConditionEffects.map(ace => ace.id);

            await actor.deleteEmbeddedDocuments("ActiveEffect", effectIds);
        }
    }

    static async _migrationHelper(cubVersion) {
        const conditionMigrationVersion = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.migrationVersion);

        if (foundry.utils.isNewerVersion(cubVersion, conditionMigrationVersion)) {
            console.log(`${BUTLER.NAME} | Performing Enhanced Condition migration...`);
            EnhancedConditions._migrateConditionIds(game.cub?.conditions);
            await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.migrationVersion, cubVersion);
            console.log(`${BUTLER.NAME} | Enhanced Condition migration complete!`);
        } 
    }
}
