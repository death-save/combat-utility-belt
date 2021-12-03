import { Sidekick } from "./sidekick.js";
import { NAME, SETTING_KEYS, FLAGS, GADGETS, DEFAULT_CONFIG } from "./butler.js";
import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";
import { Signal } from "./signal.js";

/**
 * Request a roll or display concentration checks when damage is taken.
 * @author JacobMcAuley
 * @author Evan Clarke
 * @todo Supply DC
 */
export class Concentrator {
    
    /* -------------------------------------------- */
    /*                   Handlers                   */
    /* -------------------------------------------- */
    static _onReady() {
        const enableConcentrator = Sidekick.getSetting(SETTING_KEYS.concentrator.enable);
        
        if (!game.user.isGM || !enableConcentrator) return;

        const conditionName = Sidekick.getSetting(SETTING_KEYS.concentrator.conditionName);

        const conditionExists = !!EnhancedConditions.getCondition(conditionName);

        if (!conditionExists) {
            console.log(`${game.i18n.localize(`${NAME}.CONCENTRATOR.MessagePrefix`)} ${game.i18n.localize(`${NAME}.CONCENTRATOR.NoMatchingCondition`)}`);  
            return ui.notifications.warn(game.i18n.localize(`${NAME}.CONCENTRATOR.NoMatchingCondition`));
        }
    }

    /**
     * Handle render ChatMessage
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    static async _onRenderChatMessage(app, html, data) {
        const enableConcentrator = Sidekick.getSetting(SETTING_KEYS.concentrator.enable);
        const actor = ChatMessage.getSpeakerActor(app.data?.speaker);
        const gmUser = Sidekick.getFirstGM();

        if (!enableConcentrator || game.userId !== gmUser?.id || !actor) return;

        const autoConcentrate = Sidekick.getSetting(SETTING_KEYS.concentrator.autoConcentrate);
        const concentrateFlag = app.getFlag(NAME, FLAGS.concentrator.chatMessage);

        if (!autoConcentrate || concentrateFlag) return;

        const itemDiv = html.find("div[data-item-id]");

        // support Beyond20
        const concentrationDiv = html.find(":contains('Requires Concentration')");

        if (!itemDiv.length && !concentrationDiv.length) return;

        const itemId = itemDiv.data("itemId") || null;


        if (!actor) return;

        // First check if the item is a spell
        // note: Beyond20 bypasses this logic
        const item = itemId ? actor.items.get(itemId) : null;
        const isSpell = item ? item.type === "spell" : false;

        // If it is, check if it requires concentration
        const isConcentration = concentrationDiv.length ? true : (isSpell ? !!getProperty(item, `data.data.components.concentration`) : false);

        if (!isConcentration) return;

        const conditionName = Sidekick.getSetting(SETTING_KEYS.concentrator.conditionName);
        const isAlreadyConcentrating = EnhancedConditions.hasCondition(conditionName, actor, {warn: false});
        const notifyDoubleSetting = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyDouble);
        const spell = {
            id: item?.id ?? "",
            name: item?.name ?? game.i18n.localize(`${NAME}.CONCENTRATOR.UnknownSpell`)
        };

        let sendMessage = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyConcentration);
        const suppressNotifyDouble = typeof notifyDoubleSetting === "string" && (notifyDoubleSetting.localeCompare(DEFAULT_CONFIG.concentrator.notifyDouble.none, undefined, {sensitivity: "accent"}) === 0);

        // If the actor/token-actor is already Concentrating, and the notification setting is enabled, fire a notification
        if (isAlreadyConcentrating && !suppressNotifyDouble) {
            await Concentrator._notifyDoubleConcentration(actor, spell);
            sendMessage = DEFAULT_CONFIG.concentrator.notifyConcentration.none;
        }

        await Concentrator._startConcentration(actor, spell, conditionName, {sendMessage});

        // Finally, set a flag that this message has been processed
        return app.setFlag(NAME, FLAGS.concentrator.chatMessage, true);
    }

    /**
     * preUpdateActor Handler
     * @param {*} actor 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    static _onPreUpdateActor(actor, update, options, userId) {
        const enableConcentrator = Sidekick.getSetting(SETTING_KEYS.concentrator.enable);

        if (!enableConcentrator) return true;

        // Update handled in token hooks
        if (actor.isToken) return true;

        const newHealth = getProperty(update, `data.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);
        const oldHealth = getProperty(actor, `data.data.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);

        const damageTaken = Concentrator._wasDamageTaken(newHealth, oldHealth);
        options[NAME] = options[NAME] ?? {};

        if (damageTaken) {
            options[NAME][FLAGS.concentrator.damageTaken] = true;
            options[NAME][FLAGS.concentrator.damageAmount] = Concentrator._calculateDamage(newHealth, oldHealth);
            options[NAME][FLAGS.concentrator.isDead] = newHealth <= 0;
        }

        setProperty(options, `${NAME}.${FLAGS.concentrator.updateProcessed}`, false);
        return true;
    }

    /**
     * Update Actor handler
     * @param {*} actor 
     * @param {*} update 
     * @param {*} options 
     */
    static _onUpdateActor(actor, update, options, userId){
        const damageTaken = getProperty(options, `${NAME}.${FLAGS.concentrator.damageTaken}`);
        const updateProcessed = getProperty(options, `${NAME}.${FLAGS.concentrator.updateProcessed}`);
        const gmUser = (game.userId === userId && game.user.isGM) ? game.user : Sidekick.getFirstGM();

        if (!damageTaken || updateProcessed || game.userId !== gmUser.id) return;

        // Update handled in token hooks
        if (actor.isToken) return;

        setProperty(options, `${NAME}.${FLAGS.concentrator.updateProcessed}`, true);
        return Concentrator._processDamage(actor, options);
    }

