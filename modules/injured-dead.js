import { HEALTH_STATES, SETTING_KEYS } from "./butler.js";
import { Sidekick } from "./sidekick.js";
import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";

/**
 * Mark a token injured or dead based on threshold
 */
export class InjuredAndDead {
    /**
     * Checks the health state of a token using the update supplied from a Hook
     * @param {Object} token 
     * @param {Object} update 
     */
    static _checkTokenHealthState(token, update) {
        const healthAttribute = Sidekick.getSetting(SETTING_KEYS.injuredDead.healthAttribute);
        const enableUnconscious = Sidekick.getSetting(SETTING_KEYS.injuredDead.enableUnconscious);
        const unconsciousActorType = Sidekick.getSetting(SETTING_KEYS.injuredDead.unconsciousActorType);

        const currentHealth = getProperty(token, `actor.data.data.${healthAttribute}.value`);
        const updateHealth = getProperty(update, `actorData.data.${healthAttribute}.value`);
        const maxHealth = getProperty(token, `actor.data.data.${healthAttribute}.max`);

        const isDead = InjuredAndDead._checkForDead(currentHealth);
        const isInjured = InjuredAndDead._checkForInjured(currentHealth, maxHealth);
        const markUnconscious = (enableUnconscious && token.actor.data.type === unconsciousActorType) ? true : false;

        if (isDead) {
            if (markUnconscious) {
                return HEALTH_STATES.UNCONSCIOUS;
            }
            return HEALTH_STATES.DEAD;
        } else if (isInjured) {
            return HEALTH_STATES.INJURED;
        }

        return;
    }

    /**
     * Checks the health state of an actor using the update supplied from a Hook
     * @param {Object} actor 
     * @param {Object} update 
     */
    static _checkActorHealthState(actor, update) {
        const healthAttribute = Sidekick.getSetting(SETTING_KEYS.injuredDead.healthAttribute);
        const enableUnconscious = Sidekick.getSetting(SETTING_KEYS.injuredDead.enableUnconscious);
        const unconsciousActorType = Sidekick.getSetting(SETTING_KEYS.injuredDead.unconsciousActorType);

        const currentHealth = getProperty(actor, `data.data.${healthAttribute}.value`);
        const updateHealth = getProperty(update, `data.${healthAttribute}.value`);
        const maxHealth = getProperty(actor, `data.data.${healthAttribute}.max`);

        const isDead = InjuredAndDead._checkForDead(currentHealth);
        const isInjured = InjuredAndDead._checkForInjured(currentHealth, maxHealth);
        const markUnconscious = (enableUnconscious && actor.data.type === unconsciousActorType) ? true : false;

        if (isDead) {
            if (markUnconscious) {
                return HEALTH_STATES.UNCONSCIOUS;
            }
            return HEALTH_STATES.DEAD;
        } else if (isInjured) {
            return HEALTH_STATES.INJURED;
        }

        return;
    }

    /**
     * Checks if the given health value is 0
     * @param {Number} value 
     * @returns {Boolean}
     */
    static checkForDead(value) {
        return value === 0 ? true : false;
    }

    /**
     * Checks if the given value is below the threshold
     * @param {Number} value 
     * @param {Number} max
     * @returns {Boolean}
     */
    static checkForInjured(value, max) {
        const threshold = Sidekick.getSetting(SETTING_KEYS.injuredDead.threshold);
        return (value < max * (threshold / 100)) ?  true : false;
    }

    /**
     * Retrieves an Actor type based on the index stored in the setting
     * @returns {String}
     */
    static getUnconsciousActorType() {
        try {
            const unconsciousActorType = Sidekick.getSetting(SETTING_KEYS.injuredDead.unconsciousActorType);
            return game.system.entityTypes.Actor[unconsciousActorType];
        } catch(e) {
            console.warn(e);
            return;
        }
    }

