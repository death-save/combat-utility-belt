function cubGetModuleName () {
	return "combat-utility-belt";
}

Hooks.on("ready",  function() {
	//invoke the functions in turn
	cubConfigSidekick();
	cubRerollInitiative();
	cubHideNPCNames();
}); 


/**
 * required functions:
 * 1. settings helpercub
 * 2. reroll initiative
 * 3. hide npc names
 * 4. enhanced conditions
 */


/**
 * maybe include gadget as the param for this
 * the purpose of this function is to register, get and set settings for each gadget
 */
//
function cubConfigSidekick () {
	console.log("cubConfigSidekick initializing")
	const MODULE_NAME = cubGetModuleName();
	console.log("Module name is:",MODULE_NAME);

	function registerGadgetSettings(gadget, settings) {
		game.settings.register(MODULE_NAME, gadget, settings);
	}

	function getGadgetSettings(gadget) {
		return game.settings.get(MODULE_NAME, gadget);
	}

	function initGadgetSettings(gadget, settings) {
		console.log("inc gadget name:",gadget);
		console.log("inc gadget metadata:",settings);
		let config;

		try {
			config = getGadgetSettings(MODULE_NAME, gadget);
			console.log("config found:", config);
		}
		catch (e) {
			if(e.message == "This is not a registered game setting") {
				console.log("Setting not registered... trying to register");
				registerGadgetSettings(gadget, settings);
				config = getGadgetSettings(MODULE_NAME, gadget);
				console.log("config after reg: ",config);
			}
			else {
				throw e;
			}
	
		}
		finally {
			console.log(config);
			return config;
			
		} 
	}

	/**
     * (NB: probably deprecated now.) Update module settings and save to the game
     * @param {String} setting 
     * @param {*} value 
     */
    async function setGadgetSettings(gadget, setting, value) {
        settings[setting] = value;
        console.log("Updating " + GADGET_NAME + " settings:", settings);
        await game.settings.set(GADGET_NAME, SETTINGS_NAME, settings);
	}
	
	cubConfigSidekick.initGadgetSettings = initGadgetSettings;
	cubConfigSidekick.getGadgetSettings = getGadgetSettings;
	cubConfigSidekick.registerGadgetSettings = registerGadgetSettings;

}

/**
 * Rerolls initiative for all combatants
 */
function cubRerollInitiative() {
	console.log("cubRerollInitiative initialising");
	const MODULE_NAME = cubGetModuleName();
	console.log("Module name is: ",MODULE_NAME);

	const GADGET_NAME = "reroll-initiative";

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
            console.log(GADGET_NAME+" settings changed to", s);
        }
	}
	console.log(cubConfigSidekick);
	//intialise settings
	let settings = cubConfigSidekick.initGadgetSettings(GADGET_NAME, SETTINGS_META);
	console.log(settings);

    /**
     * Hook on update of Combat class. 
     * Reroll initiative if requirements met
     */
    Hooks.on("updateCombat",(async (combat, update) => {
        
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
function cubHideNPCNames() {
	console.log("cubHideNPCNames initialising");
	const MODULE_NAME = cubGetModuleName();
	console.log("Module name is: ",MODULE_NAME);

    const GADGET_NAME = "hide-npc-names";

    const SETTINGS_NAME = "Hide NPC Names";

    const DEFAULT_CONFIG = false;

    const SETTINGS_META = {
        name: SETTINGS_NAME,
        scope: "world",
        type: Boolean,
		default: DEFAULT_CONFIG,
		config: true,
        onChange: s => {
            console.log(GADGET_NAME+" settings changed. New settings:", s);
            settings = s;
        }
    }


	//intialise settings
	let settings = cubConfigSidekick.initGadgetSettings(GADGET_NAME, SETTINGS_META);
	console.log(settings);

    //hook on combat render
    Hooks.on("renderCombatTracker", (app,html) => {
        // if not GM
        if(!game.user.isGM) {
            //for each combatant
            for(let t of app.getData().turns) {
                //if not PC, module is enabled, and token disposition matches settings
                if(!t.actor.isPC && settings) {
                    //name = ""
                    t.name = "";
                }
                
            }
            
        }
	});
}

//enhanced conditions

//auto bloodied and dead