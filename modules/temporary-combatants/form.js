import { NAME, FLAGS } from "../butler.js";

/**
 * 
 */
export class TemporaryCombatantForm extends FormApplication {
    constructor(object, options) {
        super(object, options);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "temporary-combatant-form",
            title: game.i18n.localize(`${NAME}.TEMPORARY_COMBATANTS.Form.Title`),
            template: "modules/combat-utility-belt/templates/temporary-combatant-form.html",
            classes: ["sheet"],
            width: 500,
            height: "auto",
            resizable: true,
            submitOnClose: false
        });
    }

    async _updateObject(event, formData) {
        const flags = {
            [NAME]: {
                [FLAGS.temporaryCombatants.temporaryCombatant]: true
            }
        }

        const combatant = await game.combat.createEmbeddedDocuments("Combatant", [{
            name: formData.name,
            img: formData.icon,
            hidden: formData.hidden, 
            initiative: formData.init,
            flags
        }]);
        
    }

    /**
     * Activate listeners for the form
     * @param {*} html 
     */
    activateListeners(html) {
        const cancelButton = html.find("button[name='cancel'");

        cancelButton.on("click", event => {
            this.close();
        });

        super.activateListeners(html);
    }
}