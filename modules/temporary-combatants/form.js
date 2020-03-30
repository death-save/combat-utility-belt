/**
 * 
 */
class CUBTemporaryCombatantForm extends FormApplication {
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
            resizable: true
        });
    }

    async _updateObject(event, formData) {
        const folderName = "Temporary Combatants";
        let folder = game.folders.entities.find(f => f.name === folderName);
        if (!folder) {
            folder = await Folder.create({name: "Temporary Combatants", type: "Actor", parent: null}, {displaySheet: false});
        }

        const actor = await Actor.create({
            name: formData.name, 
            type:"npc",
            img: formData.icon,
            folder: folder.id,
            flags: {
                [CUBButler.MODULE_NAME + "." + CUB.combatTracker.GADGET_NAME + "(temporaryCombatant)"]: true
            }
        },{displaySheet: false});

        const tokenData = duplicate(actor.data.token);
        tokenData.x = 0;
        tokenData.y = 0;
        tokenData.disposition = 0;
        tokenData.img = formData.icon;
        const token = await Token.create(game.scenes.active._id, tokenData);

        const combatant = await game.combat.createEmbeddedEntity("Combatant", {
            tokenId: token._id, 
            hidden: formData.hidden, 
            initiative: formData.init,
            flags: {
                [CUBButler.MODULE_NAME + "." + CUB.combatTracker.GADGET_NAME + "(temporaryCombatant)"]: true
            }
        });
        
    }
}