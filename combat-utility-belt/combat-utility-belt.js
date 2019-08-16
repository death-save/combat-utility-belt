Hooks.on("ready",  function() {
	//invoke the functions in turn
}); 


/**
 * required functions:
 * 1. settings helper
 * 2. reroll initiative
 * 3. hide npc names
 * 4. enhanced conditions
 */


/**
 * maybe include gadget as the param for this
 * the purpose of this function is to register, get and set settings for each gadget
 */
 function cubConfigSidekick (gadget) {

}

//reroll initiative
function cubRerollInitiative() {
    const FUNCTION_NAME = "reroll-initiative";
    console.log(FUNCTION_NAME + " starting.");

    let settings = {};

    const DEFAULT_CONFIG = true;

    const SETTINGS_NAME = "Reroll Initiative";

    const SETTINGS_HINT = "Reroll initiative for each combatant every round"

    const SETTINGS_META = {
        name: SETTINGS_NAME,
        hint: SETTINGS_HINT,
        scope: "world",
        type: Boolean,
        default: DEFAULT_CONFIG,
        config: true,
        onChange: s => {
            settings = s;
            console.log(FUNCTION_NAME+" settings changed to", s);
        }
    }

    try {
        settings = getModuleSettings();
    }
    catch (e) {
        if(e.message == "This is not a registered game setting") {
            registerModuleSettings();
            settings = getModuleSettings();
        }
        else {
            throw e;
        }

    }

    function getModuleSettings() {
        return game.settings.get(FUNCTION_NAME, SETTINGS_NAME);
    }
    
    function registerModuleSettings() {
        game.settings.register(FUNCTION_NAME, SETTINGS_NAME, SETTINGS_META);
    }    

    /**
     * Update module settings and save to the game
     * @param {String} setting 
     * @param {*} value 
     */
    async function updateSettings(setting, value) {
        settings[setting] = value;
        console.log("Updating " + FUNCTION_NAME + " settings:", settings);
        await game.settings.set(FUNCTION_NAME, SETTINGS_NAME, settings);
    }

    /**
     * Hook on update of Combat class. 
     * Reroll initiative if requirements met
     */
    Hooks.on("updateCombat",(async (combat, update) => {
        const SETTING = "reroll";
        
        /**
         *  firstly is the specified module setting turned on (eg. is rerolling enabled), 
         *  then test for the presence of the combat object's previous values and an update object,
         *  check that the round props are numbers,
         *  finally test if the update's round is greater than the previous combat round 
         */
         if(settings && (combat.previous && update) && !isNaN(combat.previous.round || update.round) && update.round > combat.previous.round){
            await combat.resetAll();
            combat.rollAll();
        }
	}));
}
//hide npc names

//enhanced conditions

//auto bloodied and dead