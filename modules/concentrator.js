import { Sidekick } from "./sidekick.js";
import { NAME, SETTING_KEYS, DEFAULT_CONFIG, FLAGS } from "./butler.js";
import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";

/**
 * Request a roll or display concentration checks when damage is taken.
 * @author JacobMcAuley
 * @author Evan Clarke
 * @todo Supply DC
 */
export class Concentrator {

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
        const tokenEffects = getProperty(token, "actor.effects");

        if (!tokenEffects?.size) {
                return;
        }

        const conditionName = Sidekick.getSetting(SETTING_KEYS.concentrator.conditionName);
        const concentratingIcon = EnhancedConditions.getIconsByCondition(conditionName, {firstOnly: true});

        const _isConcentrating = Boolean(tokenEffects.find(e => e.data.icon === concentratingIcon)) || false;

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
     * Processes the steps necessary when the concentrating token is dead
     * @param {*} token 
     */
    static _processDeath(token) {
        const effects = token.data.effects;
        const newEffects = duplicate(effects);
        const conditionName = Sidekick.getSetting(SETTING_KEYS.concentrator.conditionName);
        const index = newEffects.findIndex(e => e === EnhancedConditions.getIconsByCondition(conditionName, {firstOnly: true}));
        newEffects.splice(index, 1);

        // If new effects length is same, nothing was removed
        if (newEffects.length === effects.length) {
            return null;
        }

        Concentrator._displayDeathChat(token);
        return newEffects;
    }

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

        const concentrating = conditionMap.find(c => c.name === conditionName);

        if (concentrating) {
            return;
        }

        const update = duplicate(conditionMap);
        update.push({
            name: conditionName,
            icon
        });

