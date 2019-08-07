/**
 * @name Reroll-Initiative
 * @version 0.2
 * @author Evan Clarke <errational>
 * @description Rerolls initiative on combat round change
 */

 /**
  * --------------------
  * Set module constants
  * --------------------
  */
 const RRI_DEFAULT_SETTINGS = {
    reroll: true,
    actorTypes: "all"
}
  

/**
 * @class RerollInitiative
 * @description Hooks on combat update and rerolls initiative for all combatants
 * @todo Add configurability for when to reroll and for whom, make enable setting define whether the hook is registered or not
 */
class RerollInitiative {
    settings = {};

    constructor() {
        this._postUpdateCombatHook();
        //this.settings = {};
        this._registerSettings();
    }

    /**
     * module settings
     * @todo need to store settings as an object so they can easily be retrieved
     */
    _registerSettings () {
        game.settings.register("reroll-initiative", "rriSettings", {
            name: "Reroll-Initiative Settings",
            hint: "Settings for Reroll-Initiative module",
            default: RRI_DEFAULT_SETTINGS,
            type: Object,
            scope: "world",
            onChange: setting => {
                console.log("settings changed, new values: ",setting)
                //this.settings = JSON.stringify(setting);
            }
        });

        this._loadSettings();

        /* add settings as object instead
        game.settings.register('reroll-initiative', "rriStatus", {
            name: "Reroll-Initiative Status",
            hint: "Enable the rerolling initiative true/false",
            default: RRI_CONFIG.reroll,
            //default: "",
            type: Boolean,
            scope: "world",
            onChange: setting => {
              console.log("setting change",setting);
            }
        });

        game.settings.register('reroll-initiative', "actorTypesToReroll", {
            name: "Actor Types to Reroll",
            hint: "Specify the actor types to reroll PCs/NPCs/All",
            default: RRI_CONFIG.actorTypes,
            //default: "",
            type: String,
            scope: "world",
            onChange: setting => {
              console.log("setting change",setting);
            }
        });
        */
    }

    /**
     * Returns the default module settings
     */
    _defaultSettings() {
        this.settings = RRI_SETTINGS;
        console.log("Restting reroll-initiative settings to defaults:",RRI_DEFAULT_SETTINGS);
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
     */
    get settings() {
        this._loadSettings();
        return this.settings;
    }

    /**
     * Change the current class instance settings (for external use)
     * @param {Object} incomingSettings
     */
    set settings(incomingSettings) {
        this.settings = incomingSettings;
        this._saveSettings();
    }

    updateSettings(settingName,newValue){
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
     * @name postUpdateCombatHook
     * @description Hook on combat update and if round in update is greater than previous -- call resetAndReroll
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
        this._hookRenderCombatTrackerConfig();
        this.rri = {};
    }    

    _hookRenderCombatTrackerConfig(){
        Hooks.on("renderCombatTrackerConfig", (app, html) => {
            this.rri = game["reroll-initiative"].rri;
            console.log(this.rri);
            let settings = this.rri.settings;
            console.log(settings);
            let reroll = settings.reroll;
            console.log(reroll);

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
            let rriCheckbox = html.find('input[name="rerollInitiative"]');
            rriCheckbox.prop("checked",reroll);
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
                this.rri.updateSettings("reroll", rriCheckboxValue);
                
            });
        })
    }    
}

/**
 * Hook on game ready and instantiate the main module class
 */
Hooks.on("ready", ()=> {
    //instantiate under game global var
    game["reroll-initiative"] = {
        rri: new RerollInitiative()
    }
    game["reroll-initiative"]["rriConfig"] = new RerollInitiativeConfig();
    console.log(game["reroll-initiative"]);
});