import { Sidekick } from "./sidekick.js";
import { NAME, SETTING_KEYS, FLAGS } from "./butler.js";
import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";

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

    /**
     * Handle render ChatMessage
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    static _onRenderChatMessage(app, html, data) {
        const enableConcentrator = Sidekick.getSetting(SETTING_KEYS.concentrator.enable);

        // Early return if basic conditions not met
        if (!game.user.isGM || !enableConcentrator) return;

        const autoConcentrate = Sidekick.getSetting(SETTING_KEYS.concentrator.autoConcentrate);
        const concentrateFlag = app.getFlag(NAME, FLAGS.concentrator.chatMessage);

        if (!autoConcentrate || concentrateFlag) return;

        const itemDiv = html.find("div[data-item-id]");

        // support Beyond20
        const concentrationDiv = html.find(":contains('Requires Concentration')");

        if (!itemDiv.length && !concentrationDiv.length) return;

        const itemId = itemDiv.data("itemId") || null;

        const messageActorId = app.data.speaker.actor;
        const messageSceneId = app.data.speaker.scene;
        const messageTokenId = app.data.speaker.token;
        const scene = messageSceneId ? game.scenes.get(messageSceneId) : game.scenes.active;
        const tokenData = scene ? scene.data.tokens.find(t => t._id === messageTokenId) : null;
        const actor = canvas?.tokens.get(messageTokenId)?.actor ?? game.actors.get(tokenData?.actorId) ?? game.actors.get(messageActorId);

        if (!actor) return;

        // First check if the item is a spell
        // note: Beyond20 bypasses this logic
        const item = itemId ? actor.getOwnedItem(itemId) : null;
        const isSpell = item ? item.type === "spell" : false;

        // If it is, check if it requires concentration
        const isConcentration = concentrationDiv.length ? true : (isSpell ? !!getProperty(item, `data.data.components.concentration`) : false);

        if (!isConcentration) return;

        const conditionName = Sidekick.getSetting(SETTING_KEYS.concentrator.conditionName);
        const isAlreadyConcentrating = EnhancedConditions.hasCondition(conditionName, actor, {warn: false});
        const notifyDoubleSetting = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyDouble);

        // If the actor/token-actor is already Concentrating, and the notification setting is enabled, fire a notification
        if (isAlreadyConcentrating && notifyDoubleSetting !== "none") {
            Concentrator._notifyDoubleConcentration(actor);
        } else {
            // Otherwise, add the Concentrating condition
            EnhancedConditions.addCondition(conditionName, actor, {warn: false});
        }

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

        const newHealth = getProperty(update, `data.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);
        const oldHealth = getProperty(actor, `data.data.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);

        const damageTaken = Concentrator._wasDamageTaken(newHealth, oldHealth);

        if (damageTaken) {
            options[NAME] = {
                [FLAGS.concentrator.damageTaken]: true,
                [FLAGS.concentrator.damageAmount]: Concentrator._calculateDamage(newHealth, oldHealth),
                [FLAGS.concentrator.isDead]:  newHealth <= 0
            }
        }

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

        if (!damageTaken || (!game.user.isGM && !game.userId)) return;

        const displayPrompt = Sidekick.getSetting(SETTING_KEYS.concentrator.prompt);
        const outputChat = Sidekick.getSetting(SETTING_KEYS.concentrator.outputChat);
        const damageAmount = getProperty(options, `${NAME}.${FLAGS.concentrator.damageAmount}`);
        const isDead = getProperty(options, `${NAME}.${FLAGS.concentrator.isDead}`);
        const isConcentrating = Concentrator._isConcentrating(actor);

        if (!isConcentrating) return;

        if (outputChat) {
            if (isDead) return Concentrator._processDeath(actor);

            Concentrator._displayChat(actor, damageAmount);
        }

        if (displayPrompt) Concentrator._determinePromptedUsers(actor.id);
    }

    /**
     * preUpdateToken handler
     * @param {*} scene 
     * @param {*} tokenData
     * @param {*} update 
     * @param {*} options 
     */
    static _onPreUpdateToken(scene, tokenData, update, options, userId){
        const enableConcentrator = Sidekick.getSetting(SETTING_KEYS.concentrator.enable);

        if (!enableConcentrator) return true;

        const token = scene.data.tokens.find(t => t._id === update._id);

        const newHealth = getProperty(update, `actorData.data.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);
        const oldHealth = getProperty(token, `actorData.data.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);
        
        const damageTaken = Concentrator._wasDamageTaken(newHealth, oldHealth);

        if (damageTaken) {
            const cubOption = options[NAME] = options[NAME] ?? {};
            cubOption[FLAGS.concentrator.damageTaken] = true;
            cubOption[FLAGS.concentrator.damageAmount] = Concentrator._calculateDamage(newHealth, oldHealth);
            cubOption[FLAGS.concentrator.isDead] =  newHealth <= 0;
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
    static _onUpdateToken(scene, tokenData, update, options, userId){
        const damageTaken = getProperty(options, `${NAME}.${FLAGS.concentrator.damageTaken}`);

        if (!damageTaken || (!game.user.isGM && userId !== game.userId)) return;

        const tokenId = tokenData._id;
        const newTokenData = duplicate(tokenData);
        delete newTokenData._id;
        
        const token = canvas.tokens.get(tokenData._id) ?? new Token(tokenData);
        const actor = token.actor;

        if (!actor) return;

        const isConcentrating = Concentrator._isConcentrating(actor);

        if (!isConcentrating) return;

        const displayPrompt = Sidekick.getSetting(SETTING_KEYS.concentrator.prompt);
        const outputChat = Sidekick.getSetting(SETTING_KEYS.concentrator.outputChat);
        const damageAmount = getProperty(options, `${NAME}.${FLAGS.concentrator.damageAmount}`);
        const isDead = getProperty(options, `${NAME}.${FLAGS.concentrator.isDead}`);

        if (outputChat) {
            if (isDead) return Concentrator._processDeath(actor);

            Concentrator._displayChat(actor, damageAmount);
        }

        if (displayPrompt) Concentrator._determinePromptedUsers(actor.id);
    }

    /* -------------------------------------------- */
    /*                    Workers                   */
    /* -------------------------------------------- */

    /**
     * Processes the steps necessary when the concentrating token is dead
     * @param {*} entity 
     */
    static async _processDeath(entity) {
        const conditionName = Sidekick.getSetting(SETTING_KEYS.concentrator.conditionName);
        await EnhancedConditions.removeCondition(conditionName, entity);

        return Concentrator._displayDeathChat(entity);
    }

    /**
     * Distributes concentration prompts to affected users
     * @param {*} options 
     */
    static _determinePromptedUsers(actorId){
        if (!actorId) return;

        const actor = game.actors.get(actorId);

        if (!actor) return;

        let owners = game.users.entities.filter(user => user.active && actor.hasPerm(user, Sidekick.getKeyByValue(CONST.ENTITY_PERMISSIONS, CONST.ENTITY_PERMISSIONS.OWNER)) && !user.isGM);

        if (!owners.length) {
            const gmUsers = game.users.filter(u => u.active && u.isGM);
            owners = gmUsers;
        }

        const ownerIds = owners.map(u => u.id);

        return Concentrator._distributePrompts(actorId, ownerIds);
    }

    /**
     * Distribute concentration prompts to affected users
     * @param {*} actorId 
     * @param {*} users 
     */
    static _distributePrompts(actorId, userIds){
        for (const uId of userIds) {
            Concentrator._displayPrompt(actorId, uId);
        }
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
    static _displayChat(entity, damage){
        if (!game.user.isGM) return;

        const isActor = entity instanceof Actor;
        const isToken = entity instanceof Token;
        const halfDamage = Math.floor(damage / 2);
        const dc = halfDamage > 10 ? halfDamage : 10;
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
        if (!game.user.isGM) return;

        const isActor = entity instanceof Actor;
        const isToken = entity instanceof Token;
        const user =  game.userId;
        const speaker = isActor ? ChatMessage.getSpeaker({actor: entity}) : isToken ? ChatMessage.getSpeaker({token: entity}) : ChatMessage.getSpeaker();
        const content = `<h3>Concentrator</header></h3>${entity.name} is incapacitated and the spell they were concentrating on is lost!</p>`;
        const type = CONST.CHAT_MESSAGE_TYPES.OTHER;

        return ChatMessage.create({user, speaker, content, type});
    }

    /**
     * Displays a chat message to GMs if a Concentration spell is cast while already concentrating
     * @param {*} entity  the entity with double concentration
     */
    static _notifyDoubleConcentration(entity) {
        const isWhisper = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyDouble) === "GM Only";
        const isActor = entity instanceof Actor;
        const isToken = entity instanceof Token;
        const speaker = isActor ? ChatMessage.getSpeaker({actor: entity}) : isToken ? ChatMessage.getSpeaker({token: entity}) : ChatMessage.getSpeaker();
        const whisper = isWhisper ? game.users.entities.filter(u => u.isGM) : "";
        const content =  `<h3>Concentrator</h3><p>${entity.name} cast a spell requiring Concentration while concentrating on another spell. Concentration on the original spell is lost.`;
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
                    callback: e => {
                        //maybe whisper the GM to alert them that the player canceled the check?
                    }
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
        const _isConcentrating = EnhancedConditions.hasCondition(conditionName, token);

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
}