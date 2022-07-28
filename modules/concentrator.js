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
        const actor = ChatMessage.getSpeakerActor(app.speaker);
        const gmUser = Sidekick.getFirstGM();

        if (!enableConcentrator || game.userId !== gmUser?.id || !actor) return;

        const autoConcentrate = Sidekick.getSetting(SETTING_KEYS.concentrator.autoConcentrate);
        const concentrateFlag = app.getFlag(NAME, FLAGS.concentrator.chatMessage);

        if (!autoConcentrate || concentrateFlag) return;

        // Don't apply concentration checks when the BetterRolls5e's "Info" button is pressed.
        if (data.message.flags.betterrolls5e?.params?.infoOnly) return;

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
        const isConcentration = concentrationDiv.length ? true : (isSpell ? !!getProperty(item, `system.components.concentration`) : false);

        if (!isConcentration) return;

        const conditionName = Sidekick.getSetting(SETTING_KEYS.concentrator.conditionName);
        const isAlreadyConcentrating = EnhancedConditions.hasCondition(conditionName, actor, {warn: false});
        const spell = {
            id: item?.id ?? "",
            name: item?.name ?? game.i18n.localize(`${NAME}.CONCENTRATOR.UnknownSpell`)
        };

        let sendMessage = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyConcentration);
        

        // If the actor/token-actor is already Concentrating, and the notification setting is enabled, fire a notification
        if (isAlreadyConcentrating && Concentrator._shouldSendMessage("double")) {
            await Concentrator._displayChat("double", actor, {newSpell: spell});
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
        
        const newTempHealth = getProperty(update, `system.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.temp`);
        const oldTempHealth = getProperty(actor, `system.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.temp`);
        const tempDamageTaken = Concentrator._wasDamageTaken(newTempHealth, oldTempHealth);
        
        const newHealth = getProperty(update, `system.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);
        const oldHealth = getProperty(actor, `system.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);
        const damageTaken = Concentrator._wasDamageTaken(newHealth, oldHealth);
        
        options[NAME] = options[NAME] ?? {};

        if (tempDamageTaken || damageTaken) {
            options[NAME][FLAGS.concentrator.damageTaken] = true;
            options[NAME][FLAGS.concentrator.damageAmount] = tempDamageTaken ? Concentrator._calculateDamage(newTempHealth, oldTempHealth) : Concentrator._calculateDamage(newHealth, oldHealth);
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
        if (token.actorLink) return true;
        
        const enableConcentrator = Sidekick.getSetting(SETTING_KEYS.concentrator.enable);

        if (!enableConcentrator) return true;

        const newTempHealth = getProperty(update, `actorData.system.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.temp`);
        const oldTempHealth = getProperty(token, `actor.system.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.temp`);
        
        const tempDamageTaken = Concentrator._wasDamageTaken(newTempHealth, oldTempHealth);

        const newHealth = getProperty(update, `actorData.system.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);
        const oldHealth = getProperty(token, `actor.system.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);
        
        const damageTaken = Concentrator._wasDamageTaken(newHealth, oldHealth);

        if (tempDamageTaken || damageTaken) {
            const cubOption = options[NAME] = options[NAME] ?? {};
            cubOption[FLAGS.concentrator.damageTaken] = true;
            cubOption[FLAGS.concentrator.damageAmount] = tempDamageTaken ? Concentrator._calculateDamage(newTempHealth, oldTempHealth) : Concentrator._calculateDamage(newHealth, oldHealth);
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

        const sendMessage = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyEndConcentration);
        Concentrator._endConcentration(actor, {reason: "delete_effect"});
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
        const actor = app.document;
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
     * @returns {Concentrator._processDeath | Concentrator._determinePromptedUsers}
     */
    static _processDamage(entity, options) {
        const isConcentrating = Concentrator._isConcentrating(entity);
        const displayPrompt = Sidekick.getSetting(SETTING_KEYS.concentrator.prompt);

        if (!entity || !isConcentrating || !displayPrompt) return;

        const damageAmount = getProperty(options, `${NAME}.${FLAGS.concentrator.damageAmount}`);
        const isDead = getProperty(options, `${NAME}.${FLAGS.concentrator.isDead}`);
        const dc = Concentrator._calculateDC(damageAmount);

        if (isDead) return Concentrator._processDeath(entity);

        if (Concentrator._shouldSendMessage("check")) {
            Concentrator._displayChat("check", entity, {dc});
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

        return Concentrator._endConcentration(actor, {reason: "dead"});
    }

    /**
     * Determines which users should receive a prompt
     * @param {*} options 
     */
    static async _determinePromptedUsers(uuid, dc){
        if (!uuid) return;

        const actor = await Sidekick.getActorFromUuid(uuid);

        if (!(actor instanceof Actor)) return;

        let owners = game.users.contents.filter(user => user.active && actor.testUserPermission(user, Sidekick.getKeyByValue(CONST.DOCUMENT_PERMISSION_LEVELS, CONST.DOCUMENT_PERMISSION_LEVELS.OWNER)) && !user.isGM);

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
            const includesSaveText = message.flavor?.includes(game.i18n.format("DND5E.SavePromptTitle", {ability: CONFIG.DND5E.abilities[ability]}));
            // Support BetterRolls5e
            const betterRoll = message?.flags?.betterrolls5e;
            
            if (!message.isRoll && (!includesSaveText || !betterRoll)) return;

            const autoEndConcentration = Sidekick.getSetting(SETTING_KEYS.concentrator.autoEndConcentration);
            const total = betterRoll ? Concentrator.getBetterRollsTotal(betterRoll) : message.roll?.total;

            if (autoEndConcentration && (dc && total && total < dc)) {
                //ui.notifications.notify("Concentration check failed!");
                Concentrator._endConcentration(actor, {reason: "failed_check"});
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
    static _displayChat(type, entity, {dc=0, newSpell={name: game.i18n.localize(`${NAME}.CONCENTRATOR.UnknownSpell`), id: ""}}={}){
        if (!game.user.isGM) return;

        const isActor = entity instanceof Actor;
        const isToken = entity instanceof Token || entity instanceof TokenDocument;
        const user = game.userId;
        const speaker = isActor ? ChatMessage.getSpeaker({actor: entity}) : isToken ? ChatMessage.getSpeaker({token: entity.document}) : ChatMessage.getSpeaker();
        const spell = type === "start" ? newSpell : Concentrator.getConcentrationSpell(entity);
        const spellName = spell?.name ?? game.i18n.localize(`${NAME}.CONCENTRATOR.UnknownSpell`);

        const messageType = CONST.CHAT_MESSAGE_TYPES.OTHER;
        const hasPlayerOwner = isToken ? entity.actor?.hasPlayerOwner : entity.hasPlayerOwner;
        const hideNpcConcentration = Sidekick.getSetting(SETTING_KEYS.concentrator.hideNpcConcentration);

        let content = "";
        let isWhisper = false;

        switch (type) {
            case "start":
                content =  game.i18n.format(`${NAME}.CONCENTRATOR.Messages.StartConcentration`, {entityName: entity.name, spellName});
                isWhisper = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyConcentration) === Sidekick.getKeyByValue(DEFAULT_CONFIG.concentrator.notifyConcentration, DEFAULT_CONFIG.concentrator.notifyConcentration.gm);
                break;

            case "check":
                content = game.i18n.format(`${NAME}.CONCENTRATOR.Messages.ConcentrationTested`, {entityName: entity.name, dc, spellName});
                isWhisper = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyConcentrationCheck) === Sidekick.getKeyByValue(DEFAULT_CONFIG.concentrator.notifyConcentrationCheck, DEFAULT_CONFIG.concentrator.notifyConcentrationCheck.gm);
                break;

            case "dead":
                content = game.i18n.format(`${NAME}.CONCENTRATOR.Messages.Incapacitated`, {entityName: entity.name, spellName});
                isWhisper = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyEndConcentration) === Sidekick.getKeyByValue(DEFAULT_CONFIG.concentrator.notifyEndConcentration, DEFAULT_CONFIG.concentrator.notifyEndConcentration.gm);
                break;

            case "double":
                content =  game.i18n.format(`${NAME}.CONCENTRATOR.Messages.DoubleConcentration`, {entityName: entity.name, oldSpellName: spellName, newSpellName: newSpell.name})
                isWhisper = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyDouble) === Sidekick.getKeyByValue(DEFAULT_CONFIG.concentrator.notifyDouble, DEFAULT_CONFIG.concentrator.notifyDouble.gm);
                break;

            case "end":
                content = game.i18n.format(`${NAME}.CONCENTRATOR.Messages.EndConcentration`, {entityName: entity.name, spellName})
                isWhisper = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyEndConcentration) === Sidekick.getKeyByValue(DEFAULT_CONFIG.concentrator.notifyEndConcentration, DEFAULT_CONFIG.concentrator.notifyEndConcentration.gm);
                break;
            
            default:
                break;
        }
        
        if (!content) return;

        const whisperRecipients = isWhisper ? Concentrator._getWhisperRecipients(entity, Sidekick.getKeyByValue(DEFAULT_CONFIG.concentrator.messageVisibility, DEFAULT_CONFIG.concentrator.messageVisibility.gmOwner)) : [];

        return ChatMessage.create({user, speaker, content, type: messageType, whisper: whisperRecipients});
    }

    /**
     * Processes steps to start Concentration for an entity
     * @param {*} entity 
     * @param {*} spell 
     * @param {*} conditionName 
     * @param {*} options 
     * @returns {Actor.setFlag}
     */
    static async _startConcentration(entity, spell, conditionName, {sendMessage=DEFAULT_CONFIG.concentrator.notifyConcentration.none}={}) {
        const isActor = entity instanceof Actor;
        const isToken = entity instanceof Token || entity instanceof TokenDocument;

        if (!isActor && !isToken) return;

        const actor = isActor ? entity : (isToken ? entity.actor : null);

        if (!actor) return;

        if (Concentrator._shouldSendMessage("start")) {
            Concentrator._displayChat("start", actor, {newSpell: spell});
        }
        
        await EnhancedConditions.addCondition(conditionName, actor, {warn: false});
        return actor.setFlag(NAME, FLAGS.concentrator.concentrationSpell, {
            id: spell.id,
            name: spell.name,
            status: DEFAULT_CONFIG.concentrator.concentrationStatuses.active
        });
    }

    /**
     * Processes end of Concentration
     * @param {*} entity 
     * @param {*} options 
     * @returns {Actor.unsetFlag}
     */
    static async _endConcentration(entity, {reason=null}={}) {
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
        
        

        if (flag && Concentrator._shouldSendMessage("end")) {
            const messageType = (reason == "dead") ? "dead" : "end";
            Concentrator._displayChat(messageType, entity);
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
     * @returns {Number}
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

    /**
     * 
     * @param {*} brInstance 
     */
    static getBetterRollsTotal(brInstance) {
        const entries = brInstance?.entries;
        const rollEntry = entries?.find(e => e.type.includes("roll"));

        if (!brInstance || !entries || !rollEntry) return;

        const rollState = rollEntry.rollState;

        if (rollState == "highest" || rollState == "lowest") {
           const keptRoll = rollEntry.entries?.find(r => !r.ignored);
           return keptRoll?.total;
        }

        return rollEntry.entries[0]?.total;
    }

    /**
     * Checks setting for a given Concentration event and determines whether a message should be sent
     * @param {*} eventType 
     */
    static _shouldSendMessage(eventType) {
        let shouldSend = false;
        let setting;
        let keyNone;

        switch (eventType) {
            case 'start':
                keyNone = Sidekick.getKeyByValue(DEFAULT_CONFIG.concentrator.notifyConcentration, DEFAULT_CONFIG.concentrator.notifyConcentration.none);
                setting = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyConcentration);
                if ((setting && keyNone) && setting !== keyNone) {
                    shouldSend = true;
                }
                break;

            case 'check':
                keyNone = Sidekick.getKeyByValue(DEFAULT_CONFIG.concentrator.notifyConcentrationCheck, DEFAULT_CONFIG.concentrator.notifyConcentrationCheck.none);
                setting = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyConcentrationCheck);
                if ((setting && keyNone) && setting !== keyNone) {
                    shouldSend = true;
                }
                break;

            case 'double':
                keyNone = Sidekick.getKeyByValue(DEFAULT_CONFIG.concentrator.notifyDouble, DEFAULT_CONFIG.concentrator.notifyDouble.none)
                setting = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyDouble);
                if ((setting && keyNone) && setting !== keyNone) {
                    shouldSend = true;
                }
                break;
            
            case 'end':
                keyNone = Sidekick.getKeyByValue(DEFAULT_CONFIG.concentrator.notifyEndConcentration, DEFAULT_CONFIG.concentrator.notifyEndConcentration.none)
                setting = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyEndConcentration);
                if ((setting && keyNone) && setting !== keyNone) {
                    shouldSend = true;
                }
                break;

            default:
                break;
        }

        return shouldSend;
    }

    /**
     * Finds whisper recipients for given entity and desired visibility
     * @param {*} entity 
     * @param {*} desiredVisibility 
     * @returns {Array}
     */
    static _getWhisperRecipients(entity, desiredVisibility) {
        let whisperRecipients = [];
        const ownerIds = Sidekick.getDocumentOwners(entity);

        const visibilityGmOwner = Sidekick.getKeyByValue(DEFAULT_CONFIG.concentrator.messageVisibility, DEFAULT_CONFIG.concentrator.messageVisibility.gmOwner);
        const visibilityAll = Sidekick.getKeyByValue(DEFAULT_CONFIG.concentrator.messageVisibility, DEFAULT_CONFIG.concentrator.messageVisibility.all);

        switch (desiredVisibility) {
            case visibilityGmOwner:
                whisperRecipients = game.users.filter(u => u.isGM || ownerIds?.includes(u.id)).map(u => u.id);
                break;

            case visibilityAll:        
            default:
                break;
        }

        return whisperRecipients;
    }
}
