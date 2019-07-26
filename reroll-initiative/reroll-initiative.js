/**
 * @author Evan Clarke <errational>
 * @version 0.1
 * @description Rerolls initiative on combat round change
 */

/**
 * @author Evan Clarke <errational>
 * @description Hooks on combat update and rerolls initiative for all combatants
 * @todo Add configurability for when to reroll and for whom
 */
class RerollInitiative {
    constructor() {
        this.postUpdateCombatHook();
    }

    postUpdateCombatHook() {
        Hooks.on("updateCombat", (combat,update) =>  {
            if(update.round && update.round > combat._previous[0]){
                console.log("Reroll-Initiative: Round incremented - Rerolling Initiative")
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