        Sidekick.setSetting(SETTING_KEYS.enhancedConditions.map, update);
    }

    /**
     * Handle render ChatMessage
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    static _onRenderChatMessage(app, html, data) {
        const autoConcentrate = Sidekick.getSetting(SETTING_KEYS.concentrator.autoConcentrate);
        const concentrateFlag = app.getFlag(NAME, FLAGS.concentrator.chatMessage);

        // 
        if (!game.user.isGM || concentrateFlag || !autoConcentrate) {
            return;
        }

        const itemDiv = html.find("div[data-item-id]");

        // support Beyond20
        const concentrationDiv = html.find(":contains('Requires Concentration')");

        if (itemDiv.length === 0 && concentrationDiv.length === 0) {
            return;
        }

        const actorId = app.data.speaker.actor || null;
        const tokenId = app.data.speaker.token || null;
        const itemId = itemDiv.data("itemId") || null;

        if (!tokenId && !actorId) {
            return;
        }

        const actor = game.actors.get(actorId);
        const tokens = tokenId ? [canvas.tokens.get(tokenId)] : actor ? actor.getActiveTokens() : [];

        if (tokens.length === 0) {
            return;
        }

        for (const t of tokens) {
            const item = itemId ? (tokenId ? t.actor.getOwnedItem(itemId) : actor.getOwnedItem(itemId)) : null;
            const isSpell = (concentrationDiv.length > 0 && itemDiv.length === 0) ? true : (itemDiv.length > 0 ? item.type === "spell" : false);
            const isConcentration = concentrationDiv.length > 0 ? true : (itemDiv.length > 0 && isSpell) ? item.data.data.components.concentration : false;
            
            if (!isConcentration) {
                continue;
            }

            const tokenEffects = getProperty(t, "actor.effects");
            const conditionName = Sidekick.getSetting(SETTING_KEYS.concentrator.conditionName);
            const concentratingIcon = EnhancedConditions.getIconsByCondition(conditionName, {firstOnly: true});
            const isAlreadyConcentrating = !!tokenEffects.find(e => e.data.icon === concentratingIcon);

            if (isAlreadyConcentrating) {

                if (Sidekick.getSetting(SETTING_KEYS.concentrator.notifyDouble) !== "None") {
                    Concentrator._notifyDoubleConcentration(t);
                }

                continue;
            }

            EnhancedConditions.addCondition(conditionName, t);
        }

        app.setFlag(NAME, FLAGS.concentrator.chatMessage, true);
    }

    /**
     * Handles preUpdateToken
     * @param {*} scene 
     * @param {*} tokenData
     * @param {*} update 
     * @param {*} options 
     */
    static _onPreUpdateToken(scene, tokenData, update, options, userId){
        const token = canvas.tokens.get(update._id);
        const actorId = getProperty(token, "data.actorId");
        const current = getProperty(token, "actor");
        const enable = Sidekick.getSetting(SETTING_KEYS.concentrator.enable);

        // Return early if basic requirements not met
        if (!game.user.isGM || !current || !enable || token.actorLink || !actorId) {
            return;
        }

        const newHealth = getProperty(update, `actorData.data.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);
        const oldHealth = getProperty(current, `data.data.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);
        const isConcentrating = Concentrator._isConcentrating(token);
        const damageTaken = Concentrator._wasDamageTaken(newHealth, oldHealth);

        // Return early if damage wasn't taken or the token wasn't concentrating
        if (!isConcentrating || !damageTaken) {
            return;
        }

        if (newHealth === 0) {
            const newEffects = Concentrator._processDeath(token);
            return update.effects = newEffects;
        }

        const damageAmount = Concentrator._calculateDamage(newHealth, oldHealth)

        if(Sidekick.getSetting(SETTING_KEYS.concentrator.outputChat)) {
            Concentrator._displayChat(token, damageAmount);
        }
                
        if(Sidekick.getSetting(SETTING_KEYS.concentrator.prompt)) {
            const actor = game.actors.get(actorId);

            if (!actor) {
                return;
            }

            const owners = game.users.entities.filter(user => actor.hasPerm(user, "OWNER"));
            options['affectedUsers'] = {'actorId' : actorId, 'owners': owners};
        }
    }

    /**
     * Handles preUpdate Actor
     * @param {*} actor 
     * @param {*} update 
     * @param {*} options 
     */
    static async _onPreUpdateActor(actor, update, options, userId) {
        const tokens = actor.getActiveTokens();
        const actorId = update._id;
        const newHealth = getProperty(update, `data.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);
        const oldHealth = getProperty(actor, `data.data.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);
        const owners = game.users.entities.filter(user => actor.hasPerm(user, "OWNER") && !user.isGM);

        if (owners.length == 0) {
            owners.push(game.users.entities.find(user => user.isGM));
        }
            
        if (!tokens || !Number.isInteger(newHealth) || !Number.isInteger(oldHealth) || !actor) {
            return;
        }
        
        const concentratingTokens = tokens.filter(t => Concentrator._isConcentrating(t) && Concentrator._wasDamageTaken(newHealth, oldHealth));

        if (!concentratingTokens.length) {
            return;
        }

        const damageAmount = Concentrator._calculateDamage(newHealth, oldHealth);

        if(Sidekick.getSetting(SETTING_KEYS.concentrator.outputChat)) {
            for (const t of tokens) {
                if (newHealth === 0) {
                    const newEffects = Concentrator._processDeath(t);
                    await t.update({effects: newEffects});
                    continue;
                }

                Concentrator._displayChat(t, damageAmount);
            } 
        }
                    
                
        if(Sidekick.getSetting(SETTING_KEYS.concentrator.prompt) && actorId) {
            options['affectedUsers'] = {'actorId' : actorId, 'owners': owners};
        }
    }

    /**
     * Handle update Actor
     * @param {*} actor 
     * @param {*} update 
     * @param {*} options 
     */
    static _onUpdateActor(actor, update, options, userId){
        Concentrator._determineDisplayedUsers(options);
    }

    /**
     * Handle update Token
     * @param {*} scene 
     * @param {*} token 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    static _onUpdateToken(scene, token, update, options, userId){
        Concentrator._determineDisplayedUsers(options);
    }

    /**
     * Distributes concentration prompts to affected users
     * @param {*} options 
     */
    static _determineDisplayedUsers(options){
        const owners = getProperty(options, 'affectedUsers.owners');
        const actorId = getProperty(options, 'affectedUsers.actorId');

        if(!owners || !actorId) {
            return;
        }

        if (owners.length > 0) {
            return Concentrator._distributePrompts(actorId, owners);
        }

        if (owners.length === 0 && game.user.isGM) {
            owners.push(game.userId);
            return Concentrator._distributePrompts(actorId, owners);
        }
    }

    /**
     * Displays a chat message for concentration checks
     * @param {*} token
     * @param {*} damage
     */
    static _displayChat(token, damage){
        if (!game.user.isGM) {
            return;
        }

        const halfDamage = Math.floor(damage / 2);
        const dc = halfDamage > 10 ? halfDamage : 10;
        const speaker = ChatMessage.getSpeaker({token});
        //speaker.alias = CUBConcentrator.prototype.DEFAULT_CONFIG.concentrator;

        ChatMessage.create({
            user: game.user._id,
            speaker: speaker,
            content: `<h3>CUB Concentrator</header></h3>${token.name} took damage and their concentration is being tested (DC${dc})!</p>`,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER
        });       
    }

    /**
     * Displays a message when a concentrating token dies
     * @param {*} token 
     */
    static _displayDeathChat(token) {
        ChatMessage.create({
            user: game.userId,
            speaker: ChatMessage.getSpeaker({token}),
            content: `<h3>CUB Concentrator</header></h3>${token.name} is dead and the spell they were concentrating on is lost!</p>`,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER
        }); 
    }

    /**
     * Distribute concentration prompts to affected users
     * @param {*} actorId 
     * @param {*} users 
     */
    static _distributePrompts(actorId, users){
        for (const u of users) {
            Concentrator._displayPrompt(actorId, u._id);
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
     * Displays a chat message to GMs if a Concentration spell is cast while already concentrating
     * @param {*} token 
     */
    static _notifyDoubleConcentration(token) {
        const isWhisper = Sidekick.getSetting(SETTING_KEYS.concentrator.notifyDouble) === "GM Only";
        const speaker = ChatMessage.getSpeaker({token});
        //speaker.alias = CUBConcentrator.prototype.DEFAULT_CONFIG.concentrator;

        ChatMessage.create({
            speaker: speaker,
            whisper: isWhisper ? game.users.entities.filter(u => u.isGM) : "",
            content: `<h4>CUB Concentrator</h4><p>${token.name} cast a spell requiring Concentration while concentrating on another spell. Concentration on the original spell is lost.`,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER
        });
    }
}