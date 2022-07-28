import * as BUTLER from "./butler.js";
import { Sidekick } from "./sidekick.js";

/**
 * Pan/Select Gadget
 */
export class PanSelect {
    /**
     * Pre-update Combat handler
     * @param {*} combat 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    static _onPreUpdateCombat(combat, update, options, userId) {
        const enablePan = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.enablePan);
        const enableSelect = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.enableSelect);

        if (!enablePan && !enableSelect) return;

        if (hasProperty(update, "turn") || getProperty(update, "started") || (getProperty(combat, "round") === 0 && getProperty(update, "round") === 1)) {
            options[BUTLER.NAME] = options[BUTLER.NAME] ?? {};
            setProperty(options, `${BUTLER.NAME}.${BUTLER.FLAGS.panSelect.shouldPan}`,  enablePan);
            setProperty(options, `${BUTLER.NAME}.${BUTLER.FLAGS.panSelect.shouldSelect}`,  enableSelect);
        } 
    }

    /**
     * Update Combat handler
     * @param {*} combat 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId
     */
    static _onUpdateCombat(combat, update, options, userId) {
        const combatant = update.turn ? combat.turns[update.turn] : combat.combatant;

        if (!combatant) return;

        if (getProperty(options, `${BUTLER.NAME}.${BUTLER.FLAGS.panSelect.shouldPan}`)) {
            PanSelect._updateHandler(combatant, "pan");
        }

        if (getProperty(options, `${BUTLER.NAME}.${BUTLER.FLAGS.panSelect.shouldSelect}`)) {
            PanSelect._updateHandler(combatant, "select");
        }
    }

    /**
     * Determines if a pan/select workflow should begin
     * @param {Combatant} combatant
     */
    static _updateHandler(combatant, type) {
        const token = combatant.token;
        const temporary = hasProperty(combatant, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.temporaryCombatants.temporaryCombatant}`);

        if (!type || !token || temporary) return;

        switch (type) {
            case "pan":
                const panGM = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.panGM);
                const panPlayers = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.panPlayers);

                if (!game.user.isGM && panPlayers !== Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.panSelect.panPlayers, BUTLER.DEFAULT_CONFIG.panSelect.panPlayers.none)) {
                    return PanSelect._checkPlayerPan(token);
                }
        
                if (game.user.isGM && panGM !== Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.panSelect.panGM, BUTLER.DEFAULT_CONFIG.panSelect.panGM.none)) {
                    return PanSelect._checkGMPan(token);
                }
                break;
            
            case "select":
                const selectGM = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.selectGM);
                const selectPlayers = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.selectPlayers);
                const observerDeselect = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.observerDeselect);
                
                if (game.user.isGM && selectGM !== Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.panSelect.panGM, BUTLER.DEFAULT_CONFIG.panSelect.panGM.none)) {
                    return PanSelect._checkGMSelect(token);
                }
        
                if (observerDeselect) {
                    PanSelect._checkObserverDeselect(token);
                }
        
                if (selectPlayers) {
                    PanSelect._checkPlayerSelect(token);
                }
                break;

            default:
                return;
        }
    }

    /**
     * Determine if the player should be panned
     * @param {*} token
     */
    static _checkPlayerPan(token) {
        if (token instanceof TokenDocument) {
            token = canvas.tokens.get(token.id);
        }

        if (!token) return;

        const actor = token?.actor;

        if (!actor) return;

        const actorPermission = actor ? (actor.data.ownership[game.userId] || 0) : null;

        if (actorPermission === null) {
            return;
        }

        const panPlayers = Sidekick.getSetting(BUTLER.SETTING_KEYS.panSelect.panPlayers);
        // all - pan always, owner - pan when i own, observer - pan when i own OR observe, none - return

        switch (BUTLER.DEFAULT_CONFIG.panSelect.panPlayers[panPlayers]) {
            case BUTLER.DEFAULT_CONFIG.panSelect.panPlayers.observer:
                if (actorPermission >= CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER) {
                    break;
                }

                return;
     
            case BUTLER.DEFAULT_CONFIG.panSelect.panPlayers.owner:
                if (actorPermission >= CONST.DOCUMENT_PERMISSION_LEVELS.OWNER) {
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

        if (!actor || actorPermission === null || actorPermission < CONST.DOCUMENT_PERMISSION_LEVELS.OWNER) {
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
        const actorPermission = actor ? actor.data.ownership[game.userId] || 0 : null;

        if (actorPermission === null) {
            return;
        }

        if (actorPermission < CONST.DOCUMENT_PERMISSION_LEVELS.OWNER) {
            return canvas.tokens.releaseAll();
        }
    }
}
