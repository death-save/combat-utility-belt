import { SHORTNAME, FLAGS, SETTING_KEYS } from "butler.js";
import { Sidekick } from "sidekick.js";

/**
 * Rerolls initiative for all combatants
 * @todo refactor to preUpdate hook
 */
export class RerollInitiative {
    
    /**
     * Update Combat handler
     * @param {*} combat 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    async _onUpdateCombat(combat, update, options={}, userId) {
        const reroll = Sidekick.getSetting(SETTING_KEYS.rerollInitiative.reroll);
        const rerollTemp = Sidekick.getSetting(SETTING_KEYS.rerollInitiative.rerollTemp);

        // Return early if we are NOT a GM OR we are not the player that triggered the update AND that player IS a GM
        if (!reroll || !game.user.isGM || (game.userId !== userId && game.users.get(userId).isGM)) {
            return
        }

        const roundUpdate = !!getProperty(update, "round");

        // Return if this update does not contains a round
        if (!roundUpdate) {
            return;
        }

        if (combat instanceof CombatEncounters) {
            combat = game.combats.get(update._id);
        }
        
        // If we are not moving forward through the rounds, return
        if (update.round < 1 || update.round < combat.previous.round) {
            return;
        }

        const combatantIds = rerollTemp ? 
            combat.combatants.map(c => c._id) : 
            combat.combatants.filter(c => !hasProperty(c, `flags.${SHORTNAME}.${FLAGS.temporaryCombatants.temporaryCombatant}`)).map(c => c._id);

        await combat.rollInitiative(combatantIds);
        await combat.update({turn: 0});
    }
}