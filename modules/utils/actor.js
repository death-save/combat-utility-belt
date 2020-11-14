import { Sidekick } from "../sidekick.js";
import { SETTING_KEYS } from "../butler.js";

export class ActorUtility {
    
    /**
     * Looks for the existence of a named feat in the Actor's items
     * @param {*} actor 
     * @param {String} feat
     */
    static hasFeat(actor, feat) {
        return actor.items ? !!actor.items.find(i => i.type === "feat" && i.name === feat) : false;
    }
}