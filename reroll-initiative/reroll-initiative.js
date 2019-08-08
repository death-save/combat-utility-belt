/**
 * @name Reroll-Initiative
 * @version 0.2
 * @author Evan Clarke <errational>
 * @description Rerolls initiative on combat round change
 */

/**
 * @class RerollInitiative
 * @description Hooks on combat update and rerolls initiative for all combatants depending on current value of setting
 * @todo Add configurability for whom to reroll, make enable setting define whether the hook is registered or not??
 */
class RerollInitiative {

    constructor() {
        this.settings = {};
        this._registerSettings();
        this._loadSettings();
        this._postUpdateCombatHook();
    }

    static get defaultSettings() {
        return {
            reroll: true,
            actorTypes: "all"
        };
    }

    /**
     * Register module settings with game settings
     * @todo need to store settings as an object so they can easily be retrieved
     */
    _registerSettings () {
        game.settings.register("reroll-initiative", "rriSettings", {
            name: "Reroll-Initiative Settings",
            hint: "Settings for Reroll-Initiative module",
            default: RerollInitiative.defaultSettings,
            type: Object,
            scope: "world",
            onChange: setting => {
                //todo: Add any steps to occur when settings change
                console.log("settings changed, new values: ",setting)
            }
        });
    }

    /**
     * Resets settings back to default
     */
    _applyDefaultSettings() {
        this.settings = RerollIinitiative.defaultSettings;
        console.log("Resetting reroll-initiative settings to defaults:",RerollInitiative.defaultSettings);
        this._saveSettings();
    }

    /**
     * Saves current class instance settings back to game settings
     */
    _saveSettings () {
        game.settings.set("reroll-initiative","rriSettings",this.settings);
    }

    /**
     * Loads current class instance settings from game settings
     */
    _loadSettings (){
        let settings = game.settings.get("reroll-initiative","rriSettings");
        this.settings = settings;
        console.log(this.settings);
    }
    
    /**
     * Get the current class instance settings (for external use)
     *
    get settings() {
        return this.settings;
    }
    */

    /**
     * Change the current class instance settings (for external use)
     * @param {Object} incomingSettings
     *
    set settings(incomingSettings) {
        this.settings = incomingSettings;
    }
    */

    /**
     * Update a single setting
     * @param {String} settingName The setting to change
     * @param {Any} newValue The new value of the setting
     */
    updateSetting(settingName,newValue){
        if(this.settings.hasOwnProperty(settingName)){
            console.log(settingName);
            this.settings[settingName] = newValue;
            this._saveSettings();
        }
        else{
            console.exception("Setting "+settingName+" does not exist!");
        }
    }

    /**
     * Hook on combat update and if round in update is greater than previous -- call resetAndReroll
     */
    _postUpdateCombatHook() {
        Hooks.on("updateCombat", (combat,update) =>  {
            this._loadSettings();

            if(this.settings.reroll){
                
                if(update.round && combat.previous && update.round > combat.previous.round){
                    //console.log("Reroll-Initiative: Round incremented - rerolling initiative")
                    this.resetAndReroll(combat);
                }
            }
            
        }); 
    }

    /**
     * @name resetAndReroll
     * @param {Combat} combat
     * @description For the given combat instance, call the resetAll method and the rollAll method
     * @todo Not sure if this should be marked private...
     */
    async resetAndReroll(combat){
        await combat.resetAll();
        combat.rollAll();
    }
}

/**
 * @class RerollInitiativeConfig
 * @description Handles the configuration of the module
 * @
 */
class RerollInitiativeConfig {

    constructor(){
        this.rri = {};
        this._hookRenderCombatTrackerConfig();
    }    

    _hookRenderCombatTrackerConfig(){
        Hooks.on("renderCombatTrackerConfig", (app, html) => {
            //Grab the values from the current instance of RerollInitiative 
            this.rri = game["reroll-initiative"].rri;
            console.log(this.rri);
            let settings = this.rri.settings;
            console.log(settings);

            let submit = html.find('button[type="submit"]');
            submit.before(
              `<hr/>
              <div class="form-group">
                  <label>Reroll Initiative</label>
                  <input type="checkbox" name="rerollInitiative" data-dtype="Boolean">
                  <p class=hint>Reroll Initiative for all combatants each round</p>
              </div>`
            );
            console.log(html);
            //Find the checkbox that was just created
            let rriCheckbox = html.find('input[name="rerollInitiative"]');
            
            //Set the state of the checkbox to match the current value of the "reroll" setting
            rriCheckbox.prop("checked",settings.reroll);
            console.log(rriCheckbox);

            // Adjust the window height
            app.setPosition({height: app.position.height + 60});
        
            // Handle form submission
            const form = submit.parent();
            form.on("submit", ev => {
                let rriCheckboxValue = rriCheckbox.prop("checked");
                console.log("submit", ev);
                console.log("rriCheckbox is: ",rriCheckbox.prop("checked"));
                //grab the value of the rriCheckbox and send a call to the RerollInitiaitive class to update settings accordingly;
                this.rri.updateSetting("reroll", rriCheckboxValue);
                
            });
        })
    }    
}

/**
 * Hook on game ready and instantiate the main module class
 */
Hooks.on("ready", ()=> {
    //instantiate RerollInitiative under game global var
    game["reroll-initiative"] = {
        rri: new RerollInitiative(),
        rriConfig: new RerollInitiativeConfig()
    }
    console.log(game["reroll-initiative"]);
});