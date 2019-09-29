// @ts-check

/**
 * Assign the namespace Object if it already exists or instantiate it as an object if not.
 */
const CUB = this.CUB || {};

/**
 * Provide constants for use throughout the module (and bandages your wounds)
 */
class CUBButler {
    static get MODULE_NAME() {
        return "combat-utility-belt";
    }

    static get MODULE_TITLE() {
        return "Combat Utility Belt";
    }

    /**
     * Stores information about well known game systems. All other systems will resolve to "other"
     */
    static get DEFAULT_GAME_SYSTEMS() {
        return {
            dnd5e: {
                id: "dnd5e",
                name: "Dungeons & Dragons 5th Edition",
                healthAttribute: "attributes.hp",
                initiative: "attributes.initiative"
            },
            pf2e: {
                id: "pf2e",
                name: "Pathfinder 2nd Edition",
                healthAttribute: "attributes.hp",
                initiative: "attributes.perception"
            },
            wfrp4e: {
                id: "wfrp4e",
                name: "Warhammer Fantasy Roleplaying Game 4th Edition",
                healthAttribute: "status.wounds",
                initiative: "characteristics.i"
            },
            archmage: {
                id: "archmage",
                name: "13th Age",
                healthAttribute: "attributes.hp",
                initiative: "attributes.init.mod"
            },
            other: {
                id: "other",
                name: "Custom/Other",
                healthAttribute: "health",
                initiative: "initiative"
            }
        }
    }
}

/**
 * Initiates module classes (and shines a light on the dark night sky)
 */
class CUBSignal {
    static lightUp() {
        CUBSignal.hookOnInit();
        CUBSignal.hookOnReady();
        CUBSignal.hookOnRenderSettings();
        CUBSignal.hookOnPreUpdateCombat();
        CUBSignal.hookOnRenderTokenHUD();
    }


    static hookOnInit() {
        Hooks.on("init", () => {
            //CUB.sidekick = new CUBSidekick();
            CUB.hideNPCNames = new CUBHideNPCNames();
            //CUBEnhancedConditions._createSidebarButton();
            CUBSidekick.handlebarsHelpers();
        });
    }

    static hookOnReady() {
        Hooks.on("ready", () => {
            CUB.enhancedConditions = new CUBEnhancedConditions();
            CUB.rerollInitiative = new CUBRerollInitiative();
            CUB.injuredAndDead = new CUBInjuredAndDead();
            CUB.enhancedConditions._toggleSidebarButtonDisplay(CUB.enhancedConditions.settings.enhancedConditions);

        });
    }

    static hookOnRenderSettings() {
        Hooks.on("renderSettings", (app, html) => {
            CUBEnhancedConditions._createSidebarButton(html);
        });
    }

    static hookOnPreUpdateCombat() {
        //Hooks.on("preUpdateCombat", (combat, update) => {
            //CUB.rerollInitiative.resetAndReroll(combat, update);
        //});
    }

    static hookOnRenderTokenHUD() {
        Hooks.on("renderTokenHUD", (app, html, data) => {
            
        });
    }
}

/**
 * Provides helper methods for use elsewhere in the module (and has your back in a melee)
 */
class CUBSidekick  {

    /**
     * Validate that an object is actually an object
     * @param {Object} object 
     * @returns {Boolean}
     */
    static validateObject(object){
        return object instanceof Object ? true : false;
    }

    /**
     * Convert any ES6 Maps/Sets to objects for settings use
     * @param {Map} map 
     */
    static convertMapToArray(map){
        return map instanceof Map ? Array.from(map.entries()) : null;
    }

    /**
     * Registers game settings for the specified gadget / gadget function
     * @param {String} key -- the key to refer to the setting 
     * @param {Object} setting -- a setting object
     */
	static registerGadgetSetting(key, setting) {
		game.settings.register(CUBButler.MODULE_NAME, key, setting);
	}

    /**
     * Retrieves a game setting for the specified gadget / gadget function
     * @param {String} key -- the key to lookup 
     */
	static getGadgetSetting(key) {
		return game.settings.get(CUBButler.MODULE_NAME, key);
	}

