export class ActorUtility {
    
    /**
     * Looks for the existence of a named feat in the Actor's items
     * @param {*} actor 
     * @param {String} feat
     */
    static hasFeat(actor, feat) {
        return actor.items ? !!actor.items.find(i => i.type === "feat" && i.name === feat) : false;
    }

    /**
     * 
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    static _onRenderActorSheet(app, html, data) {
        const actor = app.entity;
        const initiative = html.find(".initiative");

        if (initiative.length === 0) {
            return;
        }

        const heading = initiative.find("h4").first();

        if (heading.length === 0) {
            return;
        }

        heading.addClass("rollable");

        heading.on("click", event => {

            this._onClickInitiative(actor, event);
        });
    }
    
    /**
     * 
     * @param {*} actor 
     * @param {*} event 
     */
    static async _onClickInitiative(actor, event) {
        if ( !game.combat ) {
            if ( game.user.isGM ) {
                await Combat.create({scene: canvas.scene._id, active: true});
            } else {
                return ui.notification.warn("GM must create an encounter before you can roll initiative");
            }
        } 

        const tokens = actor.getActiveTokens();

        if (!tokens) {
            return;
        }

        const combatants = tokens.filter(t => t.inCombat).map(t => {
            return game.combat.combatants.find(c => c.tokenId === t.id);
        });

        const createData = tokens.filter(t => !t.inCombat).map(t => {
            return {
                tokenId: t.id,
                hidden: t.data.hidden
            };
        });

        const newCombatants = await game.combat.createManyEmbeddedEntities("Combatant", createData);

        if (newCombatants.length) {
            combatants.concat(newCombatants);
        }

        if (newCombatants instanceof Object) {
            combatants.push(newCombatants);
        }

        if (!combatants.length) {
            return;
        }

        const combatantsToRoll = combatants.map(c => c._id);

        if (!combatantsToRoll) {
            return;
        }

        await game.combat.rollInitiative(combatantsToRoll);
        
    }
}