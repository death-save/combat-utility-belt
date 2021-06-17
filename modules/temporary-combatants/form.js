import { NAME, FLAGS, SETTING_KEYS } from "../butler.js";
import { Sidekick } from "../sidekick.js";

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
        // @todo #547 store a ref to the folder id in a module constant
        const folderName = "Temporary Combatants";
        let folder = game.folders.getName(folderName);

        if (!folder) {
            folder = await Folder.create({name: "Temporary Combatants", type: "Actor", parent: null}, {displaySheet: false});
        }
        
        const actorType = game.system.entityTypes.Actor.includes("npc") ? "npc" : game.system.entityTypes.Actor[0];
        const flags = {
            [NAME]: {
                [FLAGS.temporaryCombatants.temporaryCombatant]: true
            }
        }

        const actor = await Actor.create({
            name: formData.name, 
            type: actorType,
            img: formData.icon,
            folder: folder.id,
            flags
        },{displaySheet: false});

        const tokenData = await actor.getTokenData();
        if (!tokenData) return;

        tokenData.update({
            x: 0,
            y: 0,
            disposition: 0,
            img: formData.icon,
            flags: flags,
            actorLink: true
        });
       

        //let token = await Token.create(tokenData);
        const cls = getDocumentClass("Token");
        const token = await cls.create(tokenData, {parent: canvas.scene});

        if (!token) return;

        //token = token instanceof Array ? token[0] : token;

        const combatant = await game.combat.createEmbeddedDocuments("Combatant", [{
            tokenId: token.id, 
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