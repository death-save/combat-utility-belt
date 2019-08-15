/**
 * @name Hide-NPC-Names
 * @version 0.1
 * @author Evan Clarke <errational>
 * @description Hides NPC Names in the Combat Tracker
 */

Hooks.on("ready", () => {
    Application.prototype._render = IncarnateApplicationRender;
    hideNPCNames();
});

/**
 * IncarnateApplicationRender thanks to @ProNobis on Foundry Discord
 */
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
    const MODULE_NAME = "hide-npc-names";

    const SETTINGS_NAME = "hnnSettings";

    const DEFAULT_CONFIG = {
        hide: true,
        disposition: [-1, 0, 1]
    }

    const SETTINGS_META = {
        name: SETTINGS_NAME,
        scope: "world",
        type: Object,
        default: DEFAULT_CONFIG,
        onChange: s => {
            console.log(MODULE_NAME+" settings changed. New settings:", s);
            //settings = s;
        }
    }

    let settings = {};
    
    if(game.settings.get(MODULE_NAME, SETTINGS_NAME)){
        settings = game.settings.get(MODULE_NAME, SETTINGS_NAME);
    }
    else {
        game.settings.register(MODULE_NAME, SETTINGS_NAME, SETTINGS_META);
        settings = game.settings.get(MODULE_NAME, SETTINGS_NAME);
    }
    

    //initialise settings based on new game setting
    
    
    /**
     * Update module settings and save to the game
     * @param {String} setting 
     * @param {*} value 
     */
    async function updateSettings(setting, value) {
        settings[setting] = value;
        console.log("Updating "+ MODULE_NAME + " module settings:", settings);
        await game.settings.set(MODULE_NAME, SETTINGS_NAME, settings);
    }

    //hook on combat render
    Hooks.on("preRenderCombatTracker", (app,html) => {
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

    /**
     * Hook on render of Combat Tracker Config app. 
     * Inject checkbox formgroup, resize window and add new logic on submit
     */
    Hooks.on("renderCombatTrackerConfig", (app, html) => {
        const SETTING = "hide";
        const LABEL = "Hide NPCs";
        const NAME = "hideNPCsCheckbox"
        const HINT = "Hide NPCs in the Combat Tracker"

        //use the current value of the module setting to determine the checkbox state
        function checked() {
            if(settings[SETTING]) {
                return "checked"
            }
            else {
                return ""
            }
        }

        //find the submit button on the form then inject the new checkbox formgroup above it
        const submit = html.find('button[type="submit"]');

        if(submit) {
            submit.before(
                `<hr/>
                <div class="form-group">
                    <label>${LABEL}</label>
                    <input type="checkbox" name=${NAME} data-dtype="Boolean" ${checked()}>
                    <p class=hint>${HINT}</p>
                </div>`
            );
            
            //resize the window to fit the new elements
            app.setPosition({height: app.position.height + 80});
            
            //find the form then latch onto the submit event to update the module settings    
            const form = submit.parent();
    
            form.on("submit", (ev) => {
                const input = ev.target.elements[NAME];
    
                if(input) {
                    updateSettings(SETTING, input.checked);
                } 
            });
        }
        
        
    });
}