    /**
     * Retrieves a game setting for the specified gadget if it exists 
     * or registers the setting if it does not 
     * @param {String} key 
     * @param {Object} setting 
     */
	static initGadgetSetting(key, setting) {
		//console.log("inc gadget name:",gadget);
		//console.log("inc gadget metadata:",settings);
		let config;

		try {
			config = this.getGadgetSetting(key);
			//console.log("config found:", config);
		}
		catch (e) {
			if(e.message == "This is not a registered game setting") {
				this.registerGadgetSetting(key, setting);
				config = this.getGadgetSetting(key);
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
     * @param {String} key -- the setting key
     * @param {*} value -- the new value
     */
    static async setGadgetSetting(key, value) {
        let oldSettingValue;
        let keyParts = [];
        let settingKey;
        let settingSubkeys;
        let joinedSubkeys;

        if(key.includes(".")) {
            keyParts = key.split(".");
            settingKey = keyParts[0];
            settingSubkeys = keyParts.slice(1,keyParts.length);
            joinedSubkeys = settingSubkeys.join(".");
            oldSettingValue = this.getGadgetSetting(settingKey);
        } else {
            oldSettingValue = this.getGadgetSetting(key);
        }
        Object.freeze(oldSettingValue);

        let newSettingValue;

        if(typeof oldSettingValue === "object" && (key.includes("."))) {
            

            //call the duplicate helper function from foundry.js
            let tempSettingObject = duplicate(oldSettingValue);
            
            let updated = setProperty(tempSettingObject, joinedSubkeys, value);

            if(updated) {
                //console.log(CUBButler.MODULE_NAME, settingKey, tempSettingObject);
                newSettingValue = await game.settings.set(CUBButler.MODULE_NAME, settingKey, tempSettingObject);
            } else {
                throw("Failed to update nested property of " + key + " check syntax");
            }
            
        } else if(typeof oldSettingValue === typeof value) {
            //console.log(CUBButler.MODULE_NAME, key, value);
            newSettingValue = await game.settings.set(CUBButler.MODULE_NAME, key, value);
        }
        
        return newSettingValue;

    }
    
    /**
     * Retrieves a key using the given value
     * @param {Object} object -- the object that contains the key/value
     * @param {*} value 
     */
    static getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }

    static handlebarsHelpers() {
        Handlebars.registerHelper("concat", () => {
            let result;

            for(let a in arguments){
                result += (typeof arguments[a] === "string" ? arguments[a] : "");
                }
            
            return result;
        });
    }
}

/**
 * @class CUBRerollInitiative
 * Rerolls initiative for all combatants
 */
class CUBRerollInitiative {
    constructor(){
        this.settings = {
            reroll: CUBSidekick.initGadgetSetting(this.GADGET_NAME, this.SETTINGS_META)
        }
        this._hookUpdateCombat();
        this.currentCombatRound = null;
    }

	get GADGET_NAME() {
        return "reroll-initiative";
    }


	get DEFAULT_CONFIG() {
        return {
            reroll: false
        }
    }

    get SETTINGS_DESCRIPTORS() {
        return {
            RerollN: "--Reroll Initiative--",
            RerollH: "Reroll initiative for each combatant every round"
        }
        
    }
    
    get SETTINGS_META() {
        return {
            name: this.SETTINGS_DESCRIPTORS.RerollN,
            hint: this.SETTINGS_DESCRIPTORS.RerollH,
            scope: "world",
            type: Boolean,
            default: this.DEFAULT_CONFIG.reroll,
            config: true,
            onChange: s => {
                this.settings.reroll = s;
            }
        }
        
    }

    resetAndReroll(combat, update) {
        const roundChanged = Boolean(getProperty(update, "round"));
        if(roundChanged) {
            //console.log(combat, update);
            for(let c of combat.turns) {
                
            }
        }
        //for each combatant in the combat instance
        //reset initiative
        //roll initiative

        //if successful
        //write the new initiative into the update
    }
    
    _resetInitiative(combatant) {
        //if the combatant has an initiative value, clear it
    }

    _rollInitiative(combatant) {
        //call an initiative die roll for the combatant
    }

    /**
     * Hook on update of Combat class. 
     * Reroll initiative if requirements met
     */
    async _hookUpdateCombat() {
        Hooks.on("updateCombat",(async (combat, update) => {
            const roundUpdate = Boolean(getProperty(update, "round"))
            
            //only proceed if there is an update to the round
            if(roundUpdate) {                
                
                /**
                 *  firstly is the specified module setting turned on (eg. is rerolling enabled), 
                 *  then test for the presence of the combat object's previous values and an update object,
                 *  check that the round props are numbers,
                 *  to avoid any hysteria at the start of combat, only reroll if the update round is gt or equal to 1
                 *  finally test if the update's round is greater than the previous combat round 
                 */
                if(game.user.isGM
                    && this.settings.reroll
                    && (combat.previous && update)
                    && !isNaN(combat.previous.round || update.round)
                    && update.round >= 1
                    && update.round > combat.previous.round){
                    try {
                        await combat.resetAll();
                        await combat.rollAll();
                        this.currentCombatRound = combat.round;
                    } catch(e) {
                        //console.log(e);
                    }

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
        this.settings = {
            hideNames: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.HideNamesN + ")", this.SETTINGS_META.hideNames),
            unknownCreatureString: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.UnknownCreatureN + ")", this.SETTINGS_META.unknownCreatureString)
        }
        this._hookOnRenderCombatTracker();
        this._hookOnRenderChatMessage();
    }

    get GADGET_NAME() {
        return "hide-npc-names";
    }

    get SETTINGS_DESCRIPTORS() {
        return {
            HideNamesN: "--Hide NPC Names--",
            HideNamesH: "Hides NPC names in the Combat Tracker",
            UnknownCreatureN: "Unknown Creature Name",
            UnknownCreatureH: "Text to display for hidden NPC names"
        }
    }
    
    get DEFAULT_CONFIG() {
        return {
            hideNames: false,
            unknownCreatureString: "Unknown Creature"
        }
    }

    get SETTINGS_META() {
        return {
            hideNames: {
                name: this.SETTINGS_DESCRIPTORS.HideNamesN,
                hint: this.SETTINGS_DESCRIPTORS.HideNamesH,
                scope: "world",
                type: Boolean,
                default: this.DEFAULT_CONFIG.hideNames,
                config: true,
                onChange: s => {
                    this.settings.hideNames = s;
                    ui.combat.render();
                    ui.chat.render(true);
                }
            },
            unknownCreatureString: {
                name: this.SETTINGS_DESCRIPTORS.UnknownCreatureN,
                hint: this.SETTINGS_DESCRIPTORS.UnknownCreatureH,
                scope: "world",
                type: String,
                default: this.DEFAULT_CONFIG.unknownCreatureString,
                config: true,
                onChange: s => {
                    this.settings.unknownCreatureString = s;
                    if(this.settings.hideNames) {
                        ui.combat.render();
                        ui.chat.render();
                    }
                }
            }
        }
    }

	/**
     * Hooks on the Combat Tracker render to replace the NPC names
     * @todo move hooks to signal class
     */
    _hookOnRenderCombatTracker() {
        Hooks.on("renderCombatTracker", (app,html) => {
            //console.log(app,html);
            // if not GM
            if(!game.user.isGM) {
                let combatantListElement = html.find('li');

                //for each combatant
                for(let e of combatantListElement) {
                    let token = game.scenes.active.data.tokens.find(t => t.id == e.dataset.tokenId);
                    
                    let actor = game.actors.entities.find(a => a.id === token.actorId);

                    //if not PC, module is enabled
                    if(!actor.isPC && this.settings.hideNames) {
                        //find the flexcol elements
                        let tokenNames = e.getElementsByClassName("token-name");
                        let tokenImages = e.getElementsByClassName("token-image");

                        //iterate through the returned elements
                        for(let f of tokenNames){
                            //find the h4 elements
                            let header = f.getElementsByTagName("H4");
                            //iterate through
                            for(let h of header){
                                //replace the name
                                h.textContent = this.settings.unknownCreatureString;
                            }
                        }

                        for(let i of tokenImages){
                            i.setAttribute("title", this.settings.unknownCreatureString);
                        }

                    }
                    
                } 
            }
        });
    }

    /**
     * Replaces instances of hidden NPC name in chat
     */
    _hookOnRenderChatMessage(){
        Hooks.on("renderChatMessage", (message, data, html) => {
            const pcActor = game.actors.entities.find(a => a.id === data.message.speaker.actor).isPC;

            if(!game.user.isGM && !pcActor && this.settings.hideNames) {
                const replacement = this.settings.unknownCreatureString || " ";
                html.find(`:contains('${data.alias}')`).each((i, el) => {
                    el.innerHTML = el.innerHTML.replace(new RegExp(data.alias, 'g'), replacement);
                });
            }
            //console.log(message,data,html);
        });
    }
}

/**
 * Builds a mapping between status icons and journal entries that represent conditions
 */
class CUBEnhancedConditions {
    constructor(){
        this.settings = {
            enhancedConditions : CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ConditionsN + ")", this.SETTINGS_META.enhancedConditions),
            system : CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.SystemN + ")", this.SETTINGS_META.system ),
            maps : CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.MapsN + ")", this.SETTINGS_META.maps),
            removeDefaultEffects: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.RemoveDefaultEffectsN + ")", this.SETTINGS_META.removeDefaultEffects),
            output : CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.OutputChatN + ")", this.SETTINGS_META.outputChat),
            //future features
            //folderType : CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.FolderTypeN + ")", this.SETTINGS_META.folderType),
            //compendium : CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.CompendiumN + ")", this.SETTINGS_META.compendium),
            //createEntries : CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_META.CreateEntriesN + ")", this.SETTINGS_META.createEntries),
        }

        this._updateStatusIcons();
        this._hookOnUpdateToken();
        this._hookOnRenderTokenHUD();
    }