    /**
     * preUpdateToken handler
     * @param {*} scene 
     * @param {*} tokenData
     * @param {*} update 
     * @param {*} options 
     */
    static _onPreUpdateToken(token, update, options, userId){
        if (token.data.actorLink) return true;
        
        const enableConcentrator = Sidekick.getSetting(SETTING_KEYS.concentrator.enable);

        if (!enableConcentrator) return true;

        const newHealth = getProperty(update, `actorData.data.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);
        const oldHealth = getProperty(token, `actor.data.data.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);
        
        const damageTaken = Concentrator._wasDamageTaken(newHealth, oldHealth);

        if (damageTaken) {
            const cubOption = options[NAME] = options[NAME] ?? {};
            cubOption[FLAGS.concentrator.damageTaken] = true;
            cubOption[FLAGS.concentrator.damageAmount] = Concentrator._calculateDamage(newHealth, oldHealth);
            cubOption[FLAGS.concentrator.isDead] = newHealth <= 0;
        }

        return true;
    }

    /**
     * Update Token handler
     * @param {*} scene 
     * @param {*} token 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    static _onUpdateToken(token, update, options, userId){
        const damageTaken = getProperty(options, `${NAME}.${FLAGS.concentrator.damageTaken}`);
        const gmUser = (game.user.isGM && game.userId === userId) ? game.user : Sidekick.getFirstGM();

        if (!damageTaken || game.userId !== gmUser?.id) return;

        return Concentrator._processDamage(token, options);
    }

    /**
     * Delete ActiveEffect handler
     * @param {*} effect 
     * @param {*} options 
     * @param {*} userId 
     */
    static _onDeleteActiveEffect(effect, options, userId) {
        const gmUser = (game.user.isGM && game.userId === userId) ? game.user : Sidekick.getFirstGM();
        const actor = effect.parent;

        if (!actor || game.userId !== gmUser?.id) return;

        const concentrationSpellFlag = actor.getFlag(NAME, FLAGS.concentrator.concentrationSpell);

        if (concentrationSpellFlag?.status !== DEFAULT_CONFIG.concentrator.concentrationStatuses.active) return;

        const conditionIdFlag = effect.getFlag(NAME, FLAGS.enhancedConditions.conditionId);

        if (!conditionIdFlag) return;

        const condition = game.cub?.conditions?.find(c => c.id === conditionIdFlag);
        const concentrationConditionName = Sidekick.getSetting(SETTING_KEYS.concentrator.conditionName);

        if (!condition || condition?.name !== concentrationConditionName) return;

        const autoEndConcentration = Sidekick.getSetting(SETTING_KEYS.concentrator.autoEndConcentration);

        if (autoEndConcentration) {
            const sendMessage = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyEndConcentration);
            Concentrator._endConcentration(actor, {sendMessage});
        }
    }

    /**
     * Socket message handler
     * @param {*} message 
     */
    static _onSocket(message) {
        if (!message?.targetUserIds || !message?.targetUserIds?.includes(game.userId) || !message?.action) return;

        switch (message.action) {
            case "prompt":
                if (!message.uuid) return;
                Concentrator._displayPrompt(message.uuid, game.userId, message.dc);
                break;
            
            case "cancelOtherPrompts":
                if (!message.userId) return;
                Concentrator._cancelPrompt(message.userId);
                break;
        
            default:
                break;
        }
    }

    static _onRenderActorSheet(app, html, data) {
        // get any concentration spells from app -> actor
        const actor = app.entity;
        const concentrationFlag = actor?.getFlag(NAME, FLAGS.concentrator.concentrationSpell);
        const itemId = concentrationFlag?.id;

        if (!actor && !concentrationFlag) return;

        // find the matching id
        const spellElement = html.find(`[data-item-id="${itemId}"]`);

        if (!spellElement.length) return;
        
        const spellComps = spellElement.find("div.spell-comps");

        if (!spellComps.length) return;

        const conditionName = Sidekick.getSetting(SETTING_KEYS.concentrator.conditionName);
        const iconSrc = EnhancedConditions.getIconsByCondition(conditionName, {firstOnly: true});
        const imgHtml = `<img src="${iconSrc}" title="${conditionName}" width="16" height="16" style="background: rgba(0,0,0,0.5); vertical-align: top">`;
        spellComps.append(imgHtml);
    }

    /* -------------------------------------------- */
    /*                    Workers                   */
    /* -------------------------------------------- */

    /**
     * Processes a damage event for Concentration purposes
     * @param {*} entity
     * @param {*} options 
     * @returns 
     */
    static _processDamage(entity, options) {
        const isConcentrating = Concentrator._isConcentrating(entity);
        const displayPrompt = Sidekick.getSetting(SETTING_KEYS.concentrator.prompt);
        const outputChat = Sidekick.getSetting(SETTING_KEYS.concentrator.outputChat);

        if (!entity || !isConcentrating || (!displayPrompt && !outputChat)) return;

        const damageAmount = getProperty(options, `${NAME}.${FLAGS.concentrator.damageAmount}`);
        const isDead = getProperty(options, `${NAME}.${FLAGS.concentrator.isDead}`);
        const dc = Concentrator._calculateDC(damageAmount);

        if (outputChat) {
            if (isDead) return Concentrator._processDeath(entity);

            Concentrator._displayChat(entity, dc);
        }

        if (displayPrompt) {
            return Concentrator._determinePromptedUsers(entity.uuid, dc);
        }
    }

    /**
     * Processes the steps necessary when the concentrating token is dead
     * @param {*} entity 
     */
    static async _processDeath(entity) {
        const isActor = entity instanceof Actor;
        const isToken = entity instanceof Token || entity instanceof TokenDocument;

        if (!isActor && !isToken) return;

        const actor = isActor ? entity : (isToken ? entity.actor : null);

        if (!actor) return;

        Concentrator._endConcentration(actor, {sendMessage:DEFAULT_CONFIG.concentrator.notifyEndConcentration.none});

        return Concentrator._displayDeathChat(entity);
    }

    /**
     * Distributes concentration prompts to affected users
     * @param {*} options 
     */
    static async _determinePromptedUsers(uuid, dc){
        if (!uuid) return;

        const actor = await Sidekick.getActorFromUuid(uuid);

        if (!(actor instanceof Actor)) return;

        let owners = game.users.entities.filter(user => user.active && actor.hasPerm(user, Sidekick.getKeyByValue(CONST.ENTITY_PERMISSIONS, CONST.ENTITY_PERMISSIONS.OWNER)) && !user.isGM);

        if (!owners.length) {
            const gmUsers = game.users.filter(u => u.active && u.isGM);
            owners = gmUsers;
        }

        const ownerIds = owners.map(u => u.id);

        return Concentrator._distributePrompts(uuid, ownerIds, dc);
    }

    /**
     * Distribute concentration prompts to affected users
     * @param {*} actorId 
     * @param {*} users
     */
    static async _distributePrompts(uuid, userIds, dc){
        if (!uuid || !userIds || !userIds?.length) return;

        if (userIds.includes(game.userId)) {
            Concentrator._displayPrompt(uuid, game.userId, dc);
            const thisUserIndex = userIds.indexOf(game.userId);
            userIds.splice(thisUserIndex, 1);
        }

        const requestData = {
            gadget: GADGETS.concentrator.name,
            action: "prompt",
            targetUserIds: userIds,
            uuid,
            dc
        };

        game.socket.emit(`module.${NAME}`, requestData);
    }

    /**
     * Displays the prompt to roll a concentration check
     * @param {*} actorId 
     * @param {*} userId 
     */
    static async _displayPrompt(uuid, userId, dc){
        if (!uuid || game.userId !== userId) return;

        const actor = await Sidekick.getActorFromUuid(uuid);

        if (!actor) return;

        const spell = actor.getFlag(NAME, FLAGS.concentrator.concentrationSpell);
        const spellName = spell?.name ?? game.i18n.localize(`${NAME}.CONCENTRATOR.UnknownSpell`);

        new Dialog({
            title: game.i18n.localize(`${NAME}.CONCENTRATOR.Prompts.Check.Title`),
            content: game.i18n.format(`${NAME}.CONCENTRATOR.Prompts.Check.Content`, {actorName: actor.name, spellName}),
            buttons: {
                yes: {
                    label: game.i18n.localize(`WORDS.Yes`),
                    icon: `<i class="fas fa-check"></i>`,
                    callback: (event) => {
                        Concentrator._processConcentrationCheck(event, actor, dc);
                    }
                },
                no: {
                    label: game.i18n.localize(`WORDS.No`),
                    icon: `<i class="fas fa-times"></i>`,
                    callback: e => {
                        //maybe whisper the GM to alert them that the player canceled the check?
                    }
                }
            },
            default: "Yes"
        }).render(true);
    }

    /**
     * Processes a Concentration check for the given entity and DC
     * @param {*} event 
     * @param {*} actor 
     * @param {*} dc
     */
    static _processConcentrationCheck(event, actor, dc) {
        const ability = Sidekick.getSetting(SETTING_KEYS.concentrator.concentrationAttribute);
        actor.rollAbilitySave(ability);
        game.socket.emit(`module.${NAME}`, {
            gadget: GADGETS.concentrator.name,
            action: "cancelOtherPrompts",
            userId: game.userId,
            targetUserIds: game.users.filter(u => u.active && u.id !== game.userId)?.map(u => u.id)
        });

        Hooks.once("createChatMessage", (message, options, userId) => {
            if (!message.isRoll && !message.data.flavor.includes(game.i18n.format("DND5E.SavePromptTitle", {ability: CONFIG.DND5E.abilities[ability]}))) return;

            const autoEndConcentration = Sidekick.getSetting(SETTING_KEYS.concentrator.autoEndConcentration);

            if (autoEndConcentration && (dc && message.roll.total < dc)) {
                ui.notifications.notify("Concentration check failed!");
                const sendMessage = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyEndConcentration);
                Concentrator._endConcentration(actor, {sendMessage});
            }
        });
    }

    /**
     * Cancels any open prompts to roll Concentration checks
     * @param {*} userId 
     */
    static _cancelPrompt(userId) {
        if (!userId || game.userId === userId) return;

        // Find any open Concentration check dialogs
        const dialog = Object.values(ui.windows)?.find(w => w.title === game.i18n.localize(`${NAME}.CONCENTRATOR.Prompts.Check.Title`));

        if (!dialog) return;

        dialog.close();
        ui.notifications.notify(`${game.i18n.localize(`${NAME}.SHORT_NAME`)} | ${game.i18n.localize(`${NAME}.CONCENTRATOR.Prompts.Check.ClosedByOther`)}`);
    }

    /**
     * Displays a chat message for concentration checks
     * @param {*} entity
     * @param {*} damage
     */
    static _displayChat(entity, dc){
        if (!game.user.isGM) return;

        const isActor = entity instanceof Actor;
        const isToken = entity instanceof Token || entity instanceof TokenDocument;
        const user = game.userId;
        const speaker = isActor ? ChatMessage.getSpeaker({actor: entity}) : isToken ? ChatMessage.getSpeaker({token: entity.document}) : ChatMessage.getSpeaker();
        const spell = Concentrator.getConcentrationSpell(entity);
        const spellName = spell?.name ?? game.i18n.localize(`${NAME}.CONCENTRATOR.UnknownSpell`);
        const content = game.i18n.format(`${NAME}.CONCENTRATOR.Messages.ConcentrationTested`, {entityName: entity.name, dc, spellName});
        const type = CONST.CHAT_MESSAGE_TYPES.OTHER;

        return ChatMessage.create({user, speaker, content, type});
    }

    /**
     * Displays a message when a concentrating token dies
     * @param {*} entity 
     */
    static _displayDeathChat(entity) {
        const gmUser = Sidekick.getFirstGM();

        if (game.userId !== gmUser?.id) return;

        const isActor = entity instanceof Actor;
        const isToken = entity instanceof Token || entity instanceof TokenDocument;
        const user =  game.userId;
        const speaker = isActor ? ChatMessage.getSpeaker({actor: entity}) : isToken ? ChatMessage.getSpeaker({token: entity}) : ChatMessage.getSpeaker();
        const spell = Concentrator.getConcentrationSpell(entity);
        const spellName = spell?.name ?? game.i18n.localize(`${NAME}.CONCENTRATOR.UnknownSpell`);
        const content = game.i18n.format(`${NAME}.CONCENTRATOR.Messages.Incapacitated`, {entityName: entity.name, spellName});
        const type = CONST.CHAT_MESSAGE_TYPES.OTHER;

        return ChatMessage.create({user, speaker, content, type});
    }

    /**
     * Processes steps to start Concentration for an entity
     * @param {*} entity 
     * @param {*} spell 
     * @param {*} conditionName 
     * @param {*} options 
     * @returns 
     */
    static async _startConcentration(entity, spell, conditionName, {sendMessage=DEFAULT_CONFIG.concentrator.notifyConcentration.none}={}) {
        const isActor = entity instanceof Actor;
        const isToken = entity instanceof Token || entity instanceof TokenDocument;

        if (!isActor && !isToken) return;

        const actor = isActor ? entity : (isToken ? entity.actor : null);

        if (!actor) return;

        const suppressMessage = typeof sendMessage === "string" && (sendMessage.localeCompare(DEFAULT_CONFIG.concentrator.notifyConcentration.none, undefined, {sensitivity: "accent"}) === 0);

        if (!suppressMessage) {
            const isWhisper = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyConcentration) === "GM Only";
        
            const speaker = isActor ? ChatMessage.getSpeaker({actor: entity}) : isToken ? ChatMessage.getSpeaker({token: entity.document}) : ChatMessage.getSpeaker();
            const whisper = isWhisper ? game.users.entities.filter(u => u.isGM) : [];

            const content =  game.i18n.format(`${NAME}.CONCENTRATOR.Messages.StartConcentration`, {entityName: entity.name, spellName: spell.name})
            const type = CONST.CHAT_MESSAGE_TYPES.OTHER;
        
            ChatMessage.create({speaker, whisper, content, type});
        }
        
        await EnhancedConditions.addCondition(conditionName, actor, {warn: false});
        return actor.setFlag(NAME, FLAGS.concentrator.concentrationSpell, {
            id: spell.id,
            name: spell.name,
            status: DEFAULT_CONFIG.concentrator.concentrationStatuses.active
        });
    }

    /**
     * Displays a chat message to GMs if a Concentration spell is cast while already concentrating
     * @param {*} entity  the entity with double concentration
     * @param {*} newSpell
     */
    static _notifyDoubleConcentration(entity, newSpell={name: game.i18n.localize(`${NAME}.CONCENTRATOR.UnknownSpell`), id: ""}) {
        const isWhisper = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyDouble) === "GM Only";
        const isActor = entity instanceof Actor;
        const isToken = entity instanceof Token || entity instanceof TokenDocument;

        if (!isActor && !isToken) return;

        const actor = isActor ? entity : (isToken ? entity.actor : null);

        const speaker = isActor ? ChatMessage.getSpeaker({actor: entity}) : isToken ? ChatMessage.getSpeaker({token: entity.document}) : ChatMessage.getSpeaker();
        const whisper = isWhisper ? game.users.entities.filter(u => u.isGM) : [];
        const previousSpell = actor.getFlag(NAME, FLAGS.concentrator.concentrationSpell) ?? game.i18n.localize(`${NAME}.CONCENTRATOR.UnknownSpell`);
        const content =  game.i18n.format(`${NAME}.CONCENTRATOR.Messages.DoubleConcentration`, {entityName: entity.name, oldSpellName: previousSpell.name, newSpellName: newSpell.name})
        const type = CONST.CHAT_MESSAGE_TYPES.OTHER;
        
        return ChatMessage.create({speaker, whisper, content, type});
    }

    /**
     * Processes end of Concentration
     * @param {*} entity 
     * @param {*} options 
     * @returns 
     */
    static async _endConcentration(entity, {sendMessage=DEFAULT_CONFIG.concentrator.notifyEndConcentration.none}={}) {
        const isActor = entity instanceof Actor;
        const isToken = entity instanceof Token || entity instanceof TokenDocument;
        const actor = isActor ? entity : (isToken ? entity.actor : null);

        if (!actor) return;

        const flag = actor.getFlag(NAME, FLAGS.concentrator.concentrationSpell);

        if (flag) {
            const flagUpdate = {status: DEFAULT_CONFIG.concentrator.concentrationStatuses.breaking};
            await actor.setFlag(NAME, FLAGS.concentrator.concentrationSpell, mergeObject(flag, flagUpdate));
        }

        const conditionName = Sidekick.getSetting(SETTING_KEYS.concentrator.conditionName);

        if (conditionName) {
            EnhancedConditions.removeCondition(conditionName, actor, {warn: false});
        }
        
        const suppressMessage = typeof sendMessage === "string" && (sendMessage.localeCompare(DEFAULT_CONFIG.concentrator.notifyEndConcentration.none, undefined, {sensitivity: "accent"}) === 0);

        if (!suppressMessage && flag) {
            const isWhisper = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyEndConcentration) === "GM Only";
        
            const speaker = isActor ? ChatMessage.getSpeaker({actor: entity}) : isToken ? ChatMessage.getSpeaker({token: entity.document}) : ChatMessage.getSpeaker();
            const whisper = isWhisper ? game.users.entities.filter(u => u.isGM) : [];

            const spell = actor.getFlag(NAME, FLAGS.concentrator.concentrationSpell) ?? {name: game.i18n.localize(`${NAME}.CONCENTRATOR.UnknownSpell`)};
            const content =  game.i18n.format(`${NAME}.CONCENTRATOR.Messages.EndConcentration`, {entityName: entity.name, spellName: spell.name})
            const type = CONST.CHAT_MESSAGE_TYPES.OTHER;
        
            ChatMessage.create({speaker, whisper, content, type});
        }

        return actor.unsetFlag(NAME, FLAGS.concentrator.concentrationSpell);
    }

    /* -------------------------------------------- */
    /*                    Helpers                   */
    /* -------------------------------------------- */

    /**
     * Executes when the module setting is enabled
     */
    static _promptEnableEnhancedConditions() {
        const title = game.i18n.localize(`${NAME}.CONCENTRATOR.Prompts.EnableEnhancedConditions.Title`);
        const content = game.i18n.localize(`${NAME}.CONCENTRATOR.Prompts.EnableEnhancedConditions.Content`);
        new Dialog({
            title,
            content,
            buttons: {
                yes: {
                    label: game.i18n.localize("WORDS.Yes"),
                    icon: `<i class="fas fa-check"></i>`,
                    callback: async e => {
                        await Sidekick.setSetting(SETTING_KEYS.enhancedConditions.enable, true, true);
                        Concentrator._createCondition();
                        ui.settings.render();
                    }
                },
                no: {
                    label: game.i18n.localize("WORDS.No"),
                    icon: `<i class="fas fa-times"></i>`,
                    callback: e => {}
                }
            }
        }).render(true);
    }

    /**
     * Creates a condition for Concentrating if none exists
     * @todo extract to Enhanced Conditions and make it generic
     */
    static _createCondition() {
        const conditionName = Sidekick.getSetting(SETTING_KEYS.concentrator.conditionName);
        const icon = "icons/svg/d20-black.svg";

        const enhancedConditions = Sidekick.getSetting(SETTING_KEYS.enhancedConditions.enable);

        if (!enhancedConditions) return;

        const concentrating = EnhancedConditions.getCondition(conditionName);

        if (concentrating) return;
        
        const conditionMap = Sidekick.getSetting(SETTING_KEYS.enhancedConditions.map);
        const update = duplicate(conditionMap);

        update.push({
            name: conditionName,
            icon
        });

        const newMap = EnhancedConditions._prepareMap(update);

        Sidekick.setSetting(SETTING_KEYS.enhancedConditions.map, newMap);
    }

    /**
     * Determines if health has been reduced 
     * @param {*} newHealth 
     * @param {*} oldHealth 
     * @returns {Boolean}
     */
    static _wasDamageTaken(newHealth, oldHealth) {
        return newHealth < oldHealth || false;
    }

    /**
     * Checks for the presence of the concentration condition effect
     * @param {*} token
     * @returns {Boolean}
     */
    static _isConcentrating(token) {
        const conditionName = Sidekick.getSetting(SETTING_KEYS.concentrator.conditionName);
        const _isConcentrating = EnhancedConditions.hasCondition(conditionName, token, {warn: false});

        return _isConcentrating;
    }

    /**
     * Calculates damage taken based on two health values
     * @param {*} newHealth 
     * @param {*} oldHealth
     * @returns {Number}
     */
    static _calculateDamage(newHealth, oldHealth) {
        return oldHealth - newHealth || 0;
    }

    /**
     * Calculates a Concentration DC based on a damage amount
     * @param {*} damage 
     * @returns 
     */
    static _calculateDC(damage) {
        const halfDamage = Math.floor(damage / 2);
        const dc = halfDamage > 10 ? halfDamage : 10;
        return dc;
    }

    /**
     * For a given entity, gets and returns their concentrated spell (if any)
     * @param {*} entity 
     * @returns Concentration Spell object
     */
    static getConcentrationSpell(entity) {
        const isActor = entity instanceof Actor;
        const isToken = entity instanceof Token || entity instanceof TokenDocument;

        const actor = isActor ? entity : (isToken ? entity.actor : null);

        if (!actor) return;

        const spell = actor.getFlag(NAME, FLAGS.concentrator.concentrationSpell);

        return spell;
    }
}
