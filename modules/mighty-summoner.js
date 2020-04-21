import { Sidekick } from "./sidekick.js";
import { SETTING_KEYS } from "./butler.js";
import { TokenUtility } from "./utils/token.js";

export class MightySummoner {

    /**
     * Checks for the existence of the designated feat
     * @param {*} actor 
     */
    static _checkForFeat(actor) {
        const feat = "Mighty Summoner";
        const hasFeat = MightySummoner.hasFeat(actor, feat);

        if (hasFeat) {
            return true;
        }
        
        // If the supplied actor doesn't have the feat, check the other actors owned by the actor's owner
        const owners = Object.keys(actor.data.permission).filter(p => p !== "default" && actor.data.permission[p] === CONST.ENTITY_PERMISSIONS.OWNER);

        if (!owners) {
            return;
        }

        const ownedActors = owners.map(owner => {
            const actors = game.actors.entities.filter(a => hasProperty(a, `data.permission.${owner}`));
            return actors;
        });

        if (!ownedActors.length) {
            return;
        }

        // Look for a single actor that has the feat
        const featActor = ownedActors.find(actor => MightySummoner.hasFeat(actor, feat));

        if (!featActor) {
            return;
        }

        return true;
    }

    /**
     * Creates a dialog to determine if the creature is being summoned
     */
    static _createDialog() {
        let isSummon = false;

        new Dialog({
            title: "Mighty Summoner",
            content: "<p>Is this monster being summoned?</p>",
            buttons: {
                yes: {
                    icon: `<i class="fas fa-check"></i>`,
                    label: "Yes",
                    callback: () => isSummon = true
                },
                no: {
                    icon: `<i class="fas fa-times"></i>`,
                    label: "No"
                }
            },
            default: "yes"
        }).render(true);

        return isSummon;
    }

    /**
     * Constructs hp data based on feat mechanics
     * @param {*} actor 
     */
    static _calculateHPFormula(actor) {
        const formula = getProperty(actor, "data.data.attributes.hp.formula");
        const match = formula.match(/\d+/)[0];
        if (!match) {
            return;
        }

        const newFormula = `${formula} + (${match * 2})`;
        return newFormula;
    }

    /**
     * Looks for the existence of a named feat in the Actor's items
     * @param {*} actor 
     * @param {String} feat
     */
    static hasFeat(actor, feat) {
        return actor.items ? !!actor.items.find(i => i.type === "feat" && i.name.includes(feat)) : false;
    }
}