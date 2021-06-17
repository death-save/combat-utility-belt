import { Sidekick } from "../sidekick.js";
import { FLAGS, NAME, SETTING_KEYS } from "../butler.js";
import { TemporaryCombatantForm } from "./form.js";

export class TemporaryCombatants {
    /**
     * Handler for combat tracker render
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    static async _onRenderCombatTracker(app, html, data) {
        const enable = Sidekick.getSetting(SETTING_KEYS.tempCombatants.enable);

        if (!game.user.isGM || !enable) {
            return;
        }

        const combatantList = html.find("#combat-tracker.directory-list");
        const listItemHtml = `<div class="flexrow"><a class="add-temporary"><i class="fa fa-plus"></i> Add Temporary Combatant</a></div>`;

        if (!game.combat || !combatantList.length) {
            return;
        }

        combatantList.append(listItemHtml);

        const button = combatantList.find(".add-temporary")

        button.on("click", event => {
            TemporaryCombatants._onAddTemporaryCombatant(event);
        });
    }

    /**
     * Open the Temporary Combatant form
     * @param {*} event 
     */
    static _onAddTemporaryCombatant(event) {
        // spawn a form to enter details
        const temporaryCombatantForm = new TemporaryCombatantForm({}).render(true);
    }

    /**
     * Removes any temporary combatants created by this module
     * @param {*} combatants 
     * @param {*} scene 
     */
    static _removeTemporaryCombatants(combatants, scene) {
        const tempCombatants = combatants.filter(c => c.getFlag(NAME, FLAGS.temporaryCombatants.temporaryCombatant));
        
        const tokens = tempCombatants.map(c => c.tokenId);
        const actors = tempCombatants.map(c => c.actor.Id);
        const tokenClass = getDocumentName("Token");

        if (tokenClass && tokenIds) {
            tokenClass.deleteDocuments(tokenIds);
        }
        
        if (actorIds) {
            Actor.deleteDocuments(actorIds);
        }
        
    }

    /**
     * Removes a single temporary combatant created by this module
     * @param {*} combatant 
     * @param {*} scene 
     */
    static _removeTemporaryCombatant(combatant, scene) {
        if (!combatant.getFlag(NAME, FLAGS.temporaryCombatants.temporaryCombatant)) return;

        combatant.actor?.delete();
        combatant.token?.delete();
    }
}