    /**
     * Returns the name of the gadget
     */
    get GADGET_NAME() {
        return "enhanced-conditions";
    }

    
    get DEFAULT_CONFIG() {
        return{
            iconPath: "modules/combat-utility-belt/icons/",
            outputChat: true,
            /* future features
            folderTypes: {
                journal: "Journal",
                compendium: "Compendium"
            },
            folderName: "conditions",
            createEntries: false
            */
        }
        
    }

    /**
     * Defines the maps used in the gadget
     * @todo: needs a redesign -- programmatic matching to systems?
     */
    get DEFAULT_MAPS() {
        const dnd5eMap = [
            //Condition - Icon - JournalEntry
            ["Blinded", this.DEFAULT_CONFIG.iconPath + "blinded.svg", ""],
            ["Charmed", this.DEFAULT_CONFIG.iconPath + "charmed.svg", ""],
            ["Deafened", this.DEFAULT_CONFIG.iconPath + "deafened.svg", ""],
            ["Exhaustion", this.DEFAULT_CONFIG.iconPath + "exhaustion1.svg", ""],
            ["Frightened", this.DEFAULT_CONFIG.iconPath + "frightened.svg", ""],
            ["Incapacitated", this.DEFAULT_CONFIG.iconPath + "incapacitated.svg", ""],
            ["Invisible", this.DEFAULT_CONFIG.iconPath + "invisible.svg", ""],
            ["Paralyzed", this.DEFAULT_CONFIG.iconPath + "paralyzed.svg", ""],
            ["Petrified", this.DEFAULT_CONFIG.iconPath + "petrified.svg", ""],
            ["Poisoned", this.DEFAULT_CONFIG.iconPath + "poisoned.svg", ""],
            ["Prone", this.DEFAULT_CONFIG.iconPath + "prone.svg", ""],
            ["Restrained", this.DEFAULT_CONFIG.iconPath + "restrained.svg", ""],
            ["Stunned", this.DEFAULT_CONFIG.iconPath + "stunned.svg", ""],
            ["Unconscious", this.DEFAULT_CONFIG.iconPath + "unconscious.svg", ""]
        ];

        const pf1eMap = [];
        const pf2eMap = [];
        const wfrp4eMap = [];
        const archmageMap = [];
        const otherMap = [];

        return {
            "dnd5e": dnd5eMap,
            "pf1e": pf1eMap,
            "pf2e": pf2eMap,
            "wfrp4e": wfrp4eMap,
            "archmage": archmageMap,
            "other": otherMap,
        }       
    }

