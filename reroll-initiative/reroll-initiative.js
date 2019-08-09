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
            actorTypes: "all"
        };
    }

    /**
     * Define the settings metadata for the module. Restricted to get only
     */
    static get SETTINGS(){
        return {
            module: "reroll-initiative",
            key: "rriSettings",
            name: "Reroll-Initiative Settings",
            hint: "Settings for Reroll-Initiative module",
            default: RerollInitiative.DEFAULT_CONFIG,
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
            type: Object,
            scope: RerollInitiative.SETTINGS.scope,
            onChange: options => {
                console.log("Module settings changed, new option values: ",options)
            }
        });
    }

    /**
     * Resets settings back to default
     * @todo: maybe expand this to deregister and register settings
     */
    _applydefaultConfig() {
        this.options = RerollIinitiative.DEFAULT_CONFIG;
        console.log("Resetting reroll-initiative settings to defaults:",RerollInitiative.DEFAULT_OPTIONS);
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
    async _loadSettings (){
        let config = await game.settings.get(RerollInitiative.SETTINGS.module,RerollInitiative.SETTINGS.key);
        this.config = config;
        console.log(this.config);
    }
    
    /**
     * Update a single setting
     * @param {String} setting The setting to change
     * @param {*} value The new value of the option
     */
    static async updateSetting(setting,value){
        let settings = await game.settings.get(RerollInitiative.SETTINGS.module,RerollInitiative.SETTINGS.key);

        if(settings.hasOwnProperty(setting)){
            console.log(setting);
            settings[setting] = value;
            await game.settings.set(RerollInitiative.SETTINGS.module,RerollInitiative.SETTINGS.key);
        }
        else{
            console.error("Module setting : "+setting+" does not exist!");
        }
    }

    /**
     * Retrieve settings from game
     * @returns {Object} settings
     */
    static async querySettings() {
        let settings = await game.settings.get(RerollInitiative.SETTINGS.module,RerollInitiative.SETTINGS.key);
        console.log("query found these settings:",settings);
        return settings;
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
                    this.resetAndReroll(combat);
                }
            }
            else {
                Console.log("Rerolling Initiative is currently turned off")
            }
            
        }); 
    }

    /**
     * @name resetAndReroll
     * @param {Object} combat A Combat instance
     * For the given combat instance, call the resetAll method and the rollAll method
     * @todo Not sure if this should be marked private...
     */
    async resetAndReroll(combat){
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
                        const targetSetting = "reroll";
                        //Retrieve the checkbox state
                        let rriCheckboxValue = rriCheckbox.prop("checked");
                        console.log("submit", ev);
                        console.log("rriCheckbox is: ",rriCheckbox.prop("checked"));

                        //Update target setting with new value
                        //todo: this needs to be async. break out into new method?
                        //this.rri.updateOption("reroll", rriCheckboxValue);
                        RerollInitiative.updateSetting(settings.reroll,rriCheckboxValue)
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