import { Sidekick } from "../sidekick.js";
import { SETTING_KEYS } from "../butler.js";
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
        const listItemHtml = `<div class="flexrow"><a class="add-temporary"><i class="fa fa-plus"></i> Add Temporary Combatant</a></div>`

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
        
        const tokenIds = combatants.map(c => c.tokenId);
        const actorIds = combatants.map(c => c.actor.id);

        if (tokenIds) {
            scene.deleteManyEmbeddedEntities("Token", tokenIds);
        }
        
        if (actorIds) {
            Actor.deleteMany(actorIds);
        }
        
    }

    /**
     * Removes a single temporary combatant created by this module
     * @param {*} combatant 
     * @param {*} scene 
     */
    static _removeTemporaryCombatant(combatant, scene) {
        const tokenId = combatant.tokenId;
        const actor = game.actors.get(combatant.actor.id);

        if (tokenId){
            scene.deleteEmbeddedEntity("Token", tokenId);
        }
        
        if (actor){
            actor.delete();
        }
        
    }
}