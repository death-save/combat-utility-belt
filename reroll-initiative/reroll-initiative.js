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
const RRI_CONFIG = {
    reroll: true,
    actorTypes: "all"
}
  

/**
 * @class RerollInitiative
 * @description Hooks on combat update and rerolls initiative for all combatants
 * @todo Add configurability for when to reroll and for whom, make enable setting define whether the hook is registered or not
 */
class RerollInitiative {
    constructor() {
        this.postUpdateCombatHook();
        this.settings = {};
        this._registerSettings();
        let config = new RerollInitiativeConfig();
    }

    /**
     * module settings
     * @todo need to store settings as an object so they can easily be retrieved
     */
    _registerSettings () {
        game.settings.register("reroll-initiative", "rriSettings", {
            name: "Reroll-Initiative Settings",
            hint: "Settings for Reroll-Initiative module",
            default: RRI_CONFIG,
            type: Object,
            scope: "world",
            onChange: setting => {
                this.settings = JSON.stringify(setting);
            }
        })

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

    _defaultSettings() {
        let defaults = RRI_CONFIG;

        return defaults;
    }

    _saveSettings () {
        game.settings.set("reroll-initiative","rriSettings",JSON.stringify(this.settings));
    }

    _loadSettings (){
        this.settings = game.settings.get("reroll-initiative","rriSettings");
    }

    /**
     * @name postUpdateCombatHook
     * @description Hook on combat update and if round in update is greater than previous -- call resetAndReroll
     */
    postUpdateCombatHook() {
        Hooks.on("updateCombat", (combat,update) =>  {
            this._loadSettings();

            if(this.settings.reroll){
                
                if(update.round && combat._previous && update.round > combat.previous.round){
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
    }

    _hookRenderCombatTrackerConfig(){
        Hooks.on("renderCombatTrackerConfig", (app, html) => {
            let submit = html.find('button[type="submit"]');
            submit.before(
              `<div class="form-group">
                  <label>Test Checkbox</label>
                  <input type="checkbox" name="testCheckbox" data-dtype="Boolean" {{checked testCheckbox}}>
              </div>`
            );

            // Adjust the window height
            app.setPosition({height: app.position.height + 30});
        
            // Handle form submission
            const form = submit.parent();
            form.on("submit", ev => {
                console.log("submit", ev);
            });
        })
    }    
}

/**
 * Hook on game ready and instantiate the main module class
 */
Hooks.on("ready", ()=> {
    let rri = new RerollInitiative();
});





