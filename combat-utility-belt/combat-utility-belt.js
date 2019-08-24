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
class CUBConfigSidekick  {
    constructor(){
        this.MODULE_NAME = cubGetModuleName();

        CUBConfigSidekick.initGadgetSettings = initGadgetSettings;
        CUBConfigSidekick.getGadgetSettings = getGadgetSettings;
        CUBConfigSidekick.registerGadgetSettings = registerGadgetSettings;
    }

	registerGadgetSettings(gadget, settings) {
		game.settings.register(MODULE_NAME, gadget, settings);
	}

	getGadgetSettings(gadget) {
		return game.settings.get(MODULE_NAME, gadget);
	}

	initGadgetSettings(gadget, settings) {
		console.log("inc gadget name:",gadget);
		console.log("inc gadget metadata:",settings);
		let config;

		try {
			config = getGadgetSettings(gadget);
			console.log("config found:", config);
		}
		catch (e) {
			if(e.message == "This is not a registered game setting") {
				registerGadgetSettings(gadget, settings);
				config = getGadgetSettings(gadget);
			}
			else {
				throw e;
			}
		}
		finally {
			return config;
		} 
	}

	/**
     * (NB: probably deprecated now.) Update module settings and save to the game
     * @param {String} setting 
     * @param {*} value 
     */
    async setGadgetSettings(gadget, setting, value) {
        settings[setting] = value;
        console.log("Updating " + GADGET_NAME + " settings:", settings);
        await game.settings.set(GADGET_NAME, SETTINGS_NAME, settings);
	}


}

/**
 * Rerolls initiative for all combatants
 */
class CUBRerollInitiative {
    constructor(){

    }
	MODULE_NAME = cubGetModuleName();

	GADGET_NAME = "reroll-initiative";

	DEFAULT_CONFIG = true;

    SETTINGS_NAME = "Reroll Initiative";

    SETTINGS_HINT = "Reroll initiative for each combatant every round"

