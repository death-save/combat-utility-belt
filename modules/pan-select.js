import * as BUTLER from "./butler.js";
import { Sidekick } from "./sidekick.js";

/**
 * 
 */
export class PanSelect {
    /**
     * Determines if a panning workflow should begin
     * @param {Object} combat
     * @param {Object} update 
     */
    static _panHandler(combat, update) {
        const enablePan = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.enablePan);
        const panGM = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.panGM);
        const panPlayers = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.panPlayers);

        if (!hasProperty(update, "turn") || !enablePan) {
            return;
        }

        const combatant = combat.combatant;
        const temporary = hasProperty(combatant, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.temporaryCombatants.temporaryCombatant}`);

        if (temporary) {
            return;
        }

        const tracker = combat.entities ? combat.entities.find(tr => tr.id === update.id) : combat;
        const token = hasProperty(update, "turn") ? tracker.turns[update.turn].token : tracker.turns[0].token;

        if (!game.user.isGM && panPlayers !== Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.panSelect.panPlayers, BUTLER.DEFAULT_CONFIG.panSelect.panPlayers.none)) {
            return PanSelect._checkPlayerPan(token);
        }

        if (game.user.isGM && panGM !== Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.panSelect.panGM, BUTLER.DEFAULT_CONFIG.panSelect.panGM.none)) {
            return PanSelect._checkGMPan(token);
        }
    }

    /**
     * Determine if the player should be panned
     * @param {*} token
     */
    static _checkPlayerPan(token) {
        const actor = token ? game.actors.get(token.actorId) : null;
        const actorPermission = actor ? actor.data.permission[game.userId] || 0 : null;
        const panPlayers = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.panPlayers);

        if (actorPermission === null) {
            return;
        }
        // all - pan always, owner - pan when i own, observer - pan when i own OR observe, none - return

        switch (BUTLER.DEFAULT_CONFIG.panSelect.panPlayers[panPlayers]) {
            case BUTLER.DEFAULT_CONFIG.panSelect.panPlayers.observer:
                if (actorPermission >= CONST.ENTITY_PERMISSIONS.OBSERVER) {
                    break;
                }

                return;
     
            case BUTLER.DEFAULT_CONFIG.panSelect.panPlayers.owner:
                if (actorPermission >= CONST.ENTITY_PERMISSIONS.OWNER) {
                    break;
                }

                return;

            case BUTLER.DEFAULT_CONFIG.panSelect.panPlayers.all:
                break;

            case BUTLER.DEFAULT_CONFIG.panSelect.panPlayers.none:
            default:
                if (!game.user.isGM) {
                    return;
                }
        }

        return PanSelect._panToToken(token);
    }

    /**
     * Determine if the GM should be panned
     * @param {*} token
     */
    static _checkGMPan(token) {
        if (token instanceof TokenDocument) {
            token = canvas.tokens.get(token.id);
        }

        if (!token) return;

        const actor = token?.actor;
        const panGM = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.panGM);

        if (!actor || !panGM) {
            return;
        }

        switch (BUTLER.DEFAULT_CONFIG.panSelect.panGM[panGM]) {
            case BUTLER.DEFAULT_CONFIG.panSelect.panGM.none:
                return;
            
            case BUTLER.DEFAULT_CONFIG.panSelect.panGM.npc:
                if (actor.hasPlayerOwner) {
                    return;
                }
                
                break;
            
            case BUTLER.DEFAULT_CONFIG.panSelect.panGM.all:
                break;

            default:
                return;
        }

        return PanSelect._panToToken(token);
    }

    /**
     * Pans user to the token
     * @param {*} token 
     */
    static _panToToken(token) {
        const xCoord = token.x;
        const yCoord = token.y;
        return canvas.animatePan({
                x: xCoord,
                y: yCoord
        });
    }

    /**
     * Selects the current token in the turn tracker
     * @param {Object} combat 
     * @param {Object} update 
     */
    static async _selectHandler(combat, update) {
        const enableSelect = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.enableSelect);
        const selectGM = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.selectGM);
        const selectPlayers = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.selectPlayers);
        const observerDeselect = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.observerDeselect);

        if (!hasProperty(update, "turn") || !enableSelect) {
            return;
        }

        const combatant = combat.combatant;
        const temporary = hasProperty(combatant, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.temporaryCombatants.temporaryCombatant}`);

        if (temporary) {
            return;
        }

        const tracker = combat.entities ? combat.entities.find(tr => tr.id === update.id) : combat;
        const token = hasProperty(update, "turn") ? tracker.turns[update.turn].token : tracker.turns[0].token;

        if (!token) {
            return;
        }

        if (game.user.isGM && selectGM !== Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.panSelect.panGM, BUTLER.DEFAULT_CONFIG.panSelect.panGM.none)) {
            return PanSelect._checkGMSelect(token);
        }

        if (observerDeselect) {
            PanSelect._checkObserverDeselect(token);
        }

        if (selectPlayers) {
            PanSelect._checkPlayerSelect(token);
        }
        
        return;
    }

    /**
     * Determine if the current combatant token should be selected for the GM 
     * @param {*} token 
     */
    static _checkGMSelect(token) {
        if (token instanceof TokenDocument) {
            token = canvas.tokens.get(token.id);
        }

        if (!token) return;

        const selectGM = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.selectGM);
        const actor = token?.actor;

        if (!actor || !selectGM) {
            return;
        }

        switch (BUTLER.DEFAULT_CONFIG.panSelect.panGM[selectGM]) {
            case BUTLER.DEFAULT_CONFIG.panSelect.panGM.none:
                return;
            
            case BUTLER.DEFAULT_CONFIG.panSelect.panGM.npc:
                if (actor.hasPlayerOwner) {
                    return;
                }
                
                break;
            
            case BUTLER.DEFAULT_CONFIG.panSelect.panGM.all:
                break;

            default:
                return;
        }

        return token.control();
    }

    /**
     * Determines if Player can select the current combatant token
     * @param {*} token 
     */
    static _checkPlayerSelect(token) {
        if (token instanceof TokenDocument) {
            token = canvas.tokens.get(token.id);
        }

        if (!token) return;

        const actor = token?.actor;
        const actorPermission = actor ? actor.data.permission[game.userId] || 0 : null;

        if (!actor || actorPermission === null || actorPermission < CONST.ENTITY_PERMISSIONS.OWNER) {
            return;
        }

        return token.control();
    }

    /**
     * Determines if tokens should be deselected when a non-owned Combatant has a turn
     * @param {*} token 
     */
    static _checkObserverDeselect(token) {
        const actor = token?.actor;
        const actorPermission = actor ? actor.data.permission[game.userId] || 0 : null;

        if (actorPermission === null) {
            return;
        }

        if (actorPermission < CONST.ENTITY_PERMISSIONS.OWNER) {
            return canvas.tokens.releaseAll();
        }
    }
}