    /**
     * Removes injury and dead effects/overlay on a token
     * @param {Object} token 
     */
    static _markHealthy(token) {
        const injuredIcon = Sidekick.getSetting(SETTING_KEYS.injuredDead.injuredIcon);
        const deadIcon = Sidekick.getSetting(SETTING_KEYS.injuredDead.deadIcon);
        const unconsciousIcon = Sidekick.getSetting(SETTING_KEYS.injuredDead.unconsciousIcon);

        const tokenEffects = getProperty(token, "data.effects");
        const tokenOverlay = getProperty(token, "data.overlayEffect");
        const hasOverlay = getProperty(token, "data.overlayEffect") != null;
        const hasEffects = getProperty(token, "data.effects.length") > 0;

        const wasInjured = Boolean(tokenEffects && tokenEffects.find(e => e == injuredIcon)) || false;
        const wasDead = Boolean(tokenOverlay === deadIcon);
        const wasUnconscious = Boolean(tokenOverlay === unconsciousIcon);

        if (hasEffects && wasInjured) {
            return token.toggleEffect(injuredIcon);
        }

        if (hasOverlay && wasDead) {
            return token.toggleOverlay(deadIcon);
        }

        if (hasOverlay && wasUnconscious) {
            return token.toggleOverlay(unconsciousIcon);
        }
    }

    /**
     * Sets an injured effect on a token, removes dead overlay
     * @param {Object} token 
     */
    static _markInjured(token) {
        const injuredIcon = Sidekick.getSetting(SETTING_KEYS.injuredDead.injuredIcon);
        const deadIcon = Sidekick.getSetting(SETTING_KEYS.injuredDead.deadIcon);
        const unconsciousIcon = Sidekick.getSetting(SETTING_KEYS.injuredDead.unconsciousIcon);

        const tokenEffects = getProperty(token, "data.effects");
        const tokenOverlay = getProperty(token, "data.overlayEffect");
        const hasOverlay = getProperty(token, "data.overlayEffect") != null;
        const hasEffects = getProperty(token, "data.effects.length") > 0;

        const isInjured = Boolean(tokenEffects.find(e => e == injuredIcon)) || false;
        const wasDead = Boolean(tokenOverlay == deadIcon);
        const wasUnconscious = Boolean(tokenOverlay === unconsciousIcon);

        if (!isInjured) {
            token.toggleEffect(injuredIcon);
        }

        if (wasDead) {
            token.toggleOverlay(deadIcon);
        }

        if (wasUnconscious) {
            token.toggleOverlay(unconsciousIcon);
        }
    }

    /**
     * Set a dead overlay on a token, removes all effects
     * @param {Object} token 
     */
    static async _markDead(token) {
        const enableUnconscious = Sidekick.getSetting(SETTING_KEYS.injuredDead.enableUnconscious);
        const unconsciousActorType = Sidekick.getSetting(SETTING_KEYS.injuredDead.unconsciousActorType);

        const injuredIcon = Sidekick.getSetting(SETTING_KEYS.injuredDead.injuredIcon);
        const deadIcon = Sidekick.getSetting(SETTING_KEYS.injuredDead.deadIcon);
        const unconsciousIcon = Sidekick.getSetting(SETTING_KEYS.injuredDead.unconsciousIcon);

        const tokenEffects = getProperty(token, "data.effects");
        const hasEffects = getProperty(token, "data.effects.length") > 0;
        const tokenOverlay = getProperty(token, "data.overlayEffect");

        const isDead = (tokenOverlay === deadIcon) ? true : false;
        const isInjured = Boolean(tokenEffects.find(e => e == injuredIcon)) || false;
        const isUnconscious = (tokenOverlay === unconsciousIcon) ? true : false;
        const markUnconscious = (enableUnconscious && token.actor.data.type === unconsciousActorType) ? true : false;

        if (!isUnconscious && markUnconscious) {
            if (hasEffects && isInjured) {
                token.toggleEffect(injuredIcon);
            }
            await token.toggleOverlay(unconsciousIcon);

            const enhancedConditions = Sidekick.getSetting(SETTING_KEYS.enhancedConditions.enable);
            if (enhancedConditions) {
                const effects = tokenEffects.concat(token.data.overlayEffect);
                const map = Sidekick.getSetting(SETTING_KEYS.enhancedConditions.map);
                // lookup entry mapping
                // output to chat
                return EnhancedConditions.lookupEntryMapping(token, map, effects);
            }

            return;
        }

        if (hasEffects) {
            token.update(token.scene.id, {
                "effects": []
            });
        }

        if (!isDead) {
            return token.toggleOverlay(deadIcon);
        }
    }

