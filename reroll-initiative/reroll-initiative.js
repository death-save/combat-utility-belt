/**
 * @name Reroll-Initiative
 * @version 0.4
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
        /**
         * Initialize object to hold the config for this instance
         * @type {Object}
         */
        this.config = {};

        /**
         * Register settings with game
         */
        this._registerSettings();

        /**
         * Load settings into instance config variable
         */
        this._loadSettings();

        /**
         * Register postUpdate hook for Combat
         */
        this._postUpdateCombatHook();
    }

    /**
     * Define the default config for the module. Restricted to get only
     */
    static get DEFAULT_CONFIG() {
        return {
            reroll: true,
            actorTypes: "all" //future feature
        };
    }

    /**
     * Define the settings metadata for the module. Restricted to get only
     */
    static get SETTINGS() {
        return {
            module: "reroll-initiative",
            key: "rriSettings",
            name: "Reroll-Initiative Settings",
            hint: "Settings for Reroll-Initiative module",
            default: RerollInitiative.DEFAULT_CONFIG,
            type: Object,
            scope: "world"
        };
    }

    /**
     * Register module settings with game settings
     * @todo: Add any steps to occur when settings change
     */
    _registerSettings () {
        game.settings.register(RerollInitiative.SETTINGS.module, RerollInitiative.SETTINGS.key, {
            name: RerollInitiative.SETTINGS.name,
            hint: RerollInitiative.SETTINGS.hint,
            default: RerollInitiative.SETTINGS.default,
            type: RerollInitiative.SETTINGS.type,
            scope: RerollInitiative.SETTINGS.scope,
            onChange: settings => {
                
                console.log("Module settings changed, new option values: ",settings)
            }
        });
    }

    /**
     * Resets settings back to default
     * @todo: maybe expand this to deregister and register settings
     */
    _applydefaultConfig() {
        this.config = RerollIinitiative.DEFAULT_CONFIG;
        console.log("Resetting reroll-initiative settings to defaults:",RerollInitiative.DEFAULT_CONFIG);
        this._saveSettings();
    }

    /**
     * Saves current class instance options back to game settings
     */
    async _saveSettings () {
        await game.settings.set(RerollInitiative.SETTINGS.module,RerollInitiative.SETTINGS.key,this.config);
    }

    /**
     * Loads current class instance settings from game settings
     */
    async _loadSettings () {
        let config = await game.settings.get(RerollInitiative.SETTINGS.module,RerollInitiative.SETTINGS.key);
        this.config = config;
        console.log(this.config);
    }
    
    /**
     * Update a single module setting
     * @param {String} setting The setting to change
     * @param {*} value The new value of the option
     */
    static async updateSetting(setting,value){
        let settings = game.settings.get(RerollInitiative.SETTINGS.module,RerollInitiative.SETTINGS.key);

        if(settings.hasOwnProperty(setting)){
            console.log(setting);
            settings[setting] = value;
            await game.settings.set(RerollInitiative.SETTINGS.module,RerollInitiative.SETTINGS.key,settings);
        }
        else{
            console.error("Module setting : "+setting+" does not exist!");
        }
    }

    /**
     * Helper function to retrieve module settings from game instance
     * @returns {Object} settings An object containing the queried settings
     */
    static querySettings() {
        return game.settings.get(RerollInitiative.SETTINGS.module,RerollInitiative.SETTINGS.key)
    }

    /**
     * Hook on combat update and if round in update is greater than previous -- call resetAndReroll
     */
    _postUpdateCombatHook() {
        Hooks.on("updateCombat", (combat,update) =>  {
            //this is probably an unnecessary hit on the db
            //this._loadSettings();

            if(this.config.reroll){
                
                if(update.round && combat.previous && update.round > combat.previous.round){
                    //console.log("Reroll-Initiative: Round incremented - rerolling initiative")
                    this._resetAndReroll(combat);
                }
            }
            else {
                console.log("Rerolling Initiative is currently turned off")
            }
            
        }); 
    }

    /**
     * For the given combat instance, call the resetAll method and the rollAll method
     * @param {Object} combat A Combat instance
     */
    async _resetAndReroll(combat){
        await combat.resetAll();
        combat.rollAll();
    }
}

/**
 * @class RerollInitiativeConfig
 * @description Handles the configuration form for the module. Currently inserts within Combat Tracker Config
 * @todo: tear down all the setting updates here and use the RerollInitiative class instead
 */
class RerollInitiativeConfig {

    constructor(){
        this._hookRenderCombatTrackerConfig();
    }    

    /**
     * Hooks on the render of combat tracker config and insert the module config
     */
    _hookRenderCombatTrackerConfig(){
        Hooks.on("renderCombatTrackerConfig", (app, html) => {
            
            let settings = RerollInitiative.querySettings();
            console.log(settings);
            const targetSetting = "reroll";

            if(html){
                let rriCheckbox = this._injectCheckboxFormgroup(html);

                if(rriCheckbox){
                    //Set the state of the checkbox to match the current module reroll setting
                    rriCheckbox.prop("checked",settings.reroll);

                    // Adjust the window height to allow for new content
                    app.setPosition({height: app.position.height + 60});
                
                    // Handle form submission
                    //todo: break this out into a separate method?
                    const submit = html.find('button[type="submit"]');
                    const form = submit.parent();
                    form.on("submit", ev => {
                        
                        //Retrieve the checkbox state
                        let rriCheckboxValue = rriCheckbox.prop("checked");
                        console.log("submit", ev);
                        console.log("rriCheckbox is: ",rriCheckbox.prop("checked"));

                        //Update target setting with new value
                        //todo: this needs to be async. break out into new method?
                        //this.rri.updateOption("reroll", rriCheckboxValue);
                        RerollInitiative.updateSetting(targetSetting,rriCheckboxValue);
                    });
                }
            }
        });
    }

    /**
     * Injects a checkbox formgroup inside the designated element
     * @param {*} html
     * @returns {Object} checkbox The checkbox element that was injected
     */
    _injectCheckboxFormgroup(html){
        const elementIdentifier = 'button[type="submit"]';
        const label = "Reroll Initiative";
        const name = "rerollInitiative";
        const hint = "Reroll Initiative for all combatants each round"

        let element = html.find(elementIdentifier);
        
        if(element){
            element.before(
                `<hr/>
                <div class="form-group">
                    <label>${label}</label>
                    <input type="checkbox" name=${name} data-dtype="Boolean">
                    <p class=hint>${hint}</p>
                </div>`
            );
            console.log(html);
        }
        else {
            console.log("Failed to inject checkbox... " +elementIdentifier+ " does not exist.")
        }
        
        //Find and return the checkbox that was just created for use downstream
        if(html.find('input[name="'+name+'"]')){
            let checkbox = html.find('input[name="'+name+'"]');
            return checkbox;
        }
        else {
            console.log("Couldn't find reroll-initiative checkbox.");
            return;
        }      
    }
}

/**
 * Hook on game ready and instantiate the main module class
 */
Hooks.on("ready", ()=> {
    const MODULE_NAME = "reroll-initiative"

    //instantiate RerollInitiative under game global var
    game[MODULE_NAME] = {
        rri: new RerollInitiative(),
        rriConfig: new RerollInitiativeConfig()
    }
    console.log(game[MODULE_NAME]);
});