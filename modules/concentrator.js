import { Sidekick } from "./sidekick.js";
import { NAME, SETTING_KEYS, FLAGS, GADGETS } from "./butler.js";
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

        // If the actor/token-actor is already Concentrating, and the notification setting is enabled, fire a notification
        if (isAlreadyConcentrating && notifyDoubleSetting !== "none") {
            await Concentrator._notifyDoubleConcentration(actor, spell);
            sendMessage = false;
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
     * Socket message handler
     * @param {*} message 
     */
    static _onSocket(message) {
        if (!message?.targetUserIds || !message?.targetUserIds?.includes(game.userId) || !message?.action) return;

        switch (message.action) {
            case "prompt":
                if (!message.actorId) return;
                Concentrator._displayPrompt(message.actorId, game.userId, message.dc);
                break;
            
            case "cancelOtherPrompts":
                if (!message.actorId) return;
                Concentrator._cancelPrompt(message.actorId, message.userId);
                break;
        
            default:
                break;
        }
    }

    static _onRenderActorSheet(app, html, data) {
        // get any concentration spells from app -> actor
        const actor = app.entity;
        const concentrationFlag = actor?.getFlag(NAME, FLAGS.concentrator.concentrationSpell);
        const itemId = concentrationFlag.id;

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

        if (!isConcentrating || (!displayPrompt && !outputChat)) return;

        const damageAmount = getProperty(options, `${NAME}.${FLAGS.concentrator.damageAmount}`);
        const isDead = getProperty(options, `${NAME}.${FLAGS.concentrator.isDead}`);
        const dc = Concentrator._calculateDC(damageAmount);

        if (outputChat) {
            if (isDead) return Concentrator._processDeath(entity);

            Concentrator._displayChat(entity, dc);
        }

        if (displayPrompt) {
            const actor = entity instanceof Actor ? entity : entity.actor;

            return Concentrator._determinePromptedUsers(actor.id, dc);
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

        const conditionName = Sidekick.getSetting(SETTING_KEYS.concentrator.conditionName);
        await EnhancedConditions.removeCondition(conditionName, entity);
        await actor.unsetFlag(NAME, FLAGS.concentrator.concentrationSpell);

        return Concentrator._displayDeathChat(entity);
    }

    /**
     * Distributes concentration prompts to affected users
     * @param {*} options 
     */
    static _determinePromptedUsers(actorId, dc){
        if (!actorId) return;

        const actor = game.actors.get(actorId);

        if (!actor) return;

        let owners = game.users.entities.filter(user => user.active && actor.hasPerm(user, Sidekick.getKeyByValue(CONST.ENTITY_PERMISSIONS, CONST.ENTITY_PERMISSIONS.OWNER)) && !user.isGM);

        if (!owners.length) {
            const gmUsers = game.users.filter(u => u.active && u.isGM);
            owners = gmUsers;
        }

        const ownerIds = owners.map(u => u.id);

        return Concentrator._distributePrompts(actorId, ownerIds, dc);
    }

    /**
     * Distribute concentration prompts to affected users
     * @param {*} actorId 
     * @param {*} users
     */
    static async _distributePrompts(actorId, userIds, dc){
        if (!actorId || !userIds || !userIds?.length) return;

        if (userIds.includes(game.userId)) {
            Concentrator._displayPrompt(actorId, game.userId, dc);
            const thisUserIndex = userIds.indexOf(game.userId);
            userIds.splice(thisUserIndex, 1);
        }

        return new Promise((resolve) => {
            const requestData = {
                gadget: GADGETS.concentrator.name,
                action: "prompt",
                targetUserIds: userIds,
                actorId,
                dc
            };

            game.socket.emit(`module.${NAME}`, requestData, (responseData) => {
                Signal._onSocket(responseData);
                resolve();
            });
        });
    }

    /**
     * Displays the prompt to roll a concentration check
     * @param {*} actorId 
     * @param {*} userId 
     */
    static _displayPrompt(actorId, userId){
        const actor = game.actors.get(actorId);
        const ability = Sidekick.getSetting(SETTING_KEYS.concentrator.concentrationAttribute);

        if (!actor || game.userId !== userId) {
            return;
        }

        new Dialog({
            title: "Concentration Check",
            content: `<p>Roll a concentration check for ${actor.name}?</p>`,
            buttons: {
                yes: {
                    label: "Yes",
                    icon: `<i class="fas fa-check"></i>`,
                    callback: e => {
                        actor.rollAbilitySave(ability);
                    }
                },
                no: {
                    label: "No",
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
     * Displays a chat message for concentration checks
     * @param {*} entity
     * @param {*} damage
     */
    static _displayChat(entity, dc){
        if (!game.user.isGM) return;

        const isActor = entity instanceof Actor;
        const isToken = entity instanceof Token || entity instanceof TokenDocument;
        const user = game.userId;
        const speaker = isActor ? ChatMessage.getSpeaker({actor: entity}) : isToken ? ChatMessage.getSpeaker({token: entity}) : ChatMessage.getSpeaker();
        const content = `<h3>Concentrator</header></h3>${entity.name} took damage and their concentration is being tested (DC${dc})!</p>`;
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
        const content = `<h3>Concentrator</header></h3>${entity.name} is incapacitated and the spell they were concentrating on is lost!</p>`;
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
    static _startConcentration(entity, spell, conditionName, {sendMessage=Sidekick.getSetting(SETTING_KEYS.concentrator.notifyConcentration)}={}) {
        const isActor = entity instanceof Actor;
        const isToken = entity instanceof Token || entity instanceof TokenDocument;

        if (!isActor && !isToken) return;

        const actor = isActor ? entity : (isToken ? entity.actor : null);

        if (!actor) return;

        if (sendMessage) {
            const isWhisper = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyConcentration) === "GM Only";
        
            const speaker = isActor ? ChatMessage.getSpeaker({actor: entity}) : isToken ? ChatMessage.getSpeaker({token: entity.document}) : ChatMessage.getSpeaker();
            const whisper = isWhisper ? game.users.entities.filter(u => u.isGM) : [];

            const content =  game.i18n.format(`${NAME}.CONCENTRATOR.Messages.StartConcentration`, {entityName: entity.name, spellName: spell.name})
            const type = CONST.CHAT_MESSAGE_TYPES.OTHER;
        
            ChatMessage.create({speaker, whisper, content, type});
        }
        
        EnhancedConditions.addCondition(conditionName, actor, {warn: false});
        return actor.setFlag(NAME, FLAGS.concentrator.concentrationSpell, {
            id: spell.id,
            name: spell.name
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

    /* -------------------------------------------- */
    /*                    Helpers                   */
    /* -------------------------------------------- */

    /**
     * Executes when the module setting is enabled
     */
    static _promptEnableEnhancedConditions() {
        const title = "Enable Enhanced Conditions?";
        const content = `<p>In order to use Concentrator you must enable Enhanced Conditions.</p><strong>Would you like to enable Enhanced Conditions</strong>`;
        new Dialog({
            title,
            content,
            buttons: {
                yes: {
                    label: "Yes",
                    icon: `<i class="fas fa-check"></i>`,
                    callback: async e => {
                        await Sidekick.setSetting(SETTING_KEYS.enhancedConditions.enable, true, true);
                        Concentrator._createCondition();
                        ui.settings.render();
                    }
                },
                no: {
                    label: "No",
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

        if (!enhancedConditions) {
            return;
        }

        const conditionMap = Sidekick.getSetting(SETTING_KEYS.enhancedConditions.map);

        const concentrating = EnhancedConditions._lookupConditionByName(conditionName);

        if (concentrating) return;

        const update = duplicate(conditionMap);

        update.push({
            name: conditionName,
            icon
        });

        Sidekick.setSetting(SETTING_KEYS.enhancedConditions.map, update);
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
}
