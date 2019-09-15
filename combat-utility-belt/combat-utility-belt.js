class CUBSignal {
    constructor(){
        this.hookOnInit();
        this.hookOnReady();
    }


    hookOnInit() {
        Hooks.on("init", () => {
            const cubSidekick = new CUBSidekick();
            const cubHideNPCNames = new CUBHideNPCNames();
            const cubEnhancedConditions = new CUBEnhancedConditions(); 
        });
    }

    hookOnReady() {
        Hooks.on("ready", () => {
            const cubRerollInitiative = new CUBRerollInitiative();
            const cubInjuredAndDead = new CUBInjuredAndDead();
        });
    }

    
}

/**
 * Provides helper methods for use elsewhere in the module
 */
class CUBSidekick  {
    constructor(){
        
    }

    static get MODULE_NAME() {
        return "combat-utility-belt"
    }

	static registerGadgetSetting(gadget, setting) {
		game.settings.register(this.MODULE_NAME, gadget, setting);
	}

	static getGadgetSetting(setting) {
		return game.settings.get(this.MODULE_NAME, setting);
	}

	static initGadgetSetting(gadget, settings) {
		console.log("inc gadget name:",gadget);
		console.log("inc gadget metadata:",settings);
		let config;

		try {
			config = this.getGadgetSetting(gadget);
			console.log("config found:", config);
		}
		catch (e) {
			if(e.message == "This is not a registered game setting") {
				this.registerGadgetSetting(gadget, settings);
				config = this.getGadgetSetting(gadget);
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
     * Change a setting for a gadget
     * if the setting is an object, then dot notation must be used for properties
     * Examples:
     * setGadgetSetting("hide-npc-names", true);
     * setGadgetSetting("enhanced-conditions(Condition Map).dnd5e",["Blinded","path-to-icon/icon.svg"])
     * @param {String} setting 
     * @param {*} value 
     */
    static async setGadgetSetting(setting, value) {
        const oldSettingValue = this.getGadgetSetting(setting);
        Object.freeze(oldSettingValue);

        let newSettingValue;

        if(typeOf(oldSettingValue) === typeOf(value)) {
            newSettingValue = await game.settings.set(this.MODULE_NAME, setting, value);
            return newSettingValue;
        } else if(typeOf(oldSettingValue) === "Object" && (setting.includes("."))) {

            //call the duplicate helper function from foundry.js
            let tempSettingObject = duplicate(oldSettingValue);

            let updated = setProperty(tempSettingObject, setting, value);

            if(update) {
                newSettingValue = await game.settings.set(this.contructor.MODULE_NAME, tempSettingObject, value);
            } else {
                throw("Failed to update nested property of " + setting + " check syntax");
            }
        }
        
        return newSettingValue;

    }
    
    static getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }
}

/**
 * Rerolls initiative for all combatants
 */
class CUBRerollInitiative {
    constructor(){
        //intialise settings
        this.settings = CUBSidekick.initGadgetSetting(this.GADGET_NAME, this.SETTINGS_META);
        this._hookUpdateCombat();
        this.currentCombatRound = null;
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
    async _hookUpdateCombat() {
        Hooks.on("updateCombat",(async (combat, update) => {
            let rerolled;

            if(this.currentCombatRound != combat.round){
                rerolled = false;
            }
            

            console.log(combat,update);
            /**
             *  firstly is the specified module setting turned on (eg. is rerolling enabled), 
             *  then test for the presence of the combat object's previous values and an update object,
             *  check that the round props are numbers,
             *  to avoid any hysteria at the start of combat, only reroll if the update round is gt or equal to 1
             *  finally test if the update's round is greater than the previous combat round 
             */
            if(this.settings
            && !rerolled 
            && (combat.previous && update)
            && !isNaN(combat.previous.round || update.round)
            && update.round >= 1
            && update.round > combat.previous.round){
                try {
                    await combat.resetAll();
                    combat.rollAll();
                    rerolled = true;
                    this.currentCombatRound = combat.round;
                } catch(e) {
                    console.log(e);
                }

            }
        }));
    }
}

/**
 * Hides NPC names in the combat tracker
 */
class CUBHideNPCNames {
    constructor(){
        //intialise settings
	    this.settings = CUBSidekick.initGadgetSetting(this.GADGET_NAME, this.SETTINGS_META);
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
            console.log(app,html);
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

                        //todo: find the tokens
                        //replace the hover event

                        

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
        this.settings = {
            enhancedConditions : CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ConditionsN + ")", this.SETTINGS_META.enhancedConditions),
            system : CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.SystemN + ")", this.SETTINGS_META.system ),
            folderType : CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.FolderTypeN + ")", this.SETTINGS_META.folderType),
            maps : CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.MapsN + ")", this.SETTINGS_META.maps),
            output : CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.OutputChatN + ")", this.SETTINGS_META.outputChat),
            systemName : CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_META.systemName.name + ")", this.SETTINGS_META.systemName),
            createEntries : CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_META.CreateEntriesN + ")", this.SETTINGS_META.createEntries)

        }

        this.constructor._createSidebarButton();
        this._addStatusIcons();
        this._hookOnUpdateToken();
        this._hookOnRenderTokenHUD();
    }

    /**
     * --------------------
     * Set gadget constants
     * --------------------
     */
    get GADGET_NAME() {
        return "enhanced-conditions";
    }

    
    get DEFAULT_CONFIG() {
        return{
            iconPath: "modules/combat-utility-belt/icons/",
            folderTypes: {
                journal: "Journal",
                compendium: "Compendium"
            },
            folderName: "conditions",
            systems: {
                dnd5e: "Dungeons & Dragons 5th Edition",
                pf1e: "Pathfinder 1st Edition",
                pf2e: "Pathfinder 2nd Edition",
                wfrp: "Warhammer Fantasy Roleplaying Game",
                custom: "Custom/Other"
            },
            outputChat: true, 
            createEntries: false
        }
        
    }

    get DEFAULT_MAPS() {
        const dnd5e = new Map([
            ["Blinded", this.DEFAULT_CONFIG.iconPath+"blinded.svg"],
            ["Charmed", this.DEFAULT_CONFIG.iconPath+"charmed.svg"],
            ["Deafened", this.DEFAULT_CONFIG.iconPath+"deafened.svg"],
            ["Exhaustion", this.DEFAULT_CONFIG.iconPath+"exhaustion1.svg"],
            ["Frightened", this.DEFAULT_CONFIG.iconPath+"frightened.svg"],
            ["Incapacitated", this.DEFAULT_CONFIG.iconPath+"incapacitated.svg"],
            ["Invisible", this.DEFAULT_CONFIG.iconPath+"invisible.svg"],
            ["Paralyzed", this.DEFAULT_CONFIG.iconPath+"paralyzed.svg"],
            ["Petrified", this.DEFAULT_CONFIG.iconPath+"petrified.svg"],
            ["Poisoned", this.DEFAULT_CONFIG.iconPath+"poisoned.svg"],
            ["Prone", this.DEFAULT_CONFIG.iconPath+"prone.svg"],
            ["Restrained", this.DEFAULT_CONFIG.iconPath+"restrained.svg"],
            ["Stunned", this.DEFAULT_CONFIG.iconPath+"stunned.svg"],
            ["Unconscious", this.DEFAULT_CONFIG.iconPath+"unconscious.svg"]
        ]);

        const pf1e = new Map([
            ["Blinded", this.DEFAULT_CONFIG.iconPath+"blinded.svg"]
        ]);

        return {
            "dnd5e": dnd5e,
            "pf1e": pf1e
        }       
    }

    get SETTINGS_DESCRIPTORS() {
        return {
            EnhancedConditionsN: "Enhanced Conditions",
            EnhancedConditionsH: "Links conditions to status icons",
            FolderTypeN: "Folder Type",
            FolderTypeH: "Folder type to use when looking for Condition entries",
            SystemN: "Game System",
            SystemH: "Game System to use for condition mapping",
            TemplateN: "Condition Template",
            TemplateH: "Game system to use as a template for condition/status icon mapping",
            OutputChatN: "Output to Chat",
            OutputChatH: "Output matched conditions to chat",
            ConditionsN: "Conditions",
            ConditionsH: "List of conditions for the game system",
            MapsN: "Condition Maps",
            MapsH: "Maps of conditions to icons",
            CreateEntriesN: "Create Entries",
            CreateEntriesH: "Create journal entries if none exist"
        }
    }

    get SETTINGS_META() {
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
                default: this.DEFAULT_CONFIG.systems[game.system.data.name],
                choices: this.DEFAULT_CONFIG.systems,
                config: true,
                onChange: s => {
                    this.settings.system = s;
                }
            },

            systemName: {
                name: "SystemName",
                hint: "API name for the system",
                scope: "world",
                type: String,
                default: CUBSidekick.getKeyByValue(this.DEFAULT_CONFIG.systems, this.DEFAULT_CONFIG.systems[game.system.data.name]),
                onChange: s => {
                    this.settings.systemName = s;
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
    
            maps: {
                name: this.SETTINGS_DESCRIPTORS.MapsN,
                hint: this.SETTINGS_DESCRIPTORS.MapsH,
                scope: "world",
                type: Object,
                default: this.DEFAULT_MAPS,
                onChange: s => {
                    this.settings.maps = s;
                }
            },

            createEntries: {
                name: this.SETTINGS_DESCRIPTORS.CreateEntriesN,
                hint: this.SETTINGS_DESCRIPTORS.CreateEntriesH,
                scope: "world",
                type: Boolean,
                default: this.DEFAULT_CONFIG.createEntries,
                config: true,
                onChange: s => {
                    this.settings.createEntries = s;
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
    /* needs a rework
    get system() {
        return {
            name: CUBSidekick.getKeyByValue(this.DEFAULT_CONFIG.systems, this.settings.system),
            title: this.settings.system
        }
    }
    */

    /**
     * Retrieve the basic statusEffect icons from the Foundry CONFIG
     */
    
    get baseStatusIcons() {
        CONFIG.defaultStatusEffects = duplicate(CONFIG.statusEffects);
        Object.freeze(CONFIG.defaultStatusEffects);

        return defaultIcons;
    }

    static async _createJournalEntry(condition) {
        let entry;

        try {
            entry = await JournalEntry.create({name: condition},{displaySheet: false});
        } catch (e) {
            console.log(e);
        } finally {
            return await entry;
        }
        
    }

    /**
     * Add the new statuseffects
     * @todo make this an override on the token hud instead
     */
    _addStatusIcons(){
        //save the original icons
        if(!CONFIG.defaultStatusEffects) {
            CONFIG.defaultStatusEffects = duplicate(CONFIG.statusEffects);
            Object.freeze(CONFIG.defaultStatusEffects);
        }
       

        console.log(this.settings.maps);
        const map = this.settings.maps[this.settings.systemName];
        
        for(let [k,v] of map.entries()){
            CONFIG.statusEffects.push(v);
            console.log(k,v);
        }
        
    }
    
    /**
     * Define the labels for the D&D 5e conditions
     */
    
    get map() {
        return this.settings.maps[this.settings.systemName];
    }

    get inverseMap() {
        let newMap = new Map();
        for (let [k,v] of this.map) {
            newMap.set(v,k);
        }
        return newMap;
    }

    get icons() {
        return Array.from((this.settings.maps[this.settings.systemName]).values());
    }
    
    
    static _createSidebarButton() {
        Hooks.on("renderSettings", (app, html) => {
            const mapButton = $(
                `<button id="enhanced-conditions"><i class="fas fa-flask"></i> ${CUBEnhancedConditionsConfig.defaultOptions.title} </button>`
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

    /**
     * 
     * @param {*} icons 
     */
    _hookOnRenderTokenHUD() {
        Hooks.on("renderTokenHUD", (app, html) => {
            const conditionIcons = this.icons;

            console.log(app,html);
            let statusIcons = html.find(".effect-control");

            for(let i of statusIcons) {
                const src = i.attributes.src.value;

                if(conditionIcons.includes(src)){
                    i.setAttribute("title", this.inverseMap.get(src));
                }
                
            }
        });
    }


    /**
    * @name lookupConditionMapping
    * @description check icon <-> condition mapping and call condition journal entry lookup against matches
    * @todo 
    * @parameter {Object} icons
    */
    async lookupConditionMapping(icons){
        let conditions = [];
        let condition;
        //console.log(conditionMapping);

        //iterate through incoming icons and check the conditionMap for the corresponding entry
        for (let i of icons){
            try {
                for (let [k,v] of this.map.entries()) {
                    if(v == i) {
                        condition = k;
                    }
                }
            } catch (e) {
                console.log(e);
            } finally {
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
        let missingEntries = [];

        for (let c of conditions){
            if(c){
                let re = new RegExp(c,'i');
                let entry = await game.journal.entities.find(j => j.name.match(re));
                if (!entry && this.settings.createEntries) {
                    missingEntries.push(c);
                    entry = await this.constructor._createJournalEntry(c);
                }
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
        const chatUser = game.userId;
        const token = this.currentToken;
        const actor = await this.lookupTokenActor(token.actor.id);
        const chatType = CHAT_MESSAGE_TYPES.OTHER;
        let tokenSpeaker = {};
        let chatContent;
        let chatConditions = [];

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

        //create some boiler text for prepending to the conditions array
        if (entries.length > 0) {
            chatContent = tokenSpeaker.alias + " is:";
        }
        
        //iterate through the journal entries and output to chat
        for (let e of entries){
            let journalLink = "@JournalEntry["+e.name+"]";
            //let journalLink = e.name;
            //need to figure out best way to break out entries -- newline is being turned into space
            chatConditions.push("\n"+journalLink);   
        }

        //add the conditions to the boiler text
        if(chatConditions.length > 0) {
            chatContent += chatConditions;
        }
        

        await ChatMessage.create({
            speaker:tokenSpeaker,
            content:chatContent,
            type: chatType,
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
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "cub-condition-lab",
            title: "CUB Condition Lab",
            template: "public/modules/combat-utility-belt/templates/cub-conditions.html",
            classes: ["sheet"],
            width: 500
        });
    }

    getData() {
        //map = game.settings.get(cubGetModuleName(), CUBEnhancedConditions.GADGET_NAME + "(" + CUBEnhancedConditions.SETTINGS.MapsN + ")");
        const maps = CUBSidekick.getGadgetSetting(CUBEnhancedConditions.GADGET_NAME + "(" + CUBEnhancedConditions.SETTINGS_DESCRIPTORS.MapsN + ")");
        const system = CUBSidekick.getGadgetSetting(CUBEnhancedConditions.GADGET_NAME + "(" + CUBEnhancedConditions.SETTINGS_META.systemName.name + ")");
        const conditionMapArray = Array.from(maps[system]);

        const data = {
            conditionmap: conditionMapArray
        }

        return data;
    }

    /**
     * Take the new map and write it back to settings, overwriting existing
     * @param {Object} event 
     * @param {Object} formdata 
     */
    _updateObject(event,formdata) {
        console.log(event,formdata);
        let conditions = [];
        let icons = [];
        //let oldMapsSetting = CUBSidekick.getGadgetSetting(CUBEnhancedConditions.GADGET_NAME + "(" + CUBEnhancedConditions.SETTINGS_DESCRIPTORS.MapsN + ")");
        let newMap = new Map();
        const system = CUBSidekick.getGadgetSetting(CUBEnhancedConditions.GADGET_NAME + "(" + CUBEnhancedConditions.SETTINGS_META.systemName.name + ")");
        //let oldMap = oldMapsSetting[system];
        //let mergeMapsSetting = {};

        //need to tighten these up to check for the existence of digits after the word
        const conditionRegex = new RegExp('condition',"i");
        const iconRegex = new RegExp('icon',"i")


        //write it back to the relevant condition map
        for(let e in formdata){
            if(e.match(conditionRegex)){
                conditions.push(e);
            } else if (e.match(iconRegex)) {
                icons.push(e);
            }
        }

        for(let i;i <= conditions.length - 1; i++){
            newMap.set(conditions[i], icons[i]);
        }
/*
        mergeMapsSetting = mergeObject(oldMapsSetting, {
            [system]: newMap
        });
*/       

        CUBSidekick.setGadgetSetting(CUBEnhancedConditions.GADGET_NAME + "(" + CUBEnhancedConditions.SETTINGS_DESCRIPTORS.MapsN + ")" + "." + systemName, newMap);

        //not sure what to do about this yet, probably nothing
        console.assert(conditions.length === icons.length, "There are unmapped conditions");

        

    }


}

//auto bloodied and dead
class CUBInjuredAndDead {
    constructor(){
        this.settings = {
            injured: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.InjuredN + ")", this.SETTINGS_META.Injured),
            threshold: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ThresholdN + ")", this.SETTINGS_META.Threshold),
            dead: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.DeadN + ")", this.SETTINGS_META.Dead),
            injuredIcon: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.InjuredIconN + ")", this.SETTINGS_META.InjuredIcon),
            deadIcon: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.DeadIconN + ")", this.SETTINGS_META.DeadIcon),
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

var cubSignal = new CUBSignal;