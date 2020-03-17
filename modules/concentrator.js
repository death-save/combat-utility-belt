/**
 * Request a roll or display concentration checks when damage is taken.
 * @author JacobMcAuley
 * @todo Supply DC
 */
class CUBConcentrator {
    constructor(){
        this.settings = {
            concentrating: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ConcentratingN + ")", this.SETTINGS_META.concentrating),
            concentratingIcon: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ConcentratingIconN + ")", this.SETTINGS_META.concentratingIcon),
            healthAttribute: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.HealthAttributeN + ")", this.SETTINGS_META.healthAttribute),
            displayChat: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ConcentratingChatPromptN + ")", this.SETTINGS_META.displayChat),
            rollRequest: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ConcentratingRollRequestN + ")", this.SETTINGS_META.rollRequest),
            ability: "con", //change to a setting later maybe?
            autoConcentrate: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ConcentratingAutoStatusN + ")", this.SETTINGS_META.autoConcentrate),
            notifyDoubleConcentration: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ConcentratingNotifyDoubleN + ")", this.SETTINGS_META.notifyDoubleConcentration)   
        }
    }

    get GADGET_NAME() {
        return "concentrator"
    }

    get SETTINGS_DESCRIPTORS(){
        return {
            ConcentratingN: "--Force Concentration Checks--",
            ConcentratingH: "Requires concentration checks on tokens with the concentrating status effect when they take damage (D&D 5e only)",
            ConcentratingIconN: "Concentration Status Icon",
            ConcentratingIconH: "Path to the icon to use for Concentration",
            ConcentratingChatMessageN: "Notify Chat",
            ConcentratingChatMessageH: "Display a message in chat whenever concentration is threatened",
            ConcentratingRollRequestN: "Prompt Player",
            ConcentratingRollRequestH: "Prompt the player to make the check or not",
            HealthAttributeN: "Health Attribute",
            HealthAttributeH: "Health/HP attribute name as defined by game system",
            ConcentratingAutoStatusN: "Automatically Set Concentrating Status",
            ConcentratingAutoStatusH: "When a Concentration spell is cast, automatically set the Concentrating status",
            ConcentratingNotifyDoubleN: "Notify on Double Concentration",
            ConcentratingNotifyDoubleH: "Send a message when a Concentration spell is cast while another spell is being Concentrated on"
        }
    }

    get DEFAULT_CONFIG(){
        return {
            concentrating: false,
            concentratingIcon: "modules/combat-utility-belt/icons/concentrating.svg",
            concentrator: "CUB: Concentrator"
        };
    }

    get SETTINGS_META(){
        return {
            concentrating: {
                name: this.SETTINGS_DESCRIPTORS.ConcentratingN,
                hint: this.SETTINGS_DESCRIPTORS.ConcentratingH,
                default: this.DEFAULT_CONFIG.concentrating,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.concentrating = s;
                }
            },
            concentratingIcon: {
                name: this.SETTINGS_DESCRIPTORS.ConcentratingIconN,
                hint: this.SETTINGS_DESCRIPTORS.ConcentratingIconH,
                default: this.DEFAULT_CONFIG.concentratingIcon,
                scope: "world",
                type: String,
                config: true,
                onChange: s => {
                    this.settings.concentratingIcon = s;
                }
            },
            healthAttribute: {
                name: this.SETTINGS_DESCRIPTORS.HealthAttributeN,
                hint: this.SETTINGS_DESCRIPTORS.HealthAttributeH,
                default: (CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id] != null) ? CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id].healthAttribute : CUBButler.DEFAULT_GAME_SYSTEMS.other.healthAttribute,
                scope: "world",
                type: String,
                config: true,
                onChange: s => {
                    this.settings.healthAttribute = s;
                }
            },
            displayChat: {
                name: this.SETTINGS_DESCRIPTORS.ConcentratingChatMessageN,
                hint: this.SETTINGS_DESCRIPTORS.ConcentratingChatMessageH,
                default: (CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id] != null) ? CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id].healthAttribute : CUBButler.DEFAULT_GAME_SYSTEMS.other.healthAttribute,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.displayChat = s;
                }
            },
            rollRequest: {
                name: this.SETTINGS_DESCRIPTORS.ConcentratingRollRequestN,
                hint: this.SETTINGS_DESCRIPTORS.ConcentratingRollRequestH,
                default: (CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id] != null) ? CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id].healthAttribute : CUBButler.DEFAULT_GAME_SYSTEMS.other.healthAttribute,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.rollRequest = s;
                }
            },
            autoConcentrate: {
                name: this.SETTINGS_DESCRIPTORS.ConcentratingAutoStatusN,
                hint: this.SETTINGS_DESCRIPTORS.ConcentratingAutoStatusH,
                default: false,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.autoConcentrate = s;
                }
            },
            notifyDoubleConcentration: {
                name: this.SETTINGS_DESCRIPTORS.ConcentratingNotifyDoubleN,
                hint: this.SETTINGS_DESCRIPTORS.ConcentratingNotifyDoubleH,
                default: "None",
                scope: "world",
                type: String,
                choices: ["None", "GM Only", "Everyone"],
                config: true,
                onChange: s => {
                    this.settings.notifyDoubleConcentration = s;
                }
            }
        };
    }

    /**
     * Determines if health has been reduced 
     * @param {*} update 
     * @param {*} current 
     * @returns {Boolean}
     */
    _wasDamageTaken(newHealth, oldHealth) {
        return newHealth < oldHealth || false;
    }

    /**
     * Checks for the presence of the concentration condition effect
     * @param {*} token
     * @returns {Boolean}
     */
    _isConcentrating(token) {
        const tokenEffects = getProperty(token, "data.effects");
        const _isConcentrating = Boolean(tokenEffects && tokenEffects.find(e => e == this.settings.concentratingIcon)) || false;

        return _isConcentrating;
    }

    /**
     * Calculates damage taken based on two health values
     * @param {*} newHealth 
     * @param {*} oldHealth
     * @returns {Number}
     */
    _calculateDamage(newHealth, oldHealth) {
        return oldHealth - newHealth || 0;
    }

    /**
     * Handle render ChatMessage
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    _onRenderChatMessage(app, html, data) {
        if (!game.user.isGM || app.data.timestamp + 500 < Date.now() || !this.settings.autoConcentrate) {
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
            const isAlreadyConcentrating = !!tokenEffects.find(e => e === this.settings.concentratingIcon);

            if (isAlreadyConcentrating) {

                if (this.settings.notifyDoubleConcentration !== "None") {
                    this._notifyDoubleConcentration(t);
                }

                continue;
            }

            t.toggleEffect(this.settings.concentratingIcon);
        }  
    }

    /**
     * Handles preUpdateToken
     * @param {*} scene 
     * @param {*} sceneID 
     * @param {*} update 
     * @param {*} options 
     */
    _hookOnPreUpdateToken(scene, sceneID, update, options){
        const token = canvas.tokens.get(update._id);
        const actorId = getProperty(token, "data.actorId");
        const current = getProperty(token, "actor");

        // Return early if basic requirements not met
        if (!game.user.isGM || !current || !this.settings.concentrating || token.actorLink || !actorId) {
            return;
        }

        const newHealth = getProperty(update, "actorData.data." + this.settings.healthAttribute + ".value");
        const oldHealth = getProperty(current, "data.data." + this.settings.healthAttribute + ".value");
        const isConcentrating = this._isConcentrating(token);
        const damageTaken = this._wasDamageTaken(newHealth, oldHealth);

        // Return early if damage wasn't taken or the token wasn't concentrating
        if (!isConcentrating || !damageTaken) {
            return;
        }

        const damageAmount = this._calculateDamage(newHealth, oldHealth)

        if(this.settings.displayChat) {
            this._displayChat(token, damageAmount);
        }
                
        if(this.settings.rollRequest) {
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
    _hookOnPreUpdateActor(actor, update, options) {
        const tokens = actor.getActiveTokens();
        const actorId = update._id;
        const newHealth = getProperty(update, "data." + this.settings.healthAttribute + ".value");
        const oldHealth = getProperty(actor, "data.data." + this.settings.healthAttribute + ".value");
        const owners = game.users.entities.filter(user => actor.hasPerm(user, "OWNER") && !user.isGM);

        if (owners.length == 0) {
            owners.push(game.users.entities.find(user => user.isGM));
        }
            
        if (!tokens || !newHealth || !oldHealth || !actor) {
            return;
        }
        
        const concentratingTokens = tokens.filter(t => this._isConcentrating(t) && this._wasDamageTaken(newHealth, oldHealth));

        if (!concentratingTokens.length) {
            return;
        }

        const damageAmount = this._calculateDamage(newHealth, oldHealth);

        if(this.settings.displayChat) {
            for (const t of tokens) {
                this._displayChat(t, damageAmount);
            } 
        }
                    
                
        if(this.settings.rollRequest && actorId) {
            options['affectedUsers'] = {'actorId' : actorId, 'owners': owners};
        }
    }

    /**
     * Handle update Actor
     * @param {*} actor 
     * @param {*} update 
     * @param {*} options 
     */
    _hookOnUpdateActor(actor, update, options){
        this._determineDisplayedUsers(options);
    }

    /**
     * Handle update Token
     * @param {*} scene 
     * @param {*} sceneID 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    _hookOnUpdateToken(scene, sceneID, update, options, userId){
        this._determineDisplayedUsers(options);
    }

    /**
     * Distributes concentration prompts to affected users
     * @param {*} options 
     */
    _determineDisplayedUsers(options){
        const owners = getProperty(options, 'affectedUsers.owners');
        const actorId = getProperty(options, 'affectedUsers.actorId');

        if(!owners || !actorId) {
            return;
        }

        if (owners.length > 0) {
            return this._distributePrompts(actorId, owners);
        }

        if (owners.length === 0 && game.user.isGM) {
            owners.push(game.userId);
            return this._distributePrompts(actorId, owners);
        }
    }

    /**
     * Displays a chat message for concentration checks
     * @param {*} name
     * @param {*} damage
     */
    _displayChat(token, damage){
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
    _distributePrompts(actorId, users){
        for (const u of users) {
            this._displayPrompt(actorId, u._id);
        }
    }

    /**
     * Displays the prompt to roll a concentration check
     * @param {*} actorId 
     * @param {*} userId 
     */
    _displayPrompt(actorId, userId){
        const actor = game.actors.get(actorId);
        const ability = this.settings.ability;

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
    _notifyDoubleConcentration(token) {
        const isWhisper = this.settings.notifyDoubleConcentration === "GM Only";
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