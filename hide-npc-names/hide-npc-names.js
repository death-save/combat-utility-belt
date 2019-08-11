Hooks.on("ready", () => {
    hideNPCNames();
});

function hideNPCNames() {
    //hook on combat render
    Hooks.on("renderCombatTracker", (app,html) => {
        console.log(app,html);
        // if not GM
        if(!game.user.isGM) {
            //for each combatant
            for(let t of app.data.turns) {
                //if not PC
                if(!t.isPC) {
                    //name = ""
                    t.name = "";
                }
                
            }
            
        }
    });
    
    
    
    

    
}

