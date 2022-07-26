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
        const listItemHtml = `<div class="flexrow"><a class="add-temporary"><i class="fa fa-plus"></i> ${game.i18n.localize(`${NAME}.TEMPORARY_COMBATANTS.AddTempCombatant`)}</a></div>`;

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
    static async _removeTemporaryCombatants(combatants) {
        const tempCombatants = combatants.filter(c => c.getFlag(NAME, FLAGS.temporaryCombatants.temporaryCombatant));
        
        const tokens = combatants.filter(c => c.token).map(c => c.token) ?? [];
        const sceneIds = new Set(tokens.map(t => t.parent.id));
        const actorIds = tempCombatants.filter(c => c.actor).map(c => c.actor.Id);
        
        for (const sceneId of sceneIds) {
            const scene = game.scenes.get(sceneId);
            if (!scene) continue;
            const tokenIds = tokens.filter(t => t.sceneId == scene.Id).map(t => t.id);
            scene.deleteEmbeddedDocuments("Token", tokenIds);
        }
        
        
        if (actorIds) {
            Actor.deleteDocuments(actorIds);
        }
        
    }

    /**
     * Removes a single temporary combatant created by this module
     * @param {*} combatant 
     */
    static async _removeTemporaryCombatant(combatant) {
        if (!combatant.getFlag(NAME, FLAGS.temporaryCombatants.temporaryCombatant)) return;

        const actor = combatant.actor;
        const token = combatant.token;

        if (actor && game.actors.get(actor.id)) {
            await actor.delete();
        }

        if (token && token.parent) {
            await token.parent.deleteEmbeddedDocuments("Token", [token.id]);
        }        
    }
}