    /**
     * Contains the names and hints for the settings
     */
    get SETTINGS_DESCRIPTORS() {
        return {
            EnhancedConditionsN: "--Enhanced Conditions--",
            EnhancedConditionsH: "Links conditions to status icons",     
            SystemN: "Game System",
            SystemH: "Game System to use for condition mapping",
            OutputChatN: "Output to Chat",
            OutputChatH: "Output matched conditions to chat",
            MapsN: "Condition Maps",
            MapsH: "Maps of conditions to icons",
            RemoveDefaultEffectsN: "Remove Default Status Effects",
            RemoveDefaultEffectsH: "Remove existing status effect icons from token HUD",
            /* future features
            CreateEntriesN: "Create Entries",
            CreateEntriesH: "Create journal entries if none exist",
            CompendiumN: "Condition Compendium",
            CompendiumH: "The compendium that contains condition journal entries",
            FolderTypeN: "Folder Type",
            FolderTypeH: "Folder type to use when looking for Condition entries",
            */
        }
    }

    /**
     * Defines the metadata for the gadget's settings
     */
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
                    this._toggleSidebarButtonDisplay(s);
                }
    
            },
    
            system: {
                name: this.SETTINGS_DESCRIPTORS.SystemN,
                hint: this.SETTINGS_DESCRIPTORS.SystemH,
                scope: "world",
                type: String,
                default: (CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id] != null) ? CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id].id : CUBButler.DEFAULT_GAME_SYSTEMS.other.id,
                choices: this.systemChoices,
                config: true,
                onChange: s => {
                    this.settings.system = s;
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
                    this._updateStatusIcons(s[this.settings.system]);
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
            },

            removeDefaultEffects: {
                name: this.SETTINGS_DESCRIPTORS.RemoveDefaultEffectsN,
                hint: this.SETTINGS_DESCRIPTORS.RemoveDefaultEffectsH,
                scope: "world",
                type: Boolean,
                config: true,
                default: false,
                onChange: s => {
                    this.settings.removeDefaultEffects = s;
                    this._updateStatusIcons();
                }
            },

            /* future features
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

            compendium: {
                name: this.SETTINGS_DESCRIPTORS.CompendiumN,
                hint: this.SETTINGS_DESCRIPTORS.CompendiumH,
                scope: "world",
                type: String,
                default: game.packs.find(p => p.metadata.name == "conditions" + game.system.id),
                choices: this.compendiumChoices,
                config: true,
                onChange: s => {
                    this.settings.compendium = s;
                }
            }
            */
        }
        


    }

    /**
     * Gets the default game system names stored in the constants butler class
     */
    get systemChoices() {
        const systemIds = Object.getOwnPropertyNames(CUBButler.DEFAULT_GAME_SYSTEMS);
        let result = {};

        for(let i of systemIds) {
            result[i] = CUBButler.DEFAULT_GAME_SYSTEMS[i].name;
        }
        return result;
    }

    

    /**
     * Retrieve the statusEffect icons from the Foundry CONFIG
     */
    get coreStatusIcons() {
        CONFIG.defaultStatusEffects = CONFIG.defaultStatusEffects || duplicate(CONFIG.statusEffects);
        if(!Object.isFrozen(CONFIG.defaultStatusEffects)) {
            Object.freeze(CONFIG.defaultStatusEffects);
        }
        return CONFIG.defaultStatusEffects;
    }

    /**
     * Creates journal entries for any conditions that don't have one
     * @param {String} condition - the condition being evaluated
     */
    static async _createJournalEntry(condition) {
        let entry;

        try {
            entry = await JournalEntry.create({name: condition, permission: {default: ENTITY_PERMISSIONS.LIMITED}},{displaySheet: false});
        } catch (e) {
            //console.log(e);
        } finally {
            return await entry;
        }
        
    }

    /**
     * Updates the core CONFIG.statusEffects with the new icons
     */
    _updateStatusIcons(conditionMap){
        const map = conditionMap || this.settings.maps[this.settings.system];
        let entries;

        //save the original icons
        if(!CONFIG.defaultStatusEffects) {
            CONFIG.defaultStatusEffects = duplicate(CONFIG.statusEffects);
            Object.freeze(CONFIG.defaultStatusEffects);
        }
       

        //console.log(this.settings.maps);
        
        
        if(this.settings.removeDefaultEffects) {
            CONFIG.statusEffects = this.settings.maps[this.settings.system] ? this.icons : [];
        } else {
            if(map instanceof Map){
                entries = map.entries();
                for(let [k,v] of entries){
                    CONFIG.statusEffects.push(v);
                    //console.log(k,v);
                }
            } else if(map instanceof Array) {
                //add the icons from the condition map to the status effects array
                CONFIG.statusEffects = CONFIG.defaultStatusEffects.concat(this.icons)
            } else {
                entries = [];
            }
        }   
    }
    
    /**
     * Displays the condition map for the selected system
     */    
    get map() {
        return this.settings.maps[this.settings.system];
    }

    /**
     * Inverts the key and value in the map
     * @todo: rework
     */
    get inverseMap() {
        let newMap = new Map();
        for (let [k,v] of this.map) {
            newMap.set(v,k);
        }
        return newMap;
    }

    /**
     * Returns just the icon side of the map
     */
    get icons() {
        if(this.map instanceof Map) {
            return Array.from((this.settings.maps[this.settings.system]).values())
        } else if(this.map instanceof Array && this.map[0] instanceof Array) {
            let iconArray = [];
            this.map.forEach((value, index, array) => {
                iconArray.push(value[1]); 
            });

            return iconArray;
        } else if(this.map instanceof Array) {
            return this.map;
        } else {
            return [];
        }
    }
    
    /**
     * Creates a div for the module and button for the Condition Lab
     * @param {Object} html the html element where the button will be created
     */
    static _createSidebarButton(html) {
        const cubDiv = $(
                `<div id="combat-utility-belt">
                    <h4>Combat Utility Belt</h4>
                </div>`
        );

        const labButton = $(
                `<button id="condition-lab" data-action="condition-lab">
                    <i class="fas fa-flask"></i> ${CUBEnhancedConditionsConfig.defaultOptions.title}
                </button>`
        );

        cubDiv.append(labButton);

        const setupButton = html.find("button[data-action='setup']");
        setupButton.after(cubDiv);

        labButton.click(ev => {
            new CUBEnhancedConditionsConfig().render(true);
        });

    }

    /**
     * Determines whether to display the combat utility belt div in the settings sidebar
     * @param {Boolean} display 
     * @todo: extract to helper in sidekick class?
     */
    _toggleSidebarButtonDisplay(display) {
        let sidebarButton = document.getElementById("combat-utility-belt");

        if(game.user.isGM && display && sidebarButton) {
            sidebarButton.style.display = "block";
        } else if (sidebarButton && (!game.user.isGM || !display)){
            sidebarButton.style.display = "none";
        }
    }
    
    /**
     * @name currentToken
     * @type Object {Token}
     * @description holds the token for use elsewhere in the class
     */
    currentToken = {};

    get system() {
        return this.settings.system;
    }

    /**
    * Hooks on token updates. If the update includes effects, calls the journal entry lookup
    */
    _hookOnUpdateToken(){
        Hooks.on("updateToken", (token,sceneId,update) => {
            //console.log(token,sceneId,update);
            let effects = update.effects;
            
            //If the update has effects in it, lookup mapping and set the current token
            if(this.settings.enhancedConditions && effects){
                this.currentToken = token;
                return this.lookupEntryMapping(effects);
            }
            return;
        });
    }

    /**
     * Adds a title/tooltip with the matched Condition name
     */
    _hookOnRenderTokenHUD() {
        Hooks.on("renderTokenHUD", (app, html) => {
            const conditionIcons = this.icons;

            //console.log(app,html);
            let statusIcons = html.find("img.effect-control");

            for(let i of statusIcons) {
                const src = i.attributes.src.value;

                if(conditionIcons.includes(src)){
                    i.setAttribute("title", this.inverseMap.get(src));
                }
                
            }
        });
    }

    /**
     * Checks statusEffect icons against mapping and returns matching journal entries
     * @param {*} icons 
     */
    async lookupEntryMapping(icons) {
        let map;
        let mapEntries = [];
        let conditionEntries = [];
        let entry;

        if(this.map instanceof Map) {
            map = this.map.entries();
        } else if(this.map instanceof Array) {
            map = this.map;
        } else {
            throw "condition map is not iterable";
        }
        //iterate through incoming icons and check the conditionMap for the corresponding entry
        for (let i of icons){
            try {
                for (let [mc, mi, me] of map) {
                    if(mi == i) {
                        if(me.length > 1) {
                            entry = me;
                        } else {
                            entry = mc;
                        }
                        
                    }
                }
            } catch (e) {
                //console.log(e);
            } finally {
                mapEntries.push(entry);
            }
        }

        for(let e of mapEntries){
            if(e){
                let entry = await game.journal.entities.find(j => j.id == e);
                if(entry) {
                    conditionEntries.push(entry);
                } else {
                    conditionEntries.push(e);
                }
                
            }
        }

        //console.log(conditionEntries);
        if(this.settings.output && conditionEntries.length > 0){
            return this.outputChatMessage(conditionEntries);
        } else {
            return;
        }
    }

    /**
    * @name lookupConditionMapping
    * @description check icon <-> condition mapping and call condition journal entry lookup against matches
    * @todo 
    * @parameter {Object} icons
    */
    /* deprecated, remove?
    async lookupConditionMapping(icons){
        let conditions = [];
        let condition;
        let entries;
        //console.log(conditionMapping);

        if(this.map instanceof Map) {
            entries = this.map.entries();
        } else if(this.map instanceof Array) {
            entries = this.map;
        } else {
            throw "condition map is not iterable";
        }
        //iterate through incoming icons and check the conditionMap for the corresponding entry
        for (let i of icons){
            try {
                for (let [k,v] of entries) {
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
    */

    
    /**
     * @name lookupConditionEntries
     * @description lookup condition journal/compendium entry and call chat output if option set
     * @todo rebuild to allow switching between journal/compendium lookup
     */
    /* deprecated, remove?
    async lookupConditionEntries(conditions){
        let conditionEntries = [];
        let missingEntries = [];

        for(let c of conditions){
            if(c){
                let re = new RegExp(c,'i');
                let entry = await game.journal.entities.find(j => j.name.match(re));
             
                if(!entry && this.settings.createEntries && game.user.isGM) {
                    missingEntries.push(c);
                    entry = await this.constructor._createJournalEntry(c);
                }
                console.log(entry);
                conditionEntries.push(entry);
            }
        }

        console.log(conditionEntries);
        if(this.settings.output && conditionEntries.length > 0){
            return this.outputChatMessage(conditionEntries);
        } else {
            return;
        }       
    }
    */

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
        let journalLink;

        //console.log("current token",token);
        //console.log("current actor",actor);
        //console.log("token id",this.tokenData.id);
        
        if(actor){
            //console.log("Speaker is an actor:",actor);
            tokenSpeaker = ChatMessage.getSpeaker({"actor":actor});
        }
        else {
            //console.log("Speaker is a token:",token);
            tokenSpeaker = ChatMessage.getSpeaker({"token":token});
        }

        //create some boiler text for prepending to the conditions array
        if (entries.length > 0) {
            chatContent = tokenSpeaker.alias + " is:";
        }
        
        //iterate through the journal entries and output to chat
        for (let e of entries){
            if (e instanceof Object) {
                journalLink = "@JournalEntry["+e.name+"]";
            } else {
                journalLink = e;
            }
            
            //let journalLink = e.name;
            //need to figure out best way to break out entries -- newline is being turned into space
            chatConditions.push("\n"+journalLink);   
        }

        //add the conditions to the boiler text
        if(chatConditions.length > 0) {
            chatContent += chatConditions;

            await ChatMessage.create({
                speaker:tokenSpeaker,
                content:chatContent,
                type: chatType,
                user:chatUser
            });
        }
    }

    
        
    /**
     * looks up the corresponding actor entity for the token
     * @param {String} id 
     * @returns {Actor} actor
     */
    async lookupTokenActor(id){
        let actor = {};
        if(id){
            actor = await game.actors.entities.find(a => a.id === id);
            
        }
        //console.log("found actor: ",actor)
        return actor;
    } 
    
    /* future features
    get compendiumChoices() {
        const compendiums = game.packs;
        let result = {};

        for(let n of compendiums) {
            result[n.metadata.name] = n.metadata.label; 
        }
        
        return result;
    }
    */
    
}

