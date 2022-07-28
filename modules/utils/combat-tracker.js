import { Sidekick } from "../sidekick.js";
import * as BUTLER from "../butler.js";
import { TemporaryCombatants } from "../temporary-combatants/temporary-combatants.js";

export class TrackerUtility {
    /**
     * Handler for deleteCombat hook
     * @param {*} combat 
     * @param {*} options 
     * @param {*} userId 
     */
    static _onDeleteCombat(combat, options, userId) {
        if (!game.userId === userId) {
            return;
        }

        const enableTempCombatants = Sidekick.getSetting(BUTLER.SETTING_KEYS.tempCombatants.enable);
        const tempCombatants = combat.combatants.filter(c => hasProperty(c, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.temporaryCombatants.temporaryCombatant}`));

        if (enableTempCombatants && tempCombatants.length) {
            TemporaryCombatants._removeTemporaryCombatants(tempCombatants);
        }  
    }

    /**
     * Handler for deleteCombatant hook
     * @param {*} combatantId 
     * @param {*} options 
     * @param {String} userId
     */
    static _onDeleteCombatant(combatant, options, userId) {
        const tempCombatantFlag = combatant?.token?.getFlag(BUTLER.NAME, BUTLER.FLAGS.temporaryCombatants.temporaryCombatant);

        if (tempCombatantFlag){
            TemporaryCombatants._removeTemporaryCombatant(combatant);
        }
    }

    /**
     * Handler for combat tracker render
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    static async _onRenderCombatTracker(app, html, data) {
        if (!game.user.isGM) {
            return;
        }

        const resourceSpans = html.find(".resource");

        if (resourceSpans.length) {
            TrackerUtility._replaceResourceElement(html);
        }
    } 

    /**
     * Replaces the default token resource span with a text input
     * @param {*} html 
     */
    static _replaceResourceElement(html) {
        // Find all the resource spans
        const resourceSpans = html.find(".resource");


        // Replace the element
        $(resourceSpans).each(function() {
            $(this).replaceWith('<input type="text" name="resource" value="' + $(this).text() + '">');
        });

        const resourceInputs = html.find('input[name="resource"]');
        resourceInputs.on("change", event => TrackerUtility._onChangeResource(event));
    }

    /**
     * Handler for updates to the token resource
     * @param {*} event 
     */
    static async _onChangeResource(event) {
        // Get the tracker settings and extract the resource property
        const trackerSettings = game.settings.get("core", Combat.CONFIG_SETTING);
        const resource = trackerSettings.resource;

        // Find the parent list element
        const li = event.target.closest("li");

        if (!li) return;

        // Get the combatant from the list element
        const combatantId = li?.dataset?.combatantId;
        const combatant = combatantId ? game.combat.combatants.find(c => c.id === combatantId) : null;

        if (!combatant) return;

        // Find the token and update
        const actor = combatant?.token?.actor;

        if (!actor) return;

        return await actor.update({["system." + resource]: event.target.value});
    }
}
