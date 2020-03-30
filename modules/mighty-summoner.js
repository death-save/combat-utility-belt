import { Sidekick } from "./sidekick.js";
import { SETTING_KEYS } from "./butler.js";
import { TokenUtility } from "./utils/token.js";

export class MightySummoner {
    /**
     * Checks for the existence of the designated feat
     * @param {*} token 
     */
    static _checkForFeat(token) {
        const enable = Sidekick.getSetting(SETTING_KEYS.mightySummoner.enable);

        if (!game.user.isGM || !enable) {
            return;
        }

        // If the token actor doesn't have the feat, check the other actors owned by the token's owner
        if (token.actor && !MightySummoner.actorHasFeat(token.actor)) {
            
            const owners = Object.keys(token.actor.data.permission).filter(p => p !== "default" && token.actor.data.permission[p] === CONST.ENTITY_PERMISSIONS.OWNER);

            if (!owners) {
                return;
            }

            let actors = [];

            owners.forEach(owner => {
                const owned = game.actors.entities.filter(actor => hasProperty(actor, "data.permission." + owner));
                if (actors === undefined) {
                    actors = owned;
                } else {
                    actors.push(owned);
                }
            });

            if (actors.length === 0) {
                return;
            }

            const summoners = actors.find(actor => MightySummoner.actorHasFeat(actor));

            if (!summoners) {
                return;
            }

            MightySummoner._createDialog(token);
        }
    }

    /**
     * 
     */
    static _createDialog(token) {
        new Dialog({
            title: "Mighty Summoner",
            content: "<p>Is this monster being summoned?</p>",
            buttons: {
                yes: {
                    icon: `<i class="fas fa-check"></i>`,
                    label: "Yes",
                    callback: () => {
                        let actor = token.actor;
                        let formula = actor.data.data.attributes.hp.formula;
                        const match = formula.match(/\d+/)[0];
                        if (match !== undefined) {
                            formula += " + " + (match * 2);
                            actor.data.data.attributes.hp.formula = formula;
                            token.actorData = {
                                data: {
                                    attributes: {
                                        hp: {
                                            formula: formula,
                                        }
                                    }
                                }
                            };
                            const update = TokenUtility.rollTokenHp(token);
                            token.update(update);
                        }
                    }
                },
                no: {
                    icon: `<i class="fas fa-times"></i>`,
                    label: "No"
                }
            },
            default: "yes"
        }).render(true);
    }

    /**
     * Looks for the existence of a named feat in the Actor's items
     * @param {*} actor 
     */
    static actorHasFeat(actor) {
        const feat = "Mighty Summoner";
        return !!actor.items.find(i => i.type === "feat" && i.name.includes(feat));
    }
}