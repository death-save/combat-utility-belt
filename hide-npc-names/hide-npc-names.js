Hooks.on("ready", () => {
    Application.prototype._render = IncarnateApplicationRender;
    hideNPCNames();
});

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


function hideNPCNames() {
    const MODULE_NAME = "hide-NPC-names";

    const SETTINGS_NAME = "hnnSettings";

    const DEFAULT_CONFIG = {
        hide: true,
        disposition: [-1, 0, 1]
    }

    const SETTINGS_META = {
        name: SETTINGS_NAME,
        default: DEFAULT_CONFIG,
        scope: "world",
        onChange: s => {
            console.log(MODULE_NAME+" settings changed. New settings:", s);
            settings = s;
        }
    }

    let settings = {DEFAULT_CONFIG};

    game.settings.register(MODULE_NAME, SETTINGS_NAME, SETTINGS_META);

    //hook on combat render
    Hooks.on("preRenderCombatTracker", (app,html) => {
        console.log(app,html);
        // if not GM
        if(!game.user.isGM) {
            //for each combatant
            for(let t of app.getData().turns) {
                //if not PC, module is enabled, and token disposition matches settings
                if(!t.actor.isPC && settings.hide && settings.disposition.includes(t.token.disposition)) {
                    //name = ""
                    t.name = "";
                }
                
            }
            
        }
    });
}