    /**
     * Toggles the combat tracker death status based on token hp
     * @param {Object} token 
     */
    static async toggleTrackerDefeated(token) {
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
                    defeated: (tokenHp === 0)
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
    static async _hookOnUpdateToken(scene, sceneID, update, options, userId) {
        const enableDead = Sidekick.getSetting(SETTING_KEYS.injuredDead.enableDead);
        const enableInjured = Sidekick.getSetting(SETTING_KEYS.injuredDead.enableInjured);
        const enableUnconscious = Sidekick.getSetting(SETTING_KEYS.injuredDead.enableUnconscious);
        
        if ((!enableDead && !enableInjured && !enableUnconscious) || !game.user.isGM) {
            return;
        }

        const healthAttribute = Sidekick.getSetting(SETTING_KEYS.injuredDead.healthAttribute);

        const token = canvas.tokens.get(update._id);
        const healthUpdate = getProperty(update, `actorData.data.${healthAttribute}.value`);

        if (game.userId != userId || healthUpdate == undefined || token.actorLink) {
            return;
        }

        const tokenHealthState = InjuredAndDead._checkTokenHealthState(token, update);
        InjuredAndDead.markToken(token, tokenHealthState);
        
    }

    /**
     * Marks a token based on its health state
     * @param {*} token 
     * @param {*} healthState
     */
    static markToken(token, healthState) {
        const enableDead = Sidekick.getSetting(SETTING_KEYS.injuredDead.enableDead);
        const enableInjured = Sidekick.getSetting(SETTING_KEYS.injuredDead.enableInjured);
        const enableUnconscious = Sidekick.getSetting(SETTING_KEYS.injuredDead.enableUnconscious);
        const markDefeated = Sidekick.getSetting(SETTING_KEYS.injuredDead.markDefeated);

        // Mark the token based on its health state and optionally toggle defeated in tracker
        switch (healthState) {
            case HEALTH_STATES.DEAD && enableDead:
            case HEALTH_STATES.UNCONSCIOUS && enableUnconscious:
                InjuredAndDead._markDead(token);
                if (markDefeated) {
                    InjuredAndDead.toggleTrackerDefeated(token);
                }
                break;

            case HEALTH_STATES.INJURED && enableInjured:
                InjuredAndDead._markInjured(token);
                if (markDefeated) {
                    InjuredAndDead.toggleTrackerDefeated(token);
                }
                break;

            default:
                InjuredAndDead._markHealthy(token);
                if (markDefeated) {
                    InjuredAndDead.toggleTrackerDefeated(token);
                }
                break;
        }
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
    static _hookOnUpdateActor(actor, update, options, userId) {
        const enableDead = Sidekick.getSetting(SETTING_KEYS.injuredDead.enableDead);
        const enableInjured = Sidekick.getSetting(SETTING_KEYS.injuredDead.enableInjured);
        const enableUnconscious = Sidekick.getSetting(SETTING_KEYS.injuredDead.enableUnconscious);

        if ((!enableDead && !enableInjured && !enableUnconscious) || !game.user.isGM) {
            return;
        }

        const healthAttribute = Sidekick.getSetting(SETTING_KEYS.injuredDead.healthAttribute);

        const healthUpdate = getProperty(update, `data.${healthAttribute}.value`);
        const activeTokens = actor.getActiveTokens();

        if (healthUpdate === undefined || !activeTokens.length) {
            return;
        }

        const healthState = InjuredAndDead._checkActorHealthState(actor, update);

        activeTokens.forEach(t => InjuredAndDead.markToken(t, healthState));
    }
}