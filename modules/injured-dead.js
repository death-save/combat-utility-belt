/**
 * Mark a token injured or dead based on threshold
 */
class CUBInjuredAndDead {

    constructor() {
        this.settings = {
            injured: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.InjuredN + ")", this.SETTINGS_META.injured),
            healthAttribute: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.HealthAttributeN + ")", this.SETTINGS_META.healthAttribute),
            threshold: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ThresholdN + ")", this.SETTINGS_META.threshold),
            injuredIcon: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.InjuredIconN + ")", this.SETTINGS_META.injuredIcon),
            dead: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.DeadN + ")", this.SETTINGS_META.dead),
            deadIcon: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.DeadIconN + ")", this.SETTINGS_META.deadIcon),
            unconscious: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.UnconsciousN + ")", this.SETTINGS_META.unconscious),
            unconsciousActorType: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.UnconsciousActorTypeN + ")", this.SETTINGS_META.unconsciousActorType),
            unconsciousIcon: CUBSidekick.initGadgetSetting(this.GADGET_NAME +  "(" + this.SETTINGS_DESCRIPTORS.UnconsciousIconN + ")", this.SETTINGS_META.unconsciousIcon), 
            combatTrackDead: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.CombatTrackDeadN + ")", this.SETTINGS_META.combatTrackDead)
        };
        this.callingUser = "";
    }

    get GADGET_NAME() {
        return "injured-and-dead";
    }

    get SETTINGS_DESCRIPTORS() {
        return {
            InjuredN: "--Mark Injured Tokens--",
            InjuredH: "Sets a status marker on tokens that meet the threshold below",
            InjuredIconN: "Injured Status Marker",
            InjuredIconH: "Path to the status marker to display for Injured Tokens",
            ThresholdN: "Injured Token Threshold",
            ThresholdH: "Enter the percentage of health remaining when a token should be marked injured",
            DeadN: "--Mark Dead Tokens--",
            DeadH: "Sets a status marker on tokens that reach 0 health",
            CombatTrackDeadN: "Mark Dead in Combat Tracker",
            CombatTrackDeadH: "Sets the token that reaches 0 health to dead status in the combat tracker. This will also mark tokens dead regardless of mark dead settings.",
            DeadIconN: "Dead Status Marker",
            DeadIconH: "Path to the status marker to display for Dead Tokens",
            HealthAttributeN: "Health Attribute",
            HealthAttributeH: "Health/HP attribute name as defined by game system",
            UnconsciousN: "--Mark Unconscious--",
            UnconsciousH: "Sets a unconscious (instead of dead) status marker on a certain Actor type when they reach 0 health",
            UnconsciousActorTypeN: "Unconscious Actor Type",
            UnconsciousActorTypeH: "Select the Actor Type to mark unconscious instead of dead",
            UnconsciousIconN: "Unconscious Status Marker",
            UnconsciousIconH: "Path to the status marker to display for Unconscious Tokens"
        };
    }

    get DEFAULT_CONFIG() {
        return {
            injured: false,
            injuredIcon: "icons/svg/blood.svg",
            threshold: 50,
            dead: false,
            deadIcon: "icons/svg/skull.svg",
            combatTrackDead: false,
            unconscious: false,
            unconsciousActorType: "",
            unconsciousIcon: "icons/svg/unconscious.svg"
        };
    }

    get SETTINGS_META() {
        return {
            injured: {
                name: this.SETTINGS_DESCRIPTORS.InjuredN,
                hint: this.SETTINGS_DESCRIPTORS.InjuredH,
                default: this.DEFAULT_CONFIG.injured,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.injured = s;
                }
            },
            injuredIcon: {
                name: this.SETTINGS_DESCRIPTORS.InjuredIconN,
                hint: this.SETTINGS_DESCRIPTORS.InjuredIconH,
                default: this.DEFAULT_CONFIG.injuredIcon,
                scope: "world",
                type: String,
                config: true,
                onChange: s => {
                    this.settings.injuredIcon = s;
                }
            },
            threshold: {
                name: this.SETTINGS_DESCRIPTORS.ThresholdN,
                hint: this.SETTINGS_DESCRIPTORS.ThresholdH,
                default: this.DEFAULT_CONFIG.threshold,
                scope: "world",
                type: Number,
                config: true,
                onChange: s => {
                    this.settings.threshold = s;
                }
            },
            dead: {
                name: this.SETTINGS_DESCRIPTORS.DeadN,
                hint: this.SETTINGS_DESCRIPTORS.DeadH,
                default: this.DEFAULT_CONFIG.dead,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.dead = s;
                }
            },
            deadIcon: {
                name: this.SETTINGS_DESCRIPTORS.DeadIconN,
                hint: this.SETTINGS_DESCRIPTORS.DeadIconH,
                default: this.DEFAULT_CONFIG.deadIcon,
                scope: "world",
                type: String,
                config: true,
                onChange: s => {
                    this.settings.deadIcon = s;
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
            combatTrackDead: {
                name: this.SETTINGS_DESCRIPTORS.CombatTrackDeadN,
                hint: this.SETTINGS_DESCRIPTORS.CombatTrackDeadH,
                default: this.DEFAULT_CONFIG.combatTrackDead,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.combatTrackDead = s;
                }
            },
            unconscious: {
                name: this.SETTINGS_DESCRIPTORS.UnconsciousN,
                hint: this.SETTINGS_DESCRIPTORS.UnconsciousH,
                default: this.DEFAULT_CONFIG.unconscious,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.unconscious = s;
                }
            },
            unconsciousActorType: {
                name: this.SETTINGS_DESCRIPTORS.UnconsciousActorTypeN,
                hint: this.SETTINGS_DESCRIPTORS.UnconsciousActorTypeH,
                default: this.DEFAULT_CONFIG.unconsciousActorType,
                scope: "world",
                type: String,
                choices: game.system.entityTypes.Actor,
                config: true,
                onChange: s => {
                    this.settings.unconsciousActorType = s;
                }
            },
            unconsciousIcon: {
                name: this.SETTINGS_DESCRIPTORS.UnconsciousIconN,
                hint: this.SETTINGS_DESCRIPTORS.UnconsciousIconH,
                default: this.DEFAULT_CONFIG.unconsciousIcon,
                scope: "world",
                type: String,
                config: true,
                onChange: s => {
                    this.settings.unconsciousIcon = s;
                }
            }
        };

    }

    /**
     * Checks the health state of a token using the update supplied from a Hook
     * @param {Object} token 
     * @param {Object} update 
     */
    _checkTokenHealthState(token, update) {
        const currentHealth = getProperty(token, "actor.data.data." + this.settings.healthAttribute + ".value");
        const updateHealth = getProperty(update, "actorData.data." + this.settings.healthAttribute + ".value");
        const maxHealth = getProperty(token, "actor.data.data." + this.settings.healthAttribute + ".max");
        const isDead = this._checkForDead(currentHealth);
        const isInjured = this._checkForInjured(currentHealth, maxHealth);
        const markUnconscious = (this.settings.unconscious && token.actor.data.type === this.settings.unconsciousActorType) ? true : false;

        if (isDead) {
            if (markUnconscious) {
                return CUBButler.HEALTH_STATES.UNCONSCIOUS;
            }
            return CUBButler.HEALTH_STATES.DEAD;
        } else if (isInjured) {
            return CUBButler.HEALTH_STATES.INJURED;
        }

        return;
    }

    /**
     * Checks the health state of an actor using the update supplied from a Hook
     * @param {Object} actor 
     * @param {Object} update 
     */
    _checkActorHealthState(actor, update) {
        const currentHealth = getProperty(actor, "data.data." + this.settings.healthAttribute + ".value");
        const updateHealth = getProperty(update, "data." + this.settings.healthAttribute + ".value");
        const maxHealth = getProperty(actor, "data.data." + this.settings.healthAttribute + ".max");
        const isDead = this._checkForDead(currentHealth);
        const isInjured = this._checkForInjured(currentHealth, maxHealth);
        const markUnconscious = (this.settings.unconscious && actor.data.type === this.unconsciousActorType) ? true : false;

        if (isDead) {
            if (markUnconscious) {
                return CUBButler.HEALTH_STATES.UNCONSCIOUS;
            }
            return CUBButler.HEALTH_STATES.DEAD;
        } else if (isInjured) {
            return CUBButler.HEALTH_STATES.INJURED;
        }

        return;
    }

    /**
     * Checks if the given health value is 0
     * @param {Number} value 
     * @returns {Boolean}
     */
    _checkForDead(value) {
        return value === 0 ? true : false;
    }

    /**
     * Checks if the given value is below the threshold
     * @param {Number} value 
     * @param {Number} max
     * @returns {Boolean}
     */
    _checkForInjured(value, max) {
        return (value < max * (this.settings.threshold / 100)) ?  true : false;
    }

    /**
     * Retrieves an Actor type based on the index stored in the setting
     * @returns {String}
     */
    get unconsciousActorType() {
        try {
            return game.system.entityTypes.Actor[this.settings.unconsciousActorType];
        } catch(e) {
            console.warn(e);
            return;
        }
    }

    /**
     * Removes injury and dead effects/overlay on a token
     * @param {Object} token 
     */
    _markHealthy(token) {
        const tokenEffects = getProperty(token, "data.effects");
        const tokenOverlay = getProperty(token, "data.overlayEffect");
        const hasOverlay = getProperty(token, "data.overlayEffect") != null;
        const hasEffects = getProperty(token, "data.effects.length") > 0;
        const wasInjured = Boolean(tokenEffects && tokenEffects.find(e => e == this.settings.injuredIcon)) || false;
        const wasDead = Boolean(tokenOverlay === this.settings.deadIcon);
        const wasUnconscious = Boolean(tokenOverlay === this.settings.unconsciousIcon);

        if (hasEffects && wasInjured) {
            return token.toggleEffect(this.settings.injuredIcon);
        }

        if (hasOverlay && wasDead) {
            return token.toggleOverlay(this.settings.deadIcon);
        }

        if (hasOverlay && wasUnconscious) {
            return token.toggleOverlay(this.settings.unconsciousIcon);
        }
    }

    /**
     * Sets an injured effect on a token, removes dead overlay
     * @param {Object} token 
     */
    _markInjured(token) {
        const tokenEffects = getProperty(token, "data.effects");
        const tokenOverlay = getProperty(token, "data.overlayEffect");
        const hasOverlay = getProperty(token, "data.overlayEffect") != null;
        const hasEffects = getProperty(token, "data.effects.length") > 0;
        const isInjured = Boolean(tokenEffects.find(e => e == this.settings.injuredIcon)) || false;
        const wasDead = Boolean(tokenOverlay == this.settings.deadIcon);
        const wasUnconscious = Boolean(tokenOverlay === this.settings.unconsciousIcon);

        if (!isInjured) {
            token.toggleEffect(this.settings.injuredIcon);
        }

        if (wasDead) {
            token.toggleOverlay(this.settings.deadIcon);
        }

        if (wasUnconscious) {
            token.toggleOverlay(this.settings.unconsciousIcon);
        }
    }

    /**
     * Set a dead overlay on a token, removes all effects
     * @param {Object} token 
     */
    async _markDead(token) {
        const tokenEffects = getProperty(token, "data.effects");
        const hasEffects = getProperty(token, "data.effects.length") > 0;
        const tokenOverlay = getProperty(token, "data.overlayEffect");
        const isDead = (tokenOverlay === this.settings.deadIcon) ? true : false;
        const isInjured = Boolean(tokenEffects.find(e => e == this.settings.injuredIcon)) || false;
        const isUnconscious = (tokenOverlay === this.settings.unconsciousIcon) ? true : false;
        const markUnconscious = (this.settings.unconscious && token.actor.data.type === this.unconsciousActorType) ? true : false;

        if (!isUnconscious && markUnconscious) {
            if (hasEffects && isInjured) {
                token.toggleEffect(this.settings.injuredIcon);
            }
            await token.toggleOverlay(this.settings.unconsciousIcon);
            if (CUB.enhancedConditions && CUB.enhancedConditions.settings.enhancedConditions) {
                CUB.enhancedConditions.currentToken = token;
                const effects = tokenEffects.concat(token.data.overlayEffect);

                CUB.enhancedConditions.lookupEntryMapping(effects);
            }

            return;
        }

        if (hasEffects) {
            token.update(token.scene.id, {
                "effects": []
            });
        }

        if (!isDead) {
            return token.toggleOverlay(this.settings.deadIcon);
        }
    }

    /**
     * Toggles the combat tracker death status based on token hp
     * @param {Object} token 
     */
    async _toggleTrackerDead(token) {
        if (!token.scene.active || !game.user.isGM) {
            return;
        }

        const combat = game.combat;
        if (combat) {
            let combatant = combat.turns.find(t => t.tokenId == token.id);
            let tokenHp = getProperty(token, "actor.data.data.attributes.hp.value");
            if (combatant) {
                await combat.updateCombatant({
                    _id: combatant._id,
                    defeated: (tokenHp == 0)
                });
            }
        }
    }

    /**
     * Hook on the token update,
     * check the health state of the token,
     * then mark it appropriately
     * @param {Object} token
     * @param {String} sceneId
     * @param {Object} update
     */
    async _hookOnUpdateToken(scene, sceneID, update, options, userId) {
        if (!this.settings.dead && !this.settings.injured && !this.settings.unconscious) {
            return;
        }

        let token = canvas.tokens.get(update._id);
        const healthUpdate = getProperty(update, "actorData.data." + this.settings.healthAttribute + ".value");
        if (game.userId != userId || healthUpdate == undefined || token.actorLink) {
            return;
        }

        let tokenHealthState;

        if (this.settings.injured || this.settings.dead || this.settings.unconscious || this.settings.combatTrackDead) {
            tokenHealthState = this._checkTokenHealthState(token, update);

            if ((tokenHealthState === CUBButler.HEALTH_STATES.DEAD || tokenHealthState === CUBButler.HEALTH_STATES.UNCONSCIOUS) && (this.settings.dead || this.settings.combatTrackDead)) {
                if (this.settings.combatTrackDead) {
                    await this._toggleTrackerDead(token);
                }
                this._markDead(token);
            } else if (tokenHealthState === CUBButler.HEALTH_STATES.INJURED && this.settings.injured) {
                this._markInjured(token);
                if (this.settings.combatTrackDead) {
                    this._toggleTrackerDead(token);
                }
            } else {
                this._markHealthy(token);
                if (this.settings.combatTrackDead) {
                    this._toggleTrackerDead(token);
                }
            }
        }
        this.callingUser = "";
        return;
    }

    /**
     * Hook on the actor update,
     * check the health state of the actor,
     * then mark the active token appropriately
     * @param {Object} token
     * @param {String} sceneId
     * @param {Object} update
     * @todo refactor as updateMany
     */
    _hookOnUpdateActor(actor, update, userId) {
        if ((!this.settings.dead && !this.settings.injured && !this.settings.unconscious) || !game.user.isGM) {
            return;
        }

        const healthUpdate = getProperty(update, "data." + this.settings.healthAttribute + ".value");
        const activeTokens = actor.getActiveTokens();

        if (healthUpdate === undefined || !activeTokens.length) {
            return;
        }

        const healthState = this._checkActorHealthState(actor, update);

        for (let t of activeTokens) {
            switch (healthState) {
                case CUBButler.HEALTH_STATES.DEAD:
                case CUBButler.HEALTH_STATES.UNCONSCIOUS:
                    this._markDead(t);
                    if (this.settings.combatTrackDead) {
                        this._toggleTrackerDead(t);
                    }
                    break;

                case CUBButler.HEALTH_STATES.INJURED:
                    this._markInjured(t);
                    if (this.settings.combatTrackDead) {
                        this._toggleTrackerDead(t);
                    }
                    break;

                default:
                    this._markHealthy(t);
                    if (this.settings.combatTrackDead) {
                        this._toggleTrackerDead(t);
                    }
                    break;
                
            }
        }
    }
}