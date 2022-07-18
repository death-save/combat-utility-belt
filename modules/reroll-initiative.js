import { NAME, FLAGS, SETTING_KEYS } from "./butler.js";
import { Sidekick } from "./sidekick.js";

/**
 * Rerolls initiative for all combatants
 */
export class RerollInitiative {

    /**
     * 
     * @param {*} combat 
     * @param {*} update 
     * @param {*} options 
     */
    static _onPreUpdateCombat(combat, update, options, userId) {
        const reroll = Sidekick.getSetting(SETTING_KEYS.rerollInitiative.enable);

        // Return early if we are NOT a GM OR we are not the player that triggered the update AND that player IS a GM
        if (!reroll) return;

        const roundUpdate = hasProperty(update, "round");

        // Return if this update does not contains a round
        if (!roundUpdate) return;

        // If we are not moving forward through the rounds, return
        if (update.round < 2 || update.round < combat.previous.round) return;

        const gmUsers = game.users.contents.filter(u => u.isGM);
        const gmUserId = game.user.isGM ? game.userId : gmUsers.length ? gmUsers[0].id : null;

        if (!gmUserId) return;

        setProperty(options, `${NAME}.shouldReroll`, true);
        setProperty(options, `${NAME}.rerollUserId`, gmUserId);
    }
    
    /**
     * Update Combat handler
     * @param {*} combat 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    static async _onUpdateCombat(combat, update, options, userId) {
        
        const rerollTemp = Sidekick.getSetting(SETTING_KEYS.rerollInitiative.rerollTemp);
        const shouldReroll = getProperty(options, `${NAME}.shouldReroll`);
        const rerollUserId = getProperty(options, `${NAME}.rerollUserId`);

        if (!shouldReroll || game.userId != rerollUserId) return;

        const combatantIds = rerollTemp ? 
            combat.combatants.map(c => c.id) : 
            combat.combatants.filter(c => !hasProperty(c, `flags.${NAME}.${FLAGS.temporaryCombatants.temporaryCombatant}`)).map(c => c.id);

        const rollOptions = RerollInitiative.getRollInitiativeOptions();
        await combat.rollInitiative(combatantIds, rollOptions);
        await combat.update({turn: 0});
    }

    static getRollInitiativeOptions() {
        const systemId = game.system.id;

        switch (systemId) {
            case "pf1":
                return {
                    skipDialog: true
                }
        
            default:
                return {};
        }
    }
}