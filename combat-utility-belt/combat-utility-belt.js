var cubEnhancedConditions;


function cubGetModuleName () {
	return "combat-utility-belt";
}

Hooks.on("init", function() {
	const cubConfigSidekick = new CUBConfigSidekick();
	const cubHideNPCNames = new CUBHideNPCNames();
})

Hooks.on("ready",  function() {
	//invoke the functions in turn
	const cubRerollInitiative = new CUBRerollInitiative();
    const cubInjuredAndDead = new CUBInjuredAndDead();
    cubEnhancedConditions = new CUBEnhancedConditions();
    CUBEnhancedConditionsConfig._createSidebarButton();
}); 


/**
 * the purpose of this function is to register, get and set settings for each gadget
 */
class CUBConfigSidekick  {
    constructor(){
        this.MODULE_NAME = cubGetModuleName();

        //CUBConfigSidekick.initGadgetSettings = initGadgetSettings;
        //CUBConfigSidekick.getGadgetSettings = getGadgetSettings;
        //CUBConfigSidekick.registerGadgetSettings = registerGadgetSettings;
    }

	static registerGadgetSettings(gadget, settings) {
		game.settings.register(this.MODULE_NAME, gadget, settings);
	}

	static getGadgetSettings(gadget) {
		return game.settings.get(this.MODULE_NAME, gadget);
	}

	static initGadgetSettings(gadget, settings) {
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
        this.MODULE_NAME = cubGetModuleName();
    }

	get GADGET_NAME() {
        return "reroll-initiative";
    }


	DEFAULT_CONFIG = true;

    SETTINGS_NAME = "Reroll Initiative";

    SETTINGS_HINT = "Reroll initiative for each combatant every round"

    SETTINGS_META = {
        name: this.SETTINGS_NAME,
        hint: this.SETTINGS_HINT,
        scope: "world",
        type: Boolean,
        default: this.DEFAULT_CONFIG,
        config: true,
        onChange: s => {
            this.settings = s;
            console.log(this.GADGET_NAME+" settings changed to", s);
        }
    }
    
	//intialise settings
	settings = CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME, this.SETTINGS_META);

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
            if(this.settings && (combat.previous && update) && !isNaN(combat.previous.round || update.round) && update.round > combat.previous.round){
                await combat.resetAll();
                combat.rollAll();
            }
        }));
    }
}

//hide npc names
class CUBHideNPCNames {
    constructor(){
        this.MODULE_NAME = cubGetModuleName();
    }

    get GADGET_NAME() {
        return "hide-npc-names";
    }

    SETTINGS_NAME = "Hide NPC Names";

    SETTINGS_HINT = "Hides NPC names in the Combat Tracker."

    DEFAULT_CONFIG = false;

    SETTINGS_META = {
        name: this.SETTINGS_NAME,
        hint: this.SETTINGS_HINT,
        scope: "world",
        type: Boolean,
		default: this.DEFAULT_CONFIG,
		config: true,
        onChange: s => {
            console.log(this.GADGET_NAME+" settings changed. New settings:", s);
            this.settings = s;
            ui.combat.render();
        }
    }