    SETTINGS_META = {
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
	settings = cubConfigSidekick.initGadgetSettings(GADGET_NAME, SETTINGS_META);

    /**
     * Hook on update of Combat class. 
     * Reroll initiative if requirements met
     */
    _hookUpdateCombat() {
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
}

//hide npc names
class CUBHideNPCNames {
    constructor(){

    }

    GADGET_NAME = "hide-npc-names";

    SETTINGS_NAME = "Hide NPC Names";

    SETTINGS_HINT = "Hides NPC names in the Combat Tracker."

    DEFAULT_CONFIG = false;

    SETTINGS_META = {
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
	settings = cubConfigSidekick.initGadgetSettings(GADGET_NAME, SETTINGS_META);

	//hook on combat render
    //TODO: add hook for sidebar tab first render -- need to hook on init instead of ready!
    _hookOnRenderCombatTracker() {
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
}

//enhanced conditions
class CUBEnhancedConditions {
    constructor(){

    }


    /**
     * --------------------
     * Set module variables
     * --------------------
     */
    CONFIG = {
        iconPath: "/icons/",
        folderType: "journal",
        folderName: "conditions",
        outputChat: true
    }



    /**
     * @description Mapping of status icons to condition
     * @todo allow user definable mapping via config gui
     */
    conditionMapping = {
        "icons/svg/skull.svg":"",
        "icons/svg/bones.svg":"",
        "icons/svg/sleep.svg":"unconscious",
        "icons/svg/stoned.svg":"",

        "icons/svg/eye.svg":"blinded",
        "icons/svg/net.svg":"restrained",
        "icons/svg/target.svg":"",
        "icons/svg/trap.svg":"",

        "icons/svg/blood.svg":"",
        "icons/svg/regen.svg":"",
        "icons/svg/degen.svg":"",
        "icons/svg/heal.svg":"",

        "icons/svg/radiation.svg":"",
        "icons/svg/biohazard.svg":"",
        "icons/svg/poison.svg":"poisoned",
        "icons/svg/hazard.svg":"",

        "icons/svg/pill.svg":"",
        "icons/svg/terror.svg":'frightened',
        "icons/svg/sun.svg":"",
        "icons/svg/angel.svg":"",

        "icons/svg/fire.svg":"",
        "icons/svg/frozen.svg":"petrified",
        "icons/svg/lightning.svg":"",
        "icons/svg/acid.svg":"",
        
        "icons/svg/fire-shield.svg":"",
        "icons/svg/ice-shield.svg":"",
        "icons/svg/mage-shield.svg":"",
        "icons/svg/holy-shield.svg":""
    }





    /**
     * @name currentToken
     * @type Object {Token}
     * @description holds the token for use elsewhere in the class
     */
    currentToken = {};

    /**
    * @name postTokenUpdateHook
    * @description hooks on token updates. If the update includes effects, calls the lookups
    */
    postTokenUpdateHook(){
        Hooks.on("updateToken", (token,sceneId,update) => {
            console.log(token,sceneId,update);
            let effects = update.effects;
            
            //If the update has effects in it, lookup mapping and set the current token
            if(effects){
                this.currentToken = token;
                return this.lookupConditionMapping(effects);
            }
            return;
        });
    }
     


    /**
    * @name lookupConditionMapping
    * @description check icon <-> condition mapping and call condition journal entry lookup against matches
    * @todo 
    * @parameter {Object} effects
    */
    async lookupConditionMapping(effects){
        let conditions = [];
        //console.log(conditionMapping);

        //iterate through incoming icons and check the conditionMap for the corresponding entry
        for (let e of effects){
            //console.log(icon);
            if(conditionMapping.hasOwnProperty(e)){
                //using bracket notation due to special characters in object properties
                let condition = conditionMapping[e];
                //console.log(condition);
                conditions.push(condition);
            }
             
        }
        console.log(conditions);
        return this.lookupConditionEntries(conditions);
    }

    /**
     * @name lookupConditionEntries
     * @description lookup condition journal/compendium entry and call chat output if option set
     * @todo rebuild to allow switching between journal/compendium lookup
     */
    async lookupConditionEntries(conditions){
        let conditionEntries = [];

        for (var condition of conditions){
            if(condition){
                let re = new RegExp(condition,'i');
                let ce = await game.journal.entities.find(j => j.name.match(re));
                console.log(ce);
                conditionEntries.push(ce);
            }
        }

        console.log(conditionEntries);
        if(EC_CONFIG_outputChat){
            return this.outputChatMessage(conditionEntries);
        }
        return;        
    }

    /**
     * @todo if flag is set: output condition text to chat -- i think this has to be async
     */
    async outputChatMessage (entries){
        let chatUser = game.userId;
        let token = this.currentToken;
        let actor = await this.lookupTokenActor(token.actor.id);
        let tokenSpeaker = {};
        let chatContent = [];

        console.log("current token",token);
        console.log("current actor",actor);
        //console.log("token id",this.tokenData.id);
        
        if(actor){
            console.log("Speaker is an actor:",actor);
            tokenSpeaker = ChatMessage.getSpeaker({"actor":actor});
        }
        else {
            console.log("Speaker is a token:",token);
            tokenSpeaker = ChatMessage.getSpeaker({"token":token});
        }
        
        //iterate through the journal entries and output to chat
        for (let e of entries){
            //let journalLink = "@JournalEntry["+e.name+"]";
            let journalLink = e.name;
            //need to figure out best way to break out entries -- newline is being turned into space
            chatContent.push("\n"+journalLink);

               
        }
        await ChatMessage.create({
            speaker:tokenSpeaker,
            content:chatContent,
            user:chatUser});
        }

    /**
     * @name lookupTokenActor
     * @description looks up the corresponding actor entity for the token
     * @param {String} id 
     * @returns {Actor} actor
     */
    async lookupTokenActor(id){
        let actor = {};
        if(id){
            actor = await game.actors.entities.find(a => a.id === id);
            
        }
        console.log("found actor: ",actor)
        return actor;
    }
    
}

//enhanced conditions config
class CUBEnhancedConditionsConfig extends FormApplication {
    constructor(){

    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "cub-condition",
            title: "C-U-B Condition Mapper",
            template: "public/modules/combat-utility-belt/templates/cub-conditions.html",
            classes: ["sheet"],
            width: 300
        });
    }

    getData() {
        let data = {

        }
    }


}

//auto bloodied and dead
class CUBInjuredAndDead {
    constructor(){

    }
	static get GADGET_NAME() {
        return "injured-and-dead";
    } 

	SETTINGS = {
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

	DEFAULT_CONFIG = {
        Injured: false,
        InjuredIcon: "icons/svg/blood.svg",
		Threshold: 50,
        Dead: false,
        DeadIcon: "icons/svg/skull.svg"
	}

	SETTINGS_META = {
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

	injured = cubConfigSidekick.initGadgetSettings(GADGET_NAME + "(" + SETTINGS.InjuredN + ")", SETTINGS_META.Injured);
	threshold = cubConfigSidekick.initGadgetSettings(GADGET_NAME + "(" + SETTINGS.ThresholdN + ")", SETTINGS_META.Threshold);
    dead = cubConfigSidekick.initGadgetSettings(GADGET_NAME + "(" + SETTINGS.DeadN + ")", SETTINGS_META.Dead);
    injuredIcon = cubConfigSidekick.initGadgetSettings(GADGET_NAME + "(" + SETTINGS.InjuredIconN + ")", SETTINGS_META.InjuredIcon);
    deadIcon = cubConfigSidekick.initGadgetSettings(GADGET_NAME + "(" + SETTINGS.DeadIconN + ")", SETTINGS_META.DeadIcon);

    //hook on token update
    
	_hookOnTokenUpdate() {
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
    }
    
    _hookOnUpdateActor() {
        _
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
	
}