//enhanced conditions config
class CUBEnhancedConditionsConfig extends FormApplication {
    constructor(){
        super();
        this.data = CUB.enhancedConditions;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "cub-condition-lab",
            title: "Condition Lab",
            template: "public/modules/combat-utility-belt/templates/cub-conditions.html",
            classes: ["sheet"],
            width: 500,
            height: "auto",
            resizable: true
        });
    }

    getData() {
        //map = game.settings.get(cubGetModuleName(), CUBEnhancedConditions.GADGET_NAME + "(" + CUBEnhancedConditions.SETTINGS.MapsN + ")");
        //const maps = CUBSidekick.getGadgetSetting(this.data.GADGET_NAME + "(" + this.data.SETTINGS_DESCRIPTORS.MapsN + ")");
        //const system = CUBSidekick.getGadgetSetting(this.data.GADGET_NAME + "(" + this.data.SETTINGS_DESCRIPTORS.SystemNameN + ")");
        //const conditionMapArray = Array.from(maps[system]);
        let entries = {};

        for(let e of game.journal.entities) {
            entries[e.id] = e.name;
        }

        const formData = {
            conditionmap: this.data.map,
            systems: this.data.systemChoices,
            system: this.data.system,
            entries: entries
        }

        return formData;
    }

    /**
     * Take the new map and write it back to settings, overwriting existing
     * @param {Object} event 
     * @param {Object} formdata 
     */
    _updateObject(event,formdata) {
        //console.log(event,formdata);
        let conditions = [];
        let icons = [];
        let entries = [];
        //let oldMapsSetting = CUBSidekick.getGadgetSetting(CUBEnhancedConditions.GADGET_NAME + "(" + CUBEnhancedConditions.SETTINGS_DESCRIPTORS.MapsN + ")");
        let newMap = [];
        //const system = CUBSidekick.getGadgetSetting(this.data.GADGET_NAME + "(" + this.data.SETTINGS_DESCRIPTORS.SystemNameN + ")");
        //let oldMap = oldMapsSetting[system];
        //let mergeMapsSetting = {};

        //need to tighten these up to check for the existence of digits after the word
        const conditionRegex = new RegExp('condition',"i");
        const iconRegex = new RegExp('icon',"i")
        const journalRegex = new RegExp('journal',"i");


        //write it back to the relevant condition map
        //todo: maybe switch to a switch
        for(let e in formdata){
            if(e.match(conditionRegex)){
                conditions.push(formdata[e]);
            } else if (e.match(iconRegex)) {
                icons.push(formdata[e]);
            } else if (e.match(journalRegex)) {
                entries.push(formdata[e]);
            }
        }

        for(let i = 0;i <= conditions.length - 1; i++){
            newMap.push([conditions[i], icons[i], entries[i]]);
        }
/*
        mergeMapsSetting = mergeObject(oldMapsSetting, {
            [system]: newMap
        });
*/       

        CUBSidekick.setGadgetSetting(this.data.GADGET_NAME + "(" + this.data.SETTINGS_DESCRIPTORS.MapsN + ")" + "." + this.data.system, newMap);

        //not sure what to do about this yet, probably nothing
        console.assert(conditions.length === icons.length, "There are unmapped conditions");
    }

    activateListeners(html) {
        super.activateListeners(html);
        let newSystem;
        const systemSelector = html.find("select[class='system']");
        const addRowButton = html.find("button[class='add-row']");
        const removeRowButton = html.find("button[class='remove-row']");
        const iconPath = html.find("input[class='icon-path']");
        const restoreDefaultsButton = html.find("button[class='restore-defaults']");
        
        systemSelector.change(async ev => {
            //ev.preventDefault();
            //find the selected option
            const selection = $(ev.target).find("option:selected");

            //capture the value of the selected option
            newSystem = selection.val();

            //set the enhanced conditions system to the new value
            await CUBSidekick.setGadgetSetting(this.data.GADGET_NAME + "(" + this.data.SETTINGS_DESCRIPTORS.SystemN + ")", newSystem);

            //if there's no mapping for the newsystem, create one
            if(!this.data.settings.maps[newSystem]) {
                const newMap = [];

                await CUBSidekick.setGadgetSetting(this.data.GADGET_NAME + "(" + this.data.SETTINGS_DESCRIPTORS.MapsN + ")" + "." + newSystem, newMap);
            }

            //rerender the form to get the correct condition mapping template
            this.render(true);
        });

        addRowButton.click(async ev => {
            ev.preventDefault();
            CUB.enhancedConditions.settings.maps[this.data.system].push(["",""]);
            this.render(true);
        });

        removeRowButton.click(async ev => {
            //console.log(ev);
            const splitName = ev.currentTarget.name.split("-");
            const row = splitName[splitName.length -1];

            //console.log("row", row);
            ev.preventDefault();
            CUB.enhancedConditions.settings.maps[this.data.system].splice(row,1);
            this.render(true);
        });

        iconPath.change(async ev => {
            ev.preventDefault();
            //console.log("change", ev, this);
            const splitName = ev.target.name.split("-");
            const row = splitName[splitName.length -1];

            //CUB.enhancedConditions.settings.maps[this.data.system][row][1] = ev.target.val();
            //this.render(true);

            //target the icon
            let icon = $(this.form).find("img[name='icon-" + row);
            icon.attr("src", ev.target.value);
        });

        restoreDefaultsButton.click(async ev => {
            ev.preventDefault();
            //console.log("restore defaults clicked", ev);
            CUB.enhancedConditions.settings.maps[this.data.system] = CUB.enhancedConditions.DEFAULT_MAPS[this.data.system] ? CUB.enhancedConditions.DEFAULT_MAPS[this.data.system] : [];
            this.render(true);
        });
    }


}

//auto bloodied and dead
class CUBInjuredAndDead {
    constructor(){
        this.settings = {
            injured: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.InjuredN + ")", this.SETTINGS_META.Injured),
            healthAttribute: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.HealthAttributeN + ")", this.SETTINGS_META.healthAttribute),
            threshold: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ThresholdN + ")", this.SETTINGS_META.Threshold),
            injuredIcon: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.InjuredIconN + ")", this.SETTINGS_META.InjuredIcon),
            dead: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.DeadN + ")", this.SETTINGS_META.Dead),
            deadIcon: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.DeadIconN + ")", this.SETTINGS_META.DeadIcon)
        }

        this.currentActor;
        this._hookOnTokenUpdate();
        this._hookOnUpdateActor();
    }
    
	get GADGET_NAME() {
        return "injured-and-dead";
    } 

	get SETTINGS_DESCRIPTORS() {
        return {
            InjuredN: "--Mark Injured Tokens--",
            InjuredH: "Sets a status marker on tokens that meet the threshold below",
            InjuredIconN: "Injured Status Marker",
            InjuredIconH: "Path to the status marker to display for Injured Tokens",
            ThresholdN: "Injured Token Threshold",
            ThresholdH: "Enter the percentage of HP lost when a token should be considered injured",
            DeadN: "--Mark Dead Tokens--",
            DeadH: "Sets a status marker on tokens that reach 0 hp",
            DeadIconN: "Dead Status Marker",
            DeadIconH: "Path to the status marker to display for Dead Tokens",
            HealthAttributeN: "Health Attribute",
            HealthAttributeH: "Health/HP attribute name as defined by game system"
        } 
	}

	get DEFAULT_CONFIG() {
        return {
            Injured: false,
            InjuredIcon: "icons/svg/blood.svg",
		    Threshold: 50,
            Dead: false,
            DeadIcon: "icons/svg/skull.svg",
        } 
	}

	get SETTINGS_META() {
        return {
            Injured: {
                name: this.SETTINGS_DESCRIPTORS.InjuredN,
                hint: this.SETTINGS_DESCRIPTORS.InjuredH,
                default: this.DEFAULT_CONFIG.Injured,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.injured = s;
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
                    this.settings.injuredIcon = s;
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
                    this.settings.threshold = s;
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
                    this.settings.dead = s;
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
                    this.settings.deadIcon = s;
                }
            },
            healthAttribute: {
                name: this.SETTINGS_DESCRIPTORS.HealthAttributeN,
                hint: this.SETTINGS_DESCRIPTORS.HealthAttributeH,
                default: (CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id] != null) ? CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id].healthAttribute : CUBButler.DEFAULT_GAME_SYSTEMS.other.healthAttribute,
                scope: "world",
                type: String,
                config: true,
                onChange: s => {
                    this.settings.healthAttribute = s;
                }
            }
        }
		
	}
	

    
    /**
     * Hooks on token update
     * @todo: need a check to see if the actor has been evaluated already
     */
	_hookOnTokenUpdate() {
        Hooks.on("updateToken", (token,sceneid,update) => {
            //A boolean to capture whether token health changed in this update
            const healthChanged = Boolean(getProperty(update, "actorData.data." + this.settings.healthAttribute));

            //killswitch for function execution -- does the update have a health attribute
            if(this.currentActor != token.actor.id && healthChanged) {
                //console.log(token,sceneid,update);
                const currentHealth = getProperty(token.actor.data.data, this.settings.healthAttribute).value;
                const updateHealth = getProperty(update.actorData.data, this.settings.healthAttribute).value;
                const maxHealth = getProperty(token.actor.data.data, this.settings.healthAttribute).max;
                const linked = token.data.actorLink;
                
                //if hp = 0 mark as dead
                if(!linked && this.settings.dead && update.actorData.data && updateHealth == 0){
                    //set death overlay on token
                    token.toggleOverlay(this.settings.deadIcon);
                    //if the token has effects, remove them
                    if(token.data.effects.length > 0) {
                        for(let e of token.data.effects) {
                            token.toggleEffect(e);
                        }
                    }
                //if injured tracking is enabled and the current hp is less than the maxHealth * the decimal version of the threshold
                } else if(!linked && this.settings.injured && update.actorData.data && updateHealth < (maxHealth*(this.settings.threshold/100)) && !token.data.effects.find(e => e = this.settings.injuredIcon)) {
                    //set status effect on token
                    token.toggleEffect(this.settings.injuredIcon);
                    //if the dead tracking is enabled and the token has an overlay, remove the dead overlay
                    if(this.settings.dead && token.data.overlayEffect && token.data.overlayEffect == this.settings.deadIcon) {
                        token.toggleOverlay(this.settings.deadIcon);
                    }
    
                //if injured tracking is enabled and the current hp is greater than the maxHealth * the decimal version of the threshold
                } else if(!linked && this.settings.injured && update.actorData.data && updateHealth > (maxHealth*(this.settings.threshold/100))) {
                    //if the token has the injured icon, remove it
                    if(this.settings.injured && token.data.effects && token.data.effects.length > 0 && token.data.effects.find(e => e = this.settings.injuredIcon)) {
                        token.toggleEffect(this.settings.injuredIcon);
                    }
    
                    //if the token has the dead icon, remove it
                    if(this.settings.dead && token.data.overlayEffect && token.data.overlayEffect == this.settings.deadIcon) {
                        token.toggleOverlay(this.settings.deadIcon);
                    }
                }
            }
            
        
        });
    }
    
    /**
     * Hooks on Actor update
     */
    _hookOnUpdateActor() {
        Hooks.on("updateActor", async (actor, update) => {
            
            const healthChanged = Boolean(update["data." + this.settings.healthAttribute + ".value"] === 0 ? 
                "dead" : 
                update["data." + this.settings.healthAttribute + ".value"]);

            //killswitch for function execution -- is there a health attribute value in the update data
            //if(update["data." + this.settings.healthAttribute + ".value"]) {
            if(healthChanged) {
                this.currentActor = actor.id;
                //console.log(actor, update);
                const currentHealth = getProperty(actor.data.data, this.settings.healthAttribute).value;
                const updateHealth = update["data." + this.settings.healthAttribute + ".value"];
                const maxHealth = getProperty(actor.data.data, this.settings.healthAttribute).max;
                let token = canvas.tokens.placeables.find(t => t.actor.id == actor.id);

                //console.log(token);

                //if hp = 0 mark as dead
                if(this.settings.dead && updateHealth == 0){
                    //set death overlay on token
                    await token.toggleOverlay(this.settings.deadIcon);
                    //if the token has effects, remove them
                    if(token.data.effects.length > 0) {
                        for(let e of token.data.effects) {
                            await token.toggleEffect(e);
                        }
                    }
                //if injured tracking is enabled and the current hp is less than the maxHealth * the decimal version of the threshold
                } else if(this.settings.injured && updateHealth <= (maxHealth*(this.settings.threshold/100)) && !token.data.effects.find(e => e = this.settings.injuredIcon)) {
                    //set status effect on token
                    await token.toggleEffect(this.settings.injuredIcon);
                    //if the dead tracking is enabled and the token has an overlay, remove the dead overlay
                    if(this.settings.dead && token.data.overlayEffect && token.data.overlayEffect == this.settings.deadIcon) {
                        await token.toggleOverlay(this.settings.deadIcon);
                    }

                //if injured tracking is enabled and the current hp is greater than the maxHealth * the decimal version of the threshold
                } else if(this.settings.injured && updateHealth > (maxHealth*(this.settings.threshold/100))) {
                    //if the token has the injured icon, remove it
                    if(this.settings.injured && token.data.effects && token.data.effects.length > 0 && token.data.effects.find(e => e = this.settings.injuredIcon)) {
                        await token.toggleEffect(this.settings.injuredIcon);
                    }

                    //if the token has the dead icon, remove it
                    if(this.settings.dead && token.data.overlayEffect && token.data.overlayEffect == this.settings.deadIcon) {
                        await token.toggleOverlay(this.settings.deadIcon);
                    }
                }
            }
        });
    }
}

CUBSignal.lightUp();