	//intialise settings
	settings = CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME, this.SETTINGS_META);

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
        this.MODULE_NAME = cubGetModuleName();
    }

    get GADGET_NAME() {
        return "enhanced-conditions";
    }

    /**
     * --------------------
     * Set gadget variables
     * --------------------
     */
    DEFAULT_CONFIG = {
        iconPath: "/icons/",
        folderType: "journal",
        folderName: "conditions",
        system: "dnd5e",
        outputChat: true
    }

    SETTINGS = {
        EnhancedConditionsN: "Enhanced Conditions",
        EnhancedConditionsH: "Links conditions to status icons",
        SystemN: "Game System",
        SystemH: "Game System to use for condition mapping",
        OutputChatN: "Output to Chat",
        OutputChatH: "Output matched conditions to chat",
        ConditionsN: "Conditions",
        ConditionsH: "List of conditions for the game system",
        MapN: "Condition Map",
        MapH: "Map of conditions to icons"
    }

    SETTINGS_META = {
        enhancedConditions: {
            name: this.SETTINGS.EnhancedConditionsN,
            hint: this.SETTINGS.EnhancedConditionsH,
            scope: "world",
            type: Boolean,
            default: false,
            onChange: s => {
                this.settings.EnhancedConditions = s;
            }

        },

        system: {
            name: this.SETTINGS.SystemN,
            hint: this.SETTINGS.SystemH,
            scope: "world",
            type: String,
            default: this.DEFAULT_CONFIG.system,
            onChange: s => {
                this.settings.system = s;
            }
        },

        conditions: {
            name: this.SETTINGS.ConditionsN,
            hint: this.SETTINGS.ConditionsH,
            scope: "world",
            type: Object,
            default: this.DEFAULT_CONDITIONS_5E,
            onChange: s => {
                this.settings.conditions = s;
            }
        },

        map: {
            name: this.SETTINGS.MapN,
            hint: this.SETTINGS.MapH,
            scope: "world",
            type: Object,
            default: this.DEFAULT_CONDITION_MAP_5E,
            onChange: s => {
                this.settings.map = s;
            }
        },

        outputChat: {
            name: this.SETTINGS.OutputChatN,
            hint: this.SETTINGS.OutputChatH,
            scope: "world",
            type: Boolean,
            default: this.DEFAULT_CONFIG.outputChat,
            onChange: s => {
                this.settings.output = s;
            }
        }


    }

    /**
     * Retrieve the basic statusEffect icons from the Foundry CONFIG
     */
    baseStatusIcons = CONFIG.statusEffects;
    
    /**
     * Define the labels for the D&D 5e conditions
     */
    DEFAULT_CONDITIONS_5E = {
        "blinded5e":"Blinded",
        "charmed5e":"Charmed",
        "deafened5e":"Deafened",
        "exhaustion5e":"Exhaustion",
        "frightened5e":"Frightened",
        "incapacitated5e":"Incapacitated",
        "invisible5e":"Invisible",
        "paralyzed5e":"Paralyzed",
        "petrified5e":"Petrified",
        "poisoned5e":"Poisoned",
        "prone5e":"Prone",
        "restrained5e":"Restrained",
        "stunned5e":"Stunned",
        "unconscious5e":"Unconscious"
    }

    /**
     * Define a default mapping for the D&D 5e conditions
     */
    DEFAULT_CONDITION_MAP_5E = {
        "blinded5e":"icons/svg/eye.svg",
        "charmed5e":"",
        "deafened5e":"",
        "exhaustion5e":"",
        "frightened5e":"icons/svg/terror.svg",
        "incapacitated5e":"",
        "invisible5e":"",
        "paralyzed5e":"",
        "petrified5e":"icons/svg/frozen.svg",
        "poisoned5e":"",
        "prone5e":"",
        "restrained5e":"icons/svg/net.svg",
        "stunned5e":"",
        "unconscious5e":"icons/svg/sleep.svg"
    }

    settings = {
        system: CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME + "(" + this.SETTINGS.SystemN + ")", this.SETTINGS_META.system ),
        conditions: CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME + "(" + this.SETTINGS.ConditionsN + ")", this.SETTINGS_META.conditions),
        map: CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME + "(" + this.SETTINGS.MapN + ")", this.SETTINGS_META.map),
        output: CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME + "(" + this.SETTINGS.OutputChatN + ")", this.SETTINGS_META.outputChat)
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
    _hookOnUpdateToken(){
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
        super();
        this.MODULE_NAME = cubGetModuleName();
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
        //map = game.settings.get(cubGetModuleName(), CUBEnhancedConditions.GADGET_NAME + "(" + CUBEnhancedConditions.SETTINGS.MapN + ")");
        const map = CUBConfigSidekick.getGadgetSettings(CUBEnhancedConditions.GADGET_NAME + "(" + CUBEnhancedConditions.SETTINGS.MapN + ")");
        let data = {
            conditionmap: map
        }
    }

    static _createSidebarButton() {
        let button = $(`<button id="enhanced-conditions"><i class="fas fa-flask-poison"></i> Condition Mapper</button>`);
        button.click(ev => {
            new CUBEnhancedConditionsConfig().render(true);
        });
        $('#manage-modules').after(button);
    }


}

//auto bloodied and dead
class CUBInjuredAndDead {
    constructor(){
        this.MODULE_NAME = cubGetModuleName();
        this.GADGET_NAME = CUBEnhancedConditions.GADGET_NAME;
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
			name: this.SETTINGS.InjuredN,
			hint: this.SETTINGS.InjuredH,
			default: this.DEFAULT_CONFIG.Injured,
			scope: "world",
			type: Boolean,
			config: true,
			onChange: s => {
				this.injured = s;
			}

        },
        InjuredIcon: {
			name: this.SETTINGS.InjuredIconN,
			hint: this.SETTINGS.InjuredIconH,
			default: this.DEFAULT_CONFIG.InjuredIcon,
			scope: "world",
			type: String,
			config: true,
			onChange: s => {
				this.injuredIcon = s;
			}

		},
		Threshold: {
			name: this.SETTINGS.ThresholdN,
			hint: this.SETTINGS.ThresholdH,
			default: this.DEFAULT_CONFIG.Threshold,
			scope: "world",
			type: Number,
			config: true,
			onChange: s => {
				this.threshold = s;
			}
		},
		Dead: {
			name: this.SETTINGS.DeadN,
			hint: this.SETTINGS.DeadH,
			default: this.DEFAULT_CONFIG.Dead,
			scope: "world",
			type: Boolean,
			config: true,
			onChange: s => {
				this.dead = s;
			}
        },
        DeadIcon: {
			name: this.SETTINGS.DeadIconN,
			hint: this.SETTINGS.DeadIconH,
			default: this.DEFAULT_CONFIG.DeadIcon,
			scope: "world",
			type: String,
			config: true,
			onChange: s => {
				this.deadIcon = s;
			}

		}
	}

	injured = CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME + "(" + this.SETTINGS.InjuredN + ")", this.SETTINGS_META.Injured);
	threshold = CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME + "(" + this.SETTINGS.ThresholdN + ")", this.SETTINGS_META.Threshold);
    dead = CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME + "(" + this.SETTINGS.DeadN + ")", this.SETTINGS_META.Dead);
    injuredIcon = CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME + "(" + this.SETTINGS.InjuredIconN + ")", this.SETTINGS_META.InjuredIcon);
    deadIcon = CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME + "(" + this.SETTINGS.DeadIconN + ")", this.SETTINGS_META.DeadIcon);

    //hook on token update
    
	_hookOnTokenUpdate() {
        Hooks.on("updateToken", (token,sceneid,update) => {
            console.log(token,sceneid,update);
            const maxHP = token.actor.data.data.attributes.hp.max;
            const linked = token.data.actorLink;
            
            //if hp = 0 mark as dead
            if(!linked && this.dead && update.actorData && update.actorData.data.attributes.hp.value == 0){
                //set death overlay on token
                token.toggleOverlay(this.deadIcon);
                //if the token has effects, remove them
                if(token.data.effects.length > 0) {
                    for(let e of token.data.effects) {
                        token.toggleEffect(e);
                    }
                }
            //if injured tracking is enabled and the current hp is less than the maxHP * the decimal version of the threshold
            } else if(!linked && this.injured && update.actorData && update.actorData.data.attributes.hp.value < (maxHP*(this.threshold/100)) && !token.data.effects.find(e => e = this.injuredIcon)) {
                //set status effect on token
                token.toggleEffect(this.injuredIcon);
                //if the dead tracking is enabled and the token has an overlay, remove the dead overlay
                if(this.dead && token.data.overlayEffect && token.data.overlayEffect == this.deadIcon) {
                    token.toggleOverlay(this.deadIcon);
                }

            //if injured tracking is enabled and the current hp is greater than the maxHP * the decimal version of the threshold
            } else if(!linked && this.injured && update.actorData && update.actorData.data.attributes.hp.value > (maxHP*(threshold/100))) {
                //if the token has the injured icon, remove it
                if(this.injured && token.data.effects && token.data.effects.length > 0 && token.data.effects.find(e => e = this.injuredIcon)) {
                    token.toggleEffect(this.injuredIcon);
                }

                //if the token has the dead icon, remove it
                if(this.dead && token.data.overlayEffect && token.data.overlayEffect == this.deadIcon) {
                    token.toggleOverlay(this.deadIcon);
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
            if(this.dead && update["data.attributes.hp.value"] == 0){
                //set death overlay on token
                await token.toggleOverlay(this.deadIcon);
                //if the token has effects, remove them
                if(token.data.effects.length > 0) {
                    for(let e of token.data.effects) {
                        await token.toggleEffect(e);
                    }
                }
            //if injured tracking is enabled and the current hp is less than the maxHP * the decimal version of the threshold
            } else if(this.injured && update["data.attributes.hp.value"] <= (maxHP*(this.threshold/100)) && !token.data.effects.find(e => e = this.injuredIcon)) {
                //set status effect on token
                await token.toggleEffect(this.injuredIcon);
                //if the dead tracking is enabled and the token has an overlay, remove the dead overlay
                if(dead && token.data.overlayEffect && token.data.overlayEffect == deadIcon) {
                    await token.toggleOverlay(deadIcon);
                }

            //if injured tracking is enabled and the current hp is greater than the maxHP * the decimal version of the threshold
            } else if(this.injured && update["data.attributes.hp.value"] > (maxHP*(threshold/100))) {
                //if the token has the injured icon, remove it
                if(this.injured && token.data.effects && token.data.effects.length > 0 && token.data.effects.find(e => e = this.injuredIcon)) {
                    await token.toggleEffect(this.injuredIcon);
                }

                //if the token has the dead icon, remove it
                if(this.dead && token.data.overlayEffect && token.data.overlayEffect == this.deadIcon) {
                    await token.toggleOverlay(this.deadIcon);
                }
            }
        });
    }
	
}