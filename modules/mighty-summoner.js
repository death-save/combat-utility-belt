import { NAME, DEFAULT_CONFIG } from "./butler.js";
import { TokenUtility } from "./utils/token.js";
import { ActorUtility } from "./utils/actor.js";

export class MightySummoner {

    /**
     * Checks for the existence of the designated feat
     * @param {*} actor 
     */
    static _checkForFeat(actor) {
        const feat = "Mighty Summoner";
        const hasFeat = ActorUtility.hasFeat(actor, feat);

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
        }).flat();

        if (!ownedActors.length) {
            return;
        }

        // Look for a single actor that has the feat
        const featActor = ownedActors.find(actor => ActorUtility.hasFeat(actor, feat));

        if (!featActor) {
            return;
        }

        return true;
    }

    /**
     * Creates a dialog to determine if the creature is being summoned
     */
    static async _createDialog(tokenData, actor) {
        new Dialog({
                title: "Mighty Summoner",
                content: "<p>Is this monster being summoned?</p>",
                buttons: {
                    yes: {
                        icon: `<i class="fas fa-check"></i>`,
                        label: "Yes",
                        callback: () => MightySummoner._handleSummon(tokenData, actor, true)
                    },
                    no: {
                        icon: `<i class="fas fa-times"></i>`,
                        label: "No",
                        callback: () => MightySummoner._handleSummon(tokenData, actor, false)
                    }
                },
                default: "yes"
            }).render(true);
    }

    /**
     * Handles summoning with the feat
     * @param {*} tokenData 
     * @param {*} actor 
     * @param {*} isSummon 
     */
    static _handleSummon(tokenData, actor, isSummon) {
        if (!isSummon) {
            return;
        }

        const newFormula = MightySummoner._calculateHPFormula(actor);
        const newHP = TokenUtility.rollHP(actor, newFormula);
        const hpUpdate = TokenUtility._buildHPData(newHP);
        const newData = mergeObject(tokenData, hpUpdate);
        setProperty(newData, `flags.${NAME}.${DEFAULT_CONFIG.mightySummoner.flags.mightySummoner}`, true);
        Token.create(newData);
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

        const newFormula = `${formula} + ${match * 2}`;
        return newFormula;
    }
}