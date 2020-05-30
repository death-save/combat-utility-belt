import { NAME, FLAGS } from "./butler.js";
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
        const title = "Mighty Summoner";
        const content = "<p>Is this monster being summoned?</p>";
        const yes = () => MightySummoner._handleCreate(tokenData, actor, true);
        const no = () => MightySummoner._handleCreate(tokenData, actor, false);
        const defaultYes = false;
        return Dialog.confirm({title, content, yes, no, defaultYes},{});
    }

    /**
     * Handles summoning with the feat
     * @param {*} tokenData 
     * @param {*} actor 
     * @param {*} isSummon 
     * @todo don't handle creation here: pass the manipulated data back to the precreate hook somehow
     *       we are setting a flag on every token create where some owned actor has the feat with this code!
     */
    static _handleCreate(tokenData, actor, isSummon) {
        let hpUpdate;

        if (isSummon) {
            const newFormula = MightySummoner._calculateHPFormula(actor);
            const newHP = TokenUtility.rollHP(actor, newFormula);
            hpUpdate = TokenUtility._buildHPData(newHP); 
        }

        const createData = hpUpdate ? mergeObject(tokenData, hpUpdate) : tokenData;
        
        setProperty(createData, `flags.${NAME}.${FLAGS.mightySummoner.mightySummoner}`, true);
        
        return Token.create(createData);
        //return newData;
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