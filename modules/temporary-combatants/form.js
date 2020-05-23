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
            title: "Temporary Combatant",
            template: "modules/combat-utility-belt/templates/temporary-combatant-form.html",
            classes: ["sheet"],
            width: 500,
            height: "auto",
            resizable: true,
            submitOnClose: false
        });
    }

    async _updateObject(event, formData) {
        const folderName = "Temporary Combatants";
        const flags = {
            [NAME] : {
                [FLAGS.temporaryCombatants.temporaryCombatant]: true
            }
        }
        let folder = game.folders.entities.find(f => f.name === folderName);
        if (!folder) {
            folder = await Folder.create({name: "Temporary Combatants", type: "Actor", parent: null}, {displaySheet: false});
        }

        const actor = await Actor.create({
            name: formData.name, 
            type:"npc",
            img: formData.icon,
            folder: folder.id,
            flags
        },{displaySheet: false});

        const tokenData = duplicate(actor.data.token);
        tokenData.x = 0;
        tokenData.y = 0;
        tokenData.disposition = 0;
        tokenData.img = formData.icon;
        tokenData.flags = flags;
        const token = await Token.create(tokenData);

        const combatant = await game.combat.createEmbeddedEntity("Combatant", {
            tokenId: token.id, 
            hidden: formData.hidden, 
            initiative: formData.init,
            flags
        });
        
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