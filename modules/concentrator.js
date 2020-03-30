import { Sidekick } from "./sidekick.js";
import { SETTING_KEYS } from "./butler.js";

/**
 * Request a roll or display concentration checks when damage is taken.
 * @author JacobMcAuley
 * @todo Supply DC
 */
export class Concentrator {

    /**
     * Determines if health has been reduced 
     * @param {*} update 
     * @param {*} current 
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
        const tokenEffects = getProperty(token, "data.effects");
        const concentratingIcon = Sidekick.getSetting(SETTING_KEYS.concentrator.icon);

        const _isConcentrating = Boolean(tokenEffects && tokenEffects.find(e => e === concentratingIcon)) || false;

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
     * Handle render ChatMessage
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    static _onRenderChatMessage(app, html, data) {
        const autoConcentrate = Sidekick.getSetting(SETTING_KEYS.concentrator.autoConcentrate);
        if (!game.user.isGM || app.data.timestamp + 500 < Date.now() || !autoConcentrate) {
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

            const tokenEffects = getProperty(t, "data.effects");
            const isAlreadyConcentrating = !!tokenEffects.find(e => e === Sidekick.getSetting(SETTING_KEYS.concentrator.icon));

            if (isAlreadyConcentrating) {

                if (Sidekick.getSetting(SETTING_KEYS.concentrator.notifyDouble) !== "None") {
                    Concentrator._notifyDoubleConcentration(t);
                }

                continue;
            }

            t.toggleEffect(Sidekick.getSetting(SETTING_KEYS.concentrator.icon));
        }  
    }

    /**
     * Handles preUpdateToken
     * @param {*} scene 
     * @param {*} sceneID 
     * @param {*} update 
     * @param {*} options 
     */
    static _hookOnPreUpdateToken(scene, sceneID, update, options){
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
    static _hookOnPreUpdateActor(actor, update, options) {
        const tokens = actor.getActiveTokens();
        const actorId = update._id;
        const newHealth = getProperty(update, `data.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);
        const oldHealth = getProperty(actor, `data.data.${Sidekick.getSetting(SETTING_KEYS.concentrator.healthAttribute)}.value`);
        const owners = game.users.entities.filter(user => actor.hasPerm(user, "OWNER") && !user.isGM);

        if (owners.length == 0) {
            owners.push(game.users.entities.find(user => user.isGM));
        }
            
        if (!tokens || !newHealth || !oldHealth || !actor) {
            return;
        }
        
        const concentratingTokens = tokens.filter(t => Concentrator._isConcentrating(t) && Concentrator._wasDamageTaken(newHealth, oldHealth));

        if (!concentratingTokens.length) {
            return;
        }

        const damageAmount = Concentrator._calculateDamage(newHealth, oldHealth);

        if(Sidekick.getSetting(SETTING_KEYS.concentrator.outputChat)) {
            for (const t of tokens) {
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
    static _hookOnUpdateActor(actor, update, options){
        Concentrator._determineDisplayedUsers(options);
    }

    /**
     * Handle update Token
     * @param {*} scene 
     * @param {*} sceneID 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    static _hookOnUpdateToken(scene, sceneID, update, options, userId){
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
     * @param {*} name
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