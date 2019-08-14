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

const IncarnateApplicationRender = (function () {
    var cached_function = Application.prototype._render;
    return function(emptyApp){
        let resume = Hooks.call("preRender"+this.constructor.name,this);
        console.log("resume: ",resume);
        if (resume === false){
            return new Promise(resolve => null);
        }else{
            return cached_function.apply(this, arguments);
        }
    }
})();
Application.prototype._render = IncarnateApplicationRender;

