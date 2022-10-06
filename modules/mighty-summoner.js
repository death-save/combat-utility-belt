import { TokenUtility } from "./utils/token.js";
import { ActorUtility } from "./utils/actor.js";

export class MightySummoner {

    /**
     * Checks for the existence of the designated feat
     * @param {*} actor 
     * @todo Move this to token utility as it's no longer tied to this feat alone
     */
    static _checkForFeat(actor, feat) {
        const hasFeat = ActorUtility.hasFeat(actor, feat);

        if (hasFeat) {
            return true;
        }
        
        // If the supplied actor doesn't have the feat, check the other actors owned by the actor's owner
        const owners = Object.keys(actor.ownership).filter(p => p !== "default" && actor.ownership[p] === CONST.DOCUMENT_PERMISSION_LEVELS.OWNER);

        if (!owners) {
            return;
        }
        
        const ownedActors = owners.map(owner => {
            const actors = game.actors.contents.filter(a => hasProperty(a, `ownership.${owner}`));
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
    static async _createDialog(tokenDocument) {
        const actor = tokenDocument?.actor;
        const title = "Mighty Summoner";
        const content = "<p>Is this monster being summoned?</p>";
        const yes = () => {
            const formula = MightySummoner._calculateHPFormula(actor);
            return TokenUtility._processHPUpdate(tokenDocument, null, formula);
        }
        const no = () => {
            const shouldRollHP = TokenUtility._shouldRollHP(tokenDocument);
            if (!shouldRollHP) return;
            return TokenUtility._processHPUpdate(tokenDocument);
        }
        const defaultYes = false;
        return Dialog.confirm({title, content, yes, no, defaultYes},{});
    }

    /**
     * Constructs hp data based on feat mechanics
     * @param {*} actor 
     */
    static _calculateHPFormula(actor) {
        const formula = getProperty(actor, "system.attributes.hp.formula");
        const match = formula.match(/\d+/)[0];
        if (!match) {
            return;
        }

        const newFormula = `${formula} + ${match * 2}`;
        return newFormula;
    }
}