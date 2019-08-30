function cubGetModuleName () {
	return "combat-utility-belt";
}

Hooks.on("init", function() {
	const cubConfigSidekick = new CUBConfigSidekick();
    const cubHideNPCNames = new CUBHideNPCNames();
    const cubEnhancedConditions = new CUBEnhancedConditions();
})

Hooks.on("ready",  function() {
	//invoke the functions in turn
	const cubRerollInitiative = new CUBRerollInitiative();
    const cubInjuredAndDead = new CUBInjuredAndDead();
    
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
		game.settings.register(cubGetModuleName(), gadget, settings);
	}

	static getGadgetSettings(gadget) {
		return game.settings.get(cubGetModuleName(), gadget);
	}

	static initGadgetSettings(gadget, settings) {
		console.log("inc gadget name:",gadget);
		console.log("inc gadget metadata:",settings);
		let config;

		try {
			config = this.getGadgetSettings(gadget);
			console.log("config found:", config);
		}
		catch (e) {
			if(e.message == "This is not a registered game setting") {
				this.registerGadgetSettings(gadget, settings);
				config = this.getGadgetSettings(gadget);
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

        //intialise settings
	    this.settings = CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME, this.SETTINGS_META);
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
        //intialise settings
	    this.settings = CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME, this.SETTINGS_META);
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

        this.settings = {
            system: CUBConfigSidekick.initGadgetSettings(this.constructor.GADGET_NAME + "(" + this.constructor.SETTINGS_DESCRIPTORS.SystemN + ")", this.constructor.SETTINGS_META.system ),
            folderType: CUBConfigSidekick.initGadgetSettings(this.constructor.GADGET_NAME + "(" + this.constructor.SETTINGS_DESCRIPTORS.FolderTypeN + ")", this.constructor.SETTINGS_META.folderType),
            conditions: CUBConfigSidekick.initGadgetSettings(this.constructor.GADGET_NAME + "(" + this.constructor.SETTINGS_DESCRIPTORS.ConditionsN + ")", this.constructor.SETTINGS_META.enhancedConditions),
            map: CUBConfigSidekick.initGadgetSettings(this.constructor.GADGET_NAME + "(" + this.constructor.SETTINGS_DESCRIPTORS.MapN + ")", this.constructor.SETTINGS_META.map),
            output: CUBConfigSidekick.initGadgetSettings(this.constructor.GADGET_NAME + "(" + this.constructor.SETTINGS_DESCRIPTORS.OutputChatN + ")", this.constructor.SETTINGS_META.outputChat)
        }

        this.constructor._createSidebarButton();
    }

    /**
     * --------------------
     * Set gadget constants
     * --------------------
     */
    static get GADGET_NAME() {
        return "enhanced-conditions";
    }

    
    static get DEFAULT_CONFIG() {
        return{
            iconPath: "modules/combat-utility-belt/icons/",
            folderTypes: {
                journal: "Journal",
                compendium: "Compendium"
            },
            folderName: "conditions",
            systems: {
                dnd5e: "D&D 5e",
                pf1e: "Pathfinder 1e",
                pf2e: "Pathfinder 2e",
                wfrp: "Warhammer Fantasy Roleplaying Game",
                custom: "Custom"
            },
            outputChat: true,

            /**
             * Define mapping for dnd5e
             * @todo: expand out to allow external jsons?
             */
            maps:{
                dnd5e: {
                    "Blinded":this.DEFAULT_CONFIG.iconPath+"blinded.svg",
                    "Charmed":this.DEFAULT_CONFIG.iconPath+"charmed.svg",
                    "Deafened":this.DEFAULT_CONFIG.iconPath+"deafened.svg",
                    "Exhaustion":this.DEFAULT_CONFIG.iconPath+"exhaustion1.svg",
                    "Frightened":this.DEFAULT_CONFIG.iconPath+"frightened.svg",
                    "Incapacitated":this.DEFAULT_CONFIG.iconPath+"incapacitated.svg",
                    "Invisible":this.DEFAULT_CONFIG.iconPath+"invisible.svg",
                    "Paralyzed":this.DEFAULT_CONFIG.iconPath+"paralyzed.svg",
                    "Petrified":this.DEFAULT_CONFIG.iconPath+"petrified.svg",
                    "Poisoned":this.DEFAULT_CONFIG.iconPath+"poisoned.svg",
                    "Prone":this.DEFAULT_CONFIG.iconPath+"prone.svg",
                    "Restrained":this.DEFAULT_CONFIG.iconPath+"restrained.svg",
                    "Stunned":this.DEFAULT_CONFIG.iconPath+"stunned.svg",
                    "Unconscious":this.DEFAULT_CONFIG.iconPath+"sleep.svg"
                /* this is too complicated... let's just map names to icons.
                //keeping for posterity
                conditions: {
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
                },
                
                icons: {
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
                */
                }
            }
            
        }
        
    }

    static get SETTINGS_DESCRIPTORS() {
        return {
            EnhancedConditionsN: "Enhanced Conditions",
            EnhancedConditionsH: "Links conditions to status icons",
            FolderTypeN: "Folder Type",
            FolderTypeH: "Folder type to use when looking for Condition entries",
            SystemN: "Game System",
            SystemH: "Game System to use for condition mapping",
            OutputChatN: "Output to Chat",
            OutputChatH: "Output matched conditions to chat",
            ConditionsN: "Conditions",
            ConditionsH: "List of conditions for the game system",
            MapN: "Condition Map",
            MapH: "Map of conditions to icons"
        }
    }

    static get SETTINGS_META() {
        return {
            enhancedConditions: {
                name: this.SETTINGS_DESCRIPTORS.EnhancedConditionsN,
                hint: this.SETTINGS_DESCRIPTORS.EnhancedConditionsH,
                scope: "world",
                type: Boolean,
                default: false,
                config: true,
                onChange: s => {
                    this.settings.enhancedConditions = s;
                }
    
            },
    
            system: {
                name: this.SETTINGS_DESCRIPTORS.SystemN,
                hint: this.SETTINGS_DESCRIPTORS.SystemH,
                scope: "world",
                type: String,
                default: this.DEFAULT_CONFIG.systems.dnd5e,
                choices: this.DEFAULT_CONFIG.systems,
                config: true,
                onChange: s => {
                    this.settings.system = s;
                }
            },

            folderType: {
                name: this.SETTINGS_DESCRIPTORS.FolderTypeN,
                hint: this.SETTINGS_DESCRIPTORS.FolderTypeH,
                scope: "world",
                type: String,
                default: this.DEFAULT_CONFIG.folderTypes.journal,
                choices: this.DEFAULT_CONFIG.folderTypes,
                config: true,
                onChange: s => {
                    this.settings.folderType = s;
                }

            },
    
            map: {
                name: this.SETTINGS_DESCRIPTORS.MapN,
                hint: this.SETTINGS_DESCRIPTORS.MapH,
                scope: "world",
                type: Object,
                default: this.DEFAULT_CONFIG.maps.dnd5e,
                onChange: s => {
                    this.settings.map = s;
                }
            },
    
            outputChat: {
                name: this.SETTINGS_DESCRIPTORS.OutputChatN,
                hint: this.SETTINGS_DESCRIPTORS.OutputChatH,
                scope: "world",
                type: Boolean,
                config: true,
                default: this.DEFAULT_CONFIG.outputChat,
                onChange: s => {
                    this.settings.output = s;
                }
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
    

    
    
    static _createSidebarButton() {
        Hooks.on("renderSettings", (app, html) => {
            const mapButton = $(
                `<button id="enhanced-conditions"><i class="fas fa-flask"></i> Condition Mapper</button>`
            );

            const manageModulesButton = html.find('#manage-modules')
            manageModulesButton.after(mapButton);

            mapButton.click(ev => {
                new CUBEnhancedConditionsConfig().render(true);
            });

        });
        
        
        //$('#manage-modules').parent().find('#enhanced-conditions').remove();
        
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
    
    static _getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }


    /**
    * @name lookupConditionMapping
    * @description check icon <-> condition mapping and call condition journal entry lookup against matches
    * @todo 
    * @parameter {Object} icons
    */
    async lookupConditionMapping(icons){
        let conditions = [];
        let conditon;
        //console.log(conditionMapping);

        //iterate through incoming icons and check the conditionMap for the corresponding entry
        for (let i of icons){
            try {
                condition = this.constructor._getKeyByValue(this.settings.map, i);
            } catch (e) {
                console.log(e);
            } finally {
                conditions.push(i);
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

        for (let c of conditions){
            if(c){
                let re = new RegExp(condition,'i');
                let entry = await game.journal.entities.find(j => j.name.match(re));
                console.log(entry);
                conditionEntries.push(entry);
            }
        }

        console.log(conditionEntries);
        if(this.settings.output){
            return this.outputChatMessage(conditionEntries);
        } else {
            return;
        }       
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
            width: 500
        });
    }

    getData() {
        //map = game.settings.get(cubGetModuleName(), CUBEnhancedConditions.GADGET_NAME + "(" + CUBEnhancedConditions.SETTINGS.MapN + ")");
        const map = CUBConfigSidekick.getGadgetSettings(CUBEnhancedConditions.GADGET_NAME + "(" + CUBEnhancedConditions.SETTINGS_DESCRIPTORS.MapN + ")");
        const data = {
            conditionmap: map
        }

        return data;
    }


}

//auto bloodied and dead
class CUBInjuredAndDead {
    constructor(){
        this.MODULE_NAME = cubGetModuleName();
        this.settings = {
            injured: CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.InjuredN + ")", this.SETTINGS_META.Injured),
            threshold: CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ThresholdN + ")", this.SETTINGS_META.Threshold),
            dead: CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.DeadN + ")", this.SETTINGS_META.Dead),
            injuredIcon: CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.InjuredIconN + ")", this.SETTINGS_META.InjuredIcon),
            deadIcon: CUBConfigSidekick.initGadgetSettings(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.DeadIconN + ")", this.SETTINGS_META.DeadIcon),
        }
    }
    
	get GADGET_NAME() {
        return "injured-and-dead";
    } 

	SETTINGS_DESCRIPTORS = {
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
			name: this.SETTINGS_DESCRIPTORS.InjuredN,
			hint: this.SETTINGS_DESCRIPTORS.InjuredH,
			default: this.DEFAULT_CONFIG.Injured,
			scope: "world",
			type: Boolean,
			config: true,
			onChange: s => {
				this.injured = s;
			}

        },
        InjuredIcon: {
			name: this.SETTINGS_DESCRIPTORS.InjuredIconN,
			hint: this.SETTINGS_DESCRIPTORS.InjuredIconH,
			default: this.DEFAULT_CONFIG.InjuredIcon,
			scope: "world",
			type: String,
			config: true,
			onChange: s => {
				this.injuredIcon = s;
			}

		},
		Threshold: {
			name: this.SETTINGS_DESCRIPTORS.ThresholdN,
			hint: this.SETTINGS_DESCRIPTORS.ThresholdH,
			default: this.DEFAULT_CONFIG.Threshold,
			scope: "world",
			type: Number,
			config: true,
			onChange: s => {
				this.threshold = s;
			}
		},
		Dead: {
			name: this.SETTINGS_DESCRIPTORS.DeadN,
			hint: this.SETTINGS_DESCRIPTORS.DeadH,
			default: this.DEFAULT_CONFIG.Dead,
			scope: "world",
			type: Boolean,
			config: true,
			onChange: s => {
				this.dead = s;
			}
        },
        DeadIcon: {
			name: this.SETTINGS_DESCRIPTORS.DeadIconN,
			hint: this.SETTINGS_DESCRIPTORS.DeadIconH,
			default: this.DEFAULT_CONFIG.DeadIcon,
			scope: "world",
			type: String,
			config: true,
			onChange: s => {
				this.deadIcon = s;
			}

		}
	}
    
	

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