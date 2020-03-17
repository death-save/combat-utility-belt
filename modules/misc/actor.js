class CUBActorUtility {
    constructor() {
        this.actor = null;
    }

    _onRenderActorSheet(app, html, data) {
        this.actor = app.entity;
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

            this._onClickInitiative(event);
        });
    }

    async _onClickInitiative(event) {
        if ( !game.combat ) {
            if ( game.user.isGM ) {
                await Combat.create({scene: canvas.scene._id, active: true});
            } else {
                return ui.notification.warn("GM must create an encounter before you can roll initiative");
            }
        } 

        const tokens = this.actor.getActiveTokens();

        if (!tokens) {
            return;
        }

        const tokensToAdd = tokens.filter(t => t.inCombat === false);
        const createData = tokensToAdd.map(t => {return {tokenId: t.id, hidden: t.data.hidden}});

        const combatants = await game.combat.createManyEmbeddedEntities("Combatant", createData);

        if (!combatants) {
            return;
        }

        const combatantsToRoll = combatants.map(c => c._id);

        if (!combatantsToRoll) {
            return;
        }

        await game.combat.rollInitiative(combatantsToRoll);
        
    }
}