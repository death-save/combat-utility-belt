/**
 * @author Evan Clarke <errational>
 * @version 0.0.2
 * @description Rerolls initiative on combat round change
 */
var roundChanged = false;

class RerollInitiative {
    constructor() {
        this.postUpdateCombatHook();
    }

    postUpdateCombatHook() {
        Hooks.on("updateCombat", (update,combat) =>  {
            console.log("postupdate:\n",combat);
            console.log(roundChanged);
            if(!isBlank(update.round) && update.round > combat.round){
                this.resetAndReroll(combat);
            }
        }); 
    }

    async resetAndReroll(combat){
        await combat.resetAll();
        combat.rollAll();
    }
}

let rri = new RerollInitiative();




