function cubGetModuleName () {
	return "combat-utility-belt";
}

Hooks.on("init", function() {
	cubConfigSidekick();
	cubHideNPCNames();
})

Hooks.on("ready",  function() {
	//invoke the functions in turn
	//cubConfigSidekick();
	cubRerollInitiative();
	//cubHideNPCNames();
	cubInjuredAndDead();
}); 


/**
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
			config = getGadgetSettings(gadget);
			console.log("config found:", config);
		}
		catch (e) {
			if(e.message == "This is not a registered game setting") {
				console.log("Setting not registered... trying to register");
				registerGadgetSettings(gadget, settings);
				config = getGadgetSettings(gadget);
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
	//intialise settings
	let settings = cubConfigSidekick.initGadgetSettings(GADGET_NAME, SETTINGS_META);
	console.log("rri settings:",settings);

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

    const SETTINGS_HINT = "Hides NPC names in the Combat Tracker."

    const DEFAULT_CONFIG = false;

    const SETTINGS_META = {
        name: SETTINGS_NAME,
        hint: SETTINGS_HINT,
        scope: "world",
        type: Boolean,
		default: DEFAULT_CONFIG,
		config: true,
        onChange: s => {
            console.log(GADGET_NAME+" settings changed. New settings:", s);
            settings = s;
            ui.combat.render();
        }
    }

	//intialise settings
	let settings = cubConfigSidekick.initGadgetSettings(GADGET_NAME, SETTINGS_META);
	console.log("hnn settings are:",settings);

	//hook on combat render
	//TODO: add hook for sidebar tab first render -- need to hook on init instead of ready!
    Hooks.on("renderCombatTracker", (app,html) => {
        // if not GM
        if(!game.user.isGM) {
            let combatantListElement = html.find('li');

            //for each combatant
            for(let e of combatantListElement) {
                let token = game.scenes.active.data.tokens.find(t => t.id == e.dataset.tokenId);
                
                let actor = game.actors.entities.find(a => a.id === token.actorId);

                //if not PC, module is enabled
                if(!actor.isPC && settings) {
                    //find the flexcol elements
                    let flexcol = e.getElementsByClassName("token-name");
                    //iterate through the returned elements
					for(let f of flexcol){
                        //find the h4 elements
                        let header = f.getElementsByTagName("H4");
                        //iterate through
						for(let h of header){
                            //blank out the name
							h.textContent = "";
						}
					}

                }
                
            }
            
        }
    });
}

//enhanced conditions

//auto bloodied and dead
function cubInjuredAndDead() {
	const GADGET_NAME = "injured-and-dead";

	const SETTINGS = {
		InjuredN: "Mark Injured Tokens",
        InjuredH: "Sets a status marker on tokens that meet the threshold below",
        InjuredIconN: "Injured Status Marker",
        InjuredIconH: "Path to the status marker to display for Injured Tokens",
		ThresholdN: "Injured Token Threshold",
		ThresholdH: "Enter the percentage of HP lost when a token should be considered injured",
		DeadN: "Mark Dead Tokens",
        DeadH: "Sets a status marker on tokens that reach 0 hp",
        DeadIconN: "Dead Status Marker",
        DeadIconH: "Path to the status marker to display for Dead Tokens"
        
	}

	const DEFAULT_CONFIG = {
        Injured: false,
        InjuredIcon: "icons/svg/blood.svg",
		Threshold: 50,
        Dead: false,
        DeadIcon: "icons/svg/skull.svg"
	}

	const SETTINGS_META = {
		Injured: {
			name: SETTINGS.InjuredN,
			hint: SETTINGS.InjuredH,
			default: DEFAULT_CONFIG.Injured,
			scope: "world",
			type: Boolean,
			config: true,
			onChange: s => {
				injured = s;
			}

        },
        InjuredIcon: {
			name: SETTINGS.InjuredIconN,
			hint: SETTINGS.InjuredIconH,
			default: DEFAULT_CONFIG.InjuredIcon,
			scope: "world",
			type: String,
			config: true,
			onChange: s => {
				injuredIcon = s;
			}

		},
		Threshold: {
			name: SETTINGS.ThresholdN,
			hint: SETTINGS.ThresholdH,
			default: DEFAULT_CONFIG.Threshold,
			scope: "world",
			type: Number,
			config: true,
			onChange: s => {
				threshold = s;
			}
		},
		Dead: {
			name: SETTINGS.DeadN,
			hint: SETTINGS.DeadH,
			default: DEFAULT_CONFIG.Dead,
			scope: "world",
			type: Boolean,
			config: true,
			onChange: s => {
				dead = s;
			}
        },
        DeadIcon: {
			name: SETTINGS.DeadIconN,
			hint: SETTINGS.DeadIconH,
			default: DEFAULT_CONFIG.DeadIcon,
			scope: "world",
			type: String,
			config: true,
			onChange: s => {
				deadIcon = s;
			}

		}
	}

	let injured = cubConfigSidekick.initGadgetSettings(GADGET_NAME + "(" + SETTINGS.InjuredN + ")", SETTINGS_META.Injured);
	let threshold = cubConfigSidekick.initGadgetSettings(GADGET_NAME + "(" + SETTINGS.ThresholdN + ")", SETTINGS_META.Threshold);
    let dead = cubConfigSidekick.initGadgetSettings(GADGET_NAME + "(" + SETTINGS.DeadN + ")", SETTINGS_META.Dead);
    let injuredIcon = cubConfigSidekick.initGadgetSettings(GADGET_NAME + "(" + SETTINGS.InjuredIconN + ")", SETTINGS_META.InjuredIcon);
    let deadIcon = cubConfigSidekick.initGadgetSettings(GADGET_NAME + "(" + SETTINGS.DeadIconN + ")", SETTINGS_META.DeadIcon);
    console.log(injured,threshold,dead,injuredIcon,deadIcon);

    //hook on token update
    
	Hooks.on("updateToken", (token,sceneid,update) => {
		console.log(token,sceneid,update);
        const maxHP = token.actor.data.data.attributes.hp.max;
        const linked = token.data.actorLink;
        
		//if hp = 0 mark as dead
		if(!linked && dead && update.actorData && update.actorData.data.attributes.hp.value == 0){
            //set death overlay on token
            token.toggleOverlay(deadIcon);
            //if the token has effects, remove them
            if(token.data.effects.length > 0) {
                for(let e of token.data.effects) {
                    token.toggleEffect(e);
                }
            }
        //if injured tracking is enabled and the current hp is less than the maxHP * the decimal version of the threshold
		} else if(!linked && injured && update.actorData && update.actorData.data.attributes.hp.value < (maxHP*(threshold/100)) && !token.data.effects.find(e => e = injuredIcon)) {
			//set status effect on token
            token.toggleEffect(injuredIcon);
            //if the dead tracking is enabled and the token has an overlay, remove the dead overlay
            if(dead && token.data.overlayEffect && token.data.overlayEffect == deadIcon) {
                token.toggleOverlay(deadIcon);
            }

        //if injured tracking is enabled and the current hp is greater than the maxHP * the decimal version of the threshold
		} else if(!linked && injured && update.actorData && update.actorData.data.attributes.hp.value > (maxHP*(threshold/100))) {
            //if the token has the injured icon, remove it
            if(injured && token.data.effects && token.data.effects.length > 0 && token.data.effects.find(e => e = injuredIcon)) {
                token.toggleEffect(injuredIcon);
            }

            //if the token has the dead icon, remove it
            if(dead && token.data.overlayEffect && token.data.overlayEffect == deadIcon) {
                token.toggleOverlay(deadIcon);
            }
        }
	
    });
    
    Hooks.on("updateActor", async (actor,update) => {
        console.log(actor, update);
        const maxHP = actor.data.data.attributes.hp.max;
        let token = canvas.tokens.placeables.find(t => t.actor.id == actor.id);

        console.log(token);

		//if hp = 0 mark as dead
		if(dead && update["data.attributes.hp.value"] == 0){
            //set death overlay on token
            await token.toggleOverlay(deadIcon);
            //if the token has effects, remove them
            if(token.data.effects.length > 0) {
                for(let e of token.data.effects) {
                    await token.toggleEffect(e);
                }
            }
        //if injured tracking is enabled and the current hp is less than the maxHP * the decimal version of the threshold
		} else if(injured && update["data.attributes.hp.value"] <= (maxHP*(threshold/100)) && !token.data.effects.find(e => e = injuredIcon)) {
			//set status effect on token
            await token.toggleEffect(injuredIcon);
            //if the dead tracking is enabled and the token has an overlay, remove the dead overlay
            if(dead && token.data.overlayEffect && token.data.overlayEffect == deadIcon) {
                await token.toggleOverlay(deadIcon);
            }

        //if injured tracking is enabled and the current hp is greater than the maxHP * the decimal version of the threshold
		} else if(injured && update["data.attributes.hp.value"] > (maxHP*(threshold/100))) {
            //if the token has the injured icon, remove it
            if(injured && token.data.effects && token.data.effects.length > 0 && token.data.effects.find(e => e = injuredIcon)) {
                await token.toggleEffect(injuredIcon);
            }

            //if the token has the dead icon, remove it
            if(dead && token.data.overlayEffect && token.data.overlayEffect == deadIcon) {
                await token.toggleOverlay(deadIcon);
            }
        }
    });
	
}