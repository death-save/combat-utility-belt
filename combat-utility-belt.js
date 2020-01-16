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
        };
    }

    static get HEALTH_STATES() {
        return {
            HEALTHY: "healthy",
            INJURED: "injured",
            DEAD: "dead"
        };
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
        CUBSignal.hookOnRenderTokenHUD();
        CUBSignal.hookOnCreateToken();
        CUBSignal.hookOnPreUpdateToken();
        CUBSignal.hookOnUpdateToken();
        CUBSignal.hookOnUpdateActor();
        CUBSignal.hookOnPreUpdateCombat();
        CUBSignal.hookOnUpdateCombat();
        CUBSignal.hookOnUpdateCombatAsync();
        CUBSignal.hookOnDeleteCombat();
        CUBSignal.hookOnRenderCombatTracker();
        CUBSignal.hookOnRenderChatMessage();
    }


    static hookOnInit() {
        Hooks.on("init", () => {
            CUB.hideNPCNames = new CUBHideNPCNames();
            CUBSidekick.handlebarsHelpers();
        });
    }

    static hookOnReady() {
        Hooks.on("ready", () => {
            CUB.enhancedConditions = new CUBEnhancedConditions();
            CUB.rerollInitiative = new CUBRerollInitiative();
            CUB.injuredAndDead = new CUBInjuredAndDead();
            CUB.combatTracker = new CUBCombatTracker();
            CUB.tokenUtility = new CUBTokenUtility();
            CUB.enhancedConditions._toggleSidebarButtonDisplay(CUB.enhancedConditions.settings.enhancedConditions);
            if (CUB.combatTracker.settings.xpModule) {
                Combat.prototype.endCombat = CUBCombatTracker.prototype.endCombat;
            }
        });
    }

    static hookOnRenderSettings() {
        Hooks.on("renderSettings", (app, html) => {
            CUBEnhancedConditions._createSidebarButton(html);
        });
    }

    static hookOnRenderTokenHUD() {
        Hooks.on("renderTokenHUD", (app, html, data) => {
            CUB.enhancedConditions._hookOnRenderTokenHUD(app, html, data);
        });
    }

    static hookOnCreateToken() {
        Hooks.on("createToken", (token, sceneId, update) => {
            CUB.tokenUtility._hookOnCreateToken(token, sceneId, update);
        });
    }

    static hookOnPreUpdateToken() {
        Hooks.on("preUpdateToken", (token, sceneId, update) => {
            CUB.injuredAndDead.callingUser = game.userId;
            CUB.enhancedConditions.callingUser = game.userId;
        });
    }

    static hookOnUpdateToken() {
        Hooks.on("updateToken", (token, sceneId, update) => {
            CUB.enhancedConditions._hookOnUpdateToken(token, sceneId, update);
            CUB.injuredAndDead._hookOnUpdateToken(token, sceneId, update);
        });
    }

    static hookOnUpdateActor() {
        Hooks.on("updateActor", (actor, update) => {
            CUB.injuredAndDead._hookOnUpdateActor(actor, update);
        });
    }

    static hookOnPreUpdateCombat() {
        Hooks.on("preUpdateCombat", (combat, update) => {
            CUB.rerollInitiative.callingUser = game.userId;
            CUB.combatTracker.callingUser = game.userId;
        });
    }

    static hookOnUpdateCombat() {
        Hooks.on("updateCombat", (tracker, update) => {
            CUB.combatTracker._hookOnUpdateCombat(tracker, update);
        });
    }

    static async hookOnUpdateCombatAsync() {
        Hooks.on("updateCombat", async (combat, update) => {
            CUB.rerollInitiative._hookOnUpdateCombat(combat,update);
        });
    }

    static hookOnDeleteCombat() {
        Hooks.on("deleteCombat", (combat, combatId, options, userId) => {
            CUB.combatTracker._hookOnDeleteCombat(combat, combatId, options, userId);
        });
    }

    static hookOnRenderCombatTracker() {
        Hooks.on("renderCombatTracker", (app, html) => {
            CUB.hideNPCNames._hookOnRenderCombatTracker(app, html);
        });
    }

    static hookOnRenderChatMessage() {
        Hooks.on("renderChatMessage", (message, html, data) => {
            CUB.hideNPCNames._hookOnRenderChatMessage(message, html, data);
        });
    }
}

/**
 * Provides helper methods for use elsewhere in the module (and has your back in a melee)
 */
class CUBSidekick {

    /**
     * Validate that an object is actually an object
     * @param {Object} object 
     * @returns {Boolean}
     */
    static validateObject(object) {
        return object instanceof Object ? true : false;
    }

    /**
     * Convert any ES6 Maps/Sets to objects for settings use
     * @param {Map} map 
     */
    static convertMapToArray(map) {
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
        } catch (e) {
            if (e.message == "This is not a registered game setting") {
                this.registerGadgetSetting(key, setting);
                config = this.getGadgetSetting(key);
            } else {
                throw e;
            }
        } finally {
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

        if (key.includes(".")) {
            keyParts = key.split(".");
            settingKey = keyParts[0];
            settingSubkeys = keyParts.slice(1, keyParts.length);
            joinedSubkeys = settingSubkeys.join(".");
            oldSettingValue = this.getGadgetSetting(settingKey);
        } else {
            oldSettingValue = this.getGadgetSetting(key);
        }
        Object.freeze(oldSettingValue);

        let newSettingValue;

        if (typeof oldSettingValue === "object" && (key.includes("."))) {


            //call the duplicate helper function from foundry.js
            let tempSettingObject = duplicate(oldSettingValue);

            let updated = setProperty(tempSettingObject, joinedSubkeys, value);

            if (updated) {
                //console.log(CUBButler.MODULE_NAME, settingKey, tempSettingObject);
                newSettingValue = await game.settings.set(CUBButler.MODULE_NAME, settingKey, tempSettingObject);
            } else {
                throw ("Failed to update nested property of " + key + " check syntax");
            }

        } else if (typeof oldSettingValue === typeof value) {
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

            for (let a in arguments) {
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
    constructor() {
        this.settings = {
            reroll: CUBSidekick.initGadgetSetting(this.GADGET_NAME, this.SETTINGS_META)
        };
        this.callingUser = null;
    }

    get GADGET_NAME() {
        return "reroll-initiative";
    }


    get DEFAULT_CONFIG() {
        return {
            reroll: false
        };
    }

    get SETTINGS_DESCRIPTORS() {
        return {
            RerollN: "--Reroll Initiative--",
            RerollH: "Reroll initiative for each combatant every round"
        };

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
        };

    }

    /*
    resetAndReroll(combat, update) {
        const roundChanged = Boolean(getProperty(update, "round"));
        if (roundChanged) {
            //console.log(combat, update);
            for (let c of combat.turns) {

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
    /*

    /** 
     * Reroll initiative if requirements met
     */
    async _hookOnUpdateCombat(combat, update) {
        const roundUpdate = Boolean(getProperty(update, "round"));

        if (this.callingUser != game.userId || !game.user.isGM || !this.settings.reroll || !roundUpdate) return;
        
        if (update.round >= 1 && update.round > combat.previous.round) {
            await combat.resetAll();
            await combat.rollAll();
        }
        this.callingUser = null;
    }
}

/**
 * Hides NPC names in the combat tracker
 */
class CUBHideNPCNames {
    constructor() {
        this.settings = {
            hideNames: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.HideNamesN + ")", this.SETTINGS_META.hideNames),
            unknownCreatureString: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.UnknownCreatureN + ")", this.SETTINGS_META.unknownCreatureString)
        };
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
        };
    }

    get DEFAULT_CONFIG() {
        return {
            hideNames: false,
            unknownCreatureString: "Unknown Creature"
        };
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
                    if (ui.chat.element.is(":visible")) {
                        ui.chat.render();
                    } else {
                        this._switchTabs();
                    }
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
                    if (this.settings.hideNames) {
                        ui.combat.render();
                        ui.chat.render();
                    }
                }
            }
        };
    }

    /**
     * Hooks on the Combat Tracker render to replace the NPC names
     * @param {Object} app - the Application instance
     * @param {Object} html - jQuery html object
     */
    _hookOnRenderCombatTracker(app, html) {
        //console.log(app,html);
        // if not GM
        if (!game.user.isGM) {
            let combatantListElement = html.find("li");

            //for each combatant
            for (let e of combatantListElement) {
                let token = game.scenes.active.data.tokens.find(t => t._id == e.dataset.tokenId);
                // token = new Token(token);
                let actor = game.actors.entities.find(a => a._id === token.actorId);

                //if not PC, module is enabled
                if (!actor.isPC && this.settings.hideNames) {
                    //find the flexcol elements
                    let tokenNames = e.getElementsByClassName("token-name");
                    let tokenImages = e.getElementsByClassName("token-image");

                    //iterate through the returned elements
                    for (let f of tokenNames) {
                        //find the h4 elements
                        let header = f.getElementsByTagName("H4");
                        //iterate through
                        for (let h of header) {
                            //replace the name
                            h.textContent = this.settings.unknownCreatureString;
                        }
                    }

                    for (let i of tokenImages) {
                        i.setAttribute("title", this.settings.unknownCreatureString);
                    }
                }
            }
        }
    }

    /**
     * Replaces instances of hidden NPC name in chat
     * @todo: If a player owns the message speaker - reveal the message
     */
    _hookOnRenderChatMessage(message, html, data) {
        //killswitch for execution of hook logic
        if (game.user.isGM || !this.settings.hideNames) {
            return;
        }

        const messageActorId = message.data.speaker.actor;
        const messageActor = game.actors.get(messageActorId);
        const speakerIsNPC = messageActor && !messageActor.isPC;

        if (speakerIsNPC) {
            const replacement = this.settings.unknownCreatureString || " ";
            html.find(`:contains('${data.alias}')`).each((i, el) => {
                el.innerHTML = el.innerHTML.replace(new RegExp(data.alias, "g"), replacement);
            });
        }
        //console.log(message,data,html);
    }

    _switchTabs() {
        const currentTab = ui.sidebar.tabs.tabs.find(".active");
        const chatTab = ui.sidebar.tabs.tabs.find(`[data-tab="chat"]`);

        ui.sidebar.tabs.activateTab(chatTab);
        ui.chat.render();
        ui.sidebar.tabs.activateTab(currentTab);
    }
}

/**
 * Builds a mapping between status icons and journal entries that represent conditions
 */
class CUBEnhancedConditions {
    constructor() {
        this.settings = {
            enhancedConditions: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ConditionsN + ")", this.SETTINGS_META.enhancedConditions),
            system: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.SystemN + ")", this.SETTINGS_META.system),
            maps: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.MapsN + ")", this.SETTINGS_META.maps),
            removeDefaultEffects: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.RemoveDefaultEffectsN + ")", this.SETTINGS_META.removeDefaultEffects),
            output: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.OutputChatN + ")", this.SETTINGS_META.outputChat),
            //future features
            //folderType : CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.FolderTypeN + ")", this.SETTINGS_META.folderType),
            //compendium : CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.CompendiumN + ")", this.SETTINGS_META.compendium),
            //createEntries : CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_META.CreateEntriesN + ")", this.SETTINGS_META.createEntries),
        };
        this.coreStatusIcons = this.coreStatusIcons || this._backupCoreStatusIcons();
        this.callingUser = "";
        this._updateStatusIcons();
        this.currentToken = {};
    }

    /**
     * Returns the name of the gadget
     */
    get GADGET_NAME() {
        return "enhanced-conditions";
    }


    get DEFAULT_CONFIG() {
        return {
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
        };
    }

    /**
     * Defines the maps used in the gadget
     * @todo: needs a redesign -- change to arrays of objects?
     */
    get DEFAULT_MAPS() {
        const dnd5eMap = [
            //Condition - Icon - JournalEntry
            ["Blinded", this.DEFAULT_CONFIG.iconPath + "blinded.svg", ""],
            ["Charmed", this.DEFAULT_CONFIG.iconPath + "charmed.svg", ""],
            ["Deafened", this.DEFAULT_CONFIG.iconPath + "deafened.svg", ""],
            ["Exhaustion 1", this.DEFAULT_CONFIG.iconPath + "exhaustion1.svg", ""],
            ["Exhaustion 2", this.DEFAULT_CONFIG.iconPath + "exhaustion2.svg", ""],
            ["Exhaustion 3", this.DEFAULT_CONFIG.iconPath + "exhaustion3.svg", ""],
            ["Exhaustion 4", this.DEFAULT_CONFIG.iconPath + "exhaustion4.svg", ""],
            ["Exhaustion 5", this.DEFAULT_CONFIG.iconPath + "exhaustion5.svg", ""],
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

        const pf2eMap = [
            //Condition - Icon - JournalEntry
            ["Sickened", "systems/pf2e/icons/skills/affliction_13.jpg", ""],
            ["Petrified", "systems/pf2e/icons/skills/affliction_09.jpg", ""],
            ["Stupefied", "systems/pf2e/icons/skills/violet_03.jpg", ""],
            ["Flat-Footed", "systems/pf2e/icons/skills/weapon_17.jpg", ""],
            ["Fascinated", "systems/pf2e/icons/skills/violet_17.jpg", ""],
            ["Enfeebled", "systems/pf2e/icons/skills/violet_28.jpg", ""],
            ["Encumbered", "systems/pf2e/icons/skills/gray_05.jpg", ""],
            ["Quickened", "systems/pf2e/icons/skills/blue_35.jpg", ""],
            ["Concealed", "systems/pf2e/icons/skills/shadow_14.jpg", ""],
            ["Fatigued", "systems/pf2e/icons/skills/red_33.jpg", ""],
            ["Immobilized", "systems/pf2e/icons/skills/green_16.jpg", ""],
            ["Blinded", "systems/pf2e/icons/skills/light_03.jpg", ""],
            ["Frightened", "systems/pf2e/icons/skills/shadow_01.jpg", ""],
            ["Clumsy", "systems/pf2e/icons/skills/light_05.jpg", ""],
            ["Fleeing", "systems/pf2e/icons/skills/beast_01.jpg", ""],
            ["Invisible", "systems/pf2e/icons/skills/water_07.jpg", ""],
            ["Observed", "systems/pf2e/icons/skills/light_02.jpg", ""],
            ["Undetected", "systems/pf2e/icons/skills/emerald_07.jpg", ""],
            ["Prone", "systems/pf2e/icons/skills/yellow_19.jpg", ""],
            ["Unnoticed", "systems/pf2e/icons/skills/green_18.jpg", ""],
            ["Slowed", "systems/pf2e/icons/skills/blue_04.jpg", ""],
            ["Wounded", "systems/pf2e/icons/skills/blood_04.jpg", ""],
            ["Dazzled", "systems/pf2e/icons/skills/shadow_12.jpg", ""],
            ["Stunned", "systems/pf2e/icons/skills/affliction_02.jpg", ""],
            ["Dying", "systems/pf2e/icons/skills/yellow_32.jpg", ""],
            ["Doomed", "systems/pf2e/icons/skills/blood_12.jpg", ""],
            ["Controlled", "systems/pf2e/icons/skills/red_05.jpg", ""],
            ["Hidden", "systems/pf2e/icons/skills/shadow_17.jpg", ""],
            ["Unconscious", "systems/pf2e/icons/skills/light_01.jpg", ""],
            ["Persistent Damage", "systems/pf2e/icons/skills/blood_03.jpg", ""],
            ["Paralyzed", "systems/pf2e/icons/skills/ice_03.jpg", ""],
            ["Broken", "systems/pf2e/icons/skills/red_16.jpg", ""],
            ["Drained", "systems/pf2e/icons/skills/affliction_01.jpg", ""],
            ["Deafened", "systems/pf2e/icons/skills/red_10.jpg", ""],
            ["Restrained", "systems/pf2e/icons/skills/red_06.jpg", ""],
            ["Grabbed", "systems/pf2e/icons/skills/yellow_08.jpg", ""],
            ["Confused", "systems/pf2e/icons/skills/red_01.jpg", ""]
        ];

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
        };
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
        };
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
                    this._updateStatusIcons();
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
                config: false,
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
        };
    }

    /**
     * Gets the default game system names stored in the constants butler class
     */
    get systemChoices() {
        const systemIds = Object.getOwnPropertyNames(CUBButler.DEFAULT_GAME_SYSTEMS);
        let result = {};

        for (let i of systemIds) {
            result[i] = CUBButler.DEFAULT_GAME_SYSTEMS[i].name;
        }
        return result;
    }

    /**
     * Retrieve the statusEffect icons from the Foundry CONFIG
     */
    _backupCoreStatusIcons() {
        CONFIG.defaultStatusEffects = CONFIG.defaultStatusEffects || duplicate(CONFIG.statusEffects);
        if (!Object.isFrozen(CONFIG.defaultStatusEffects)) {
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
            entry = await JournalEntry.create({
                name: condition,
                permission: {
                    default: ENTITY_PERMISSIONS.LIMITED
                }
            }, {
                displaySheet: false
            });
        } catch (e) {
            //console.log(e);
        } finally {
            return await entry;
        }

    }

    /**
     * Updates the core CONFIG.statusEffects with the new icons
     */
    _updateStatusIcons(conditionMap) {
        const map = conditionMap || this.settings.maps[this.settings.system];
        let entries;

        //save the original icons
        if (!this.coreStatusIcons) {
            this.coreStatusIcons = this._backupCoreStatusIcons();
        }
        /*
        if(!CONFIG.defaultStatusEffects) {
            CONFIG.defaultStatusEffects = duplicate(CONFIG.statusEffects);
            Object.freeze(CONFIG.defaultStatusEffects);
        }
       */

        //console.log(this.settings.maps);
        //killswitch for further execution of the function
        if (this.settings.enhancedConditions) {
            if (this.settings.removeDefaultEffects) {
                CONFIG.statusEffects = this.settings.maps[this.settings.system] ? this.icons : [];
            } else {
                if (map instanceof Map) {
                    entries = map.entries();
                    for (let [k, v] of entries) {
                        CONFIG.statusEffects.push(v);
                        //console.log(k,v);
                    }
                } else if (map instanceof Array) {
                    //add the icons from the condition map to the status effects array
                    CONFIG.statusEffects = this.coreStatusIcons.concat(this.icons);
                } else {
                    entries = [];
                }
            }
        } else {
            CONFIG.statusEffects = this.coreStatusIcons;
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
        for (let [k, v] of this.map) {
            newMap.set(v, k);
        }
        return newMap;
    }

    /**
     * Returns just the icon side of the map
     */
    get icons() {
        if (this.map instanceof Map) {
            return Array.from((this.settings.maps[this.settings.system]).values());
        } else if (this.map instanceof Array && this.map[0] instanceof Array) {
            let iconArray = [];
            this.map.forEach((value, index, array) => {
                iconArray.push(value[1]);
            });

            return iconArray;
        } else if (this.map instanceof Array) {
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

        if (game.user.isGM && display && sidebarButton) {
            sidebarButton.style.display = "block";
        } else if (sidebarButton && (!game.user.isGM || !display)) {
            sidebarButton.style.display = "none";
        }
    }

    get system() {
        return this.settings.system;
    }

    /**
     * Hooks on token updates. If the update includes effects, calls the journal entry lookup
     */
    _hookOnUpdateToken(token, sceneId, update) {
        if (!this.settings.enhancedConditions || game.userId != this.callingUser) {
            return;
        }
        //console.log(token,sceneId,update);
        let effects = update.effects;

        //If the update has effects in it, lookup mapping and set the current token
        if (effects) {
            this.currentToken = token;
            this.callingUser = "";
            return this.lookupEntryMapping(effects);
        }
    }

    /**
     * Adds a title/tooltip with the matched Condition name
     */
    _hookOnRenderTokenHUD(app, html, data) {
        const conditionIcons = this.icons;
        let statusIcons = html.find("img.effect-control");

        //console.log(app,html);
        //killswitch for further execution of function
        if (this.settings.enhancedConditions) {
            for (let i of statusIcons) {
                const src = i.attributes.src.value;

                if (conditionIcons.includes(src)) {
                    i.setAttribute("title", this.inverseMap.get(src));
                }
            }
        }
    }

    /**
     * Checks statusEffect icons against mapping and returns matching journal entries
     * @param {Array} icons 
     */
    async lookupEntryMapping(icons) {
        let map;
        let mapEntries = [];
        let conditionEntries = [];

        if (this.map instanceof Map) {
            map = this.map.entries();
        } else if (this.map instanceof Array) {
            map = this.map;
        } else {
            throw "condition map is not iterable";
        }
        //iterate through incoming icons and check the conditionMap for the corresponding entry
        for (let i of icons) {
            let entry;
            try {
                for (let [mc, mi, me] of map) {
                    if (mi == i) {
                        if (me.length > 1) {
                            entry = me;
                        } else {
                            entry = mc;
                        }
                    }
                }
            } catch (e) {
                //console.log(e);
            } finally {
                if (entry) {
                    mapEntries.push(entry);
                }
            }
        }

        for (let e of mapEntries) {
            if (e) {
                let entry = await game.journal.entities.find(j => j.id == e);
                if (entry) {
                    conditionEntries.push(entry);
                } else {
                    conditionEntries.push(e);
                }
            }
        }

        //console.log(conditionEntries);
        if (this.settings.output && conditionEntries.length > 0) {
            return this.outputChatMessage(conditionEntries);
        } else {
            return;
        }
    }

    /**
     * Output condition entries to chat
     */
    async outputChatMessage(entries) {
        const chatUser = game.userId;
        const token = this.currentToken;
        //const actor = await this.lookupTokenActor(token.actor.id);
        const chatType = CONST.CHAT_MESSAGE_TYPES.OTHER;
        let tokenSpeaker = {};
        let chatContent;
        let chatConditions = [];
        let journalLink;

        //console.log("current token",token);
        //console.log("current actor",actor);
        //console.log("token id",this.tokenData.id);

        //if (actor) {
        //console.log("Speaker is an actor:",actor);
        //    tokenSpeaker = ChatMessage.getSpeaker({
        //        "actor": actor
        //    });
        //} else {
        //console.log("Speaker is a token:",token);
        tokenSpeaker = ChatMessage.getSpeaker({
            "token": token
        });
        //}

        //create some boiler text for prepending to the conditions array
        if (entries.length > 0) {
            chatContent = tokenSpeaker.alias + " is:";
        }

        //iterate through the journal entries and output to chat
        for (let e of entries) {
            if (e instanceof Object) {
                journalLink = "@JournalEntry[" + e.name + "]";
            } else {
                journalLink = e;
            }

            //let journalLink = e.name;
            //need to figure out best way to break out entries -- newline is being turned into space
            chatConditions.push("\n" + journalLink);
        }

        //add the conditions to the boiler text
        if (chatConditions.length > 0) {
            chatContent += chatConditions;

            await ChatMessage.create({
                speaker: tokenSpeaker,
                content: chatContent,
                type: chatType,
                user: chatUser
            });
        }
    }

    /**
     * looks up the corresponding actor entity for the token
     * @param {String} id 
     * @returns {Actor} actor
     */
    async lookupTokenActor(id) {
        let actor = {};
        if (id) {
            actor = await game.actors.entities.find(a => a._id === id);
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

/**
 * Form application for managing mapping of Conditions to Icons and JournalEntries
 */
class CUBEnhancedConditionsConfig extends FormApplication {
    constructor() {
        super();
        this.data = CUB.enhancedConditions;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "cub-condition-lab",
            title: "Condition Lab",
            template: "modules/combat-utility-belt/templates/cub-conditions.html",
            classes: ["sheet"],
            width: 500,
            height: "auto",
            resizable: true
        });
    }

    getData() {
        let entries = {};

        for (let e of game.journal.entities) {
            entries[e.id] = e.name;
        }

        const formData = {
            conditionmap: this.data.map,
            systems: this.data.systemChoices,
            system: this.data.system,
            entries: entries
        };

        return formData;
    }

    /**
     * Take the new map and write it back to settings, overwriting existing
     * @param {Object} event 
     * @param {Object} formdata 
     */
    _updateObject(event, formdata) {
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
        const conditionRegex = new RegExp("condition", "i");
        const iconRegex = new RegExp("icon", "i");
        const journalRegex = new RegExp("journal", "i");


        //write it back to the relevant condition map
        //@todo: maybe switch to a switch
        for (let e in formdata) {
            if (e.match(conditionRegex)) {
                conditions.push(formdata[e]);
            } else if (e.match(iconRegex)) {
                icons.push(formdata[e]);
            } else if (e.match(journalRegex)) {
                entries.push(formdata[e]);
            }
        }

        for (let i = 0; i <= conditions.length - 1; i++) {
            newMap.push([conditions[i], icons[i], entries[i]]);
        }

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
            if (!this.data.settings.maps[newSystem]) {
                const newMap = [];

                await CUBSidekick.setGadgetSetting(this.data.GADGET_NAME + "(" + this.data.SETTINGS_DESCRIPTORS.MapsN + ")" + "." + newSystem, newMap);
            }

            //rerender the form to get the correct condition mapping template
            this.render(true);
        });

        addRowButton.click(async ev => {
            ev.preventDefault();
            CUB.enhancedConditions.settings.maps[this.data.system].push(["", ""]);
            this.render(true);
        });

        removeRowButton.click(async ev => {
            //console.log(ev);
            const splitName = ev.currentTarget.name.split("-");
            const row = splitName[splitName.length - 1];

            //console.log("row", row);
            ev.preventDefault();
            CUB.enhancedConditions.settings.maps[this.data.system].splice(row, 1);
            this.render(true);
        });

        iconPath.change(async ev => {
            ev.preventDefault();
            //console.log("change", ev, this);
            const splitName = ev.target.name.split("-");
            const row = splitName[splitName.length - 1];

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

/**
 * Mark a token injured or dead based on threshold
 */
class CUBInjuredAndDead {

    constructor() {
        this.settings = {
            injured: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.InjuredN + ")", this.SETTINGS_META.injured),
            healthAttribute: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.HealthAttributeN + ")", this.SETTINGS_META.healthAttribute),
            threshold: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ThresholdN + ")", this.SETTINGS_META.threshold),
            injuredIcon: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.InjuredIconN + ")", this.SETTINGS_META.injuredIcon),
            dead: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.DeadN + ")", this.SETTINGS_META.dead),
            deadIcon: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.DeadIconN + ")", this.SETTINGS_META.deadIcon),
            combatTrackDead: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.CombatTrackDeadN + ")", this.SETTINGS_META.combatTrackDead)
        };
        this.callingUser = "";
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
            ThresholdH: "Enter the percentage of health remaining when a token should be marked injured",
            DeadN: "--Mark Dead Tokens--",
            DeadH: "Sets a status marker on tokens that reach 0 health",
            CombatTrackDeadN: "Mark Dead in Combat Tracker",
            CombatTrackDeadH: "Sets the token that reaches 0 health to dead status in the combat tracker. This will also mark tokens dead regardless of mark dead settings.",
            DeadIconN: "Dead Status Marker",
            DeadIconH: "Path to the status marker to display for Dead Tokens",
            HealthAttributeN: "Health Attribute",
            HealthAttributeH: "Health/HP attribute name as defined by game system"
        };
    }

    get DEFAULT_CONFIG() {
        return {
            injured: false,
            injuredIcon: "icons/svg/blood.svg",
            threshold: 50,
            dead: false,
            deadIcon: "icons/svg/skull.svg",
            combatTrackDead: false
        };
    }

    get SETTINGS_META() {
        return {
            injured: {
                name: this.SETTINGS_DESCRIPTORS.InjuredN,
                hint: this.SETTINGS_DESCRIPTORS.InjuredH,
                default: this.DEFAULT_CONFIG.injured,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.injured = s;
                }

            },
            injuredIcon: {
                name: this.SETTINGS_DESCRIPTORS.InjuredIconN,
                hint: this.SETTINGS_DESCRIPTORS.InjuredIconH,
                default: this.DEFAULT_CONFIG.injuredIcon,
                scope: "world",
                type: String,
                config: true,
                onChange: s => {
                    this.settings.injuredIcon = s;
                }

            },
            threshold: {
                name: this.SETTINGS_DESCRIPTORS.ThresholdN,
                hint: this.SETTINGS_DESCRIPTORS.ThresholdH,
                default: this.DEFAULT_CONFIG.threshold,
                scope: "world",
                type: Number,
                config: true,
                onChange: s => {
                    this.settings.threshold = s;
                }
            },
            dead: {
                name: this.SETTINGS_DESCRIPTORS.DeadN,
                hint: this.SETTINGS_DESCRIPTORS.DeadH,
                default: this.DEFAULT_CONFIG.dead,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.dead = s;
                }
            },
            deadIcon: {
                name: this.SETTINGS_DESCRIPTORS.DeadIconN,
                hint: this.SETTINGS_DESCRIPTORS.DeadIconH,
                default: this.DEFAULT_CONFIG.deadIcon,
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
            },
            combatTrackDead: {
                name: this.SETTINGS_DESCRIPTORS.CombatTrackDeadN,
                hint: this.SETTINGS_DESCRIPTORS.CombatTrackDeadH,
                default: this.DEFAULT_CONFIG.combatTrackDead,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.combatTrackDead = s;
                }
            }
        };

    }

    /**
     * Checks the health state of a token using the update supplied from a Hook
     * @param {Object} token 
     * @param {Object} update 
     */
    _checkTokenHealthState(token, update) {
        const currentHealth = getProperty(token, "actor.data.data." + this.settings.healthAttribute + ".value");
        const updateHealth = getProperty(update, "actorData.data." + this.settings.healthAttribute + ".value");
        const maxHealth = getProperty(token, "actor.data.data." + this.settings.healthAttribute + ".max");

        if (this._checkForDead(currentHealth)) {
            return CUBButler.HEALTH_STATES.DEAD;
        } else if (this._checkForInjured(currentHealth, maxHealth)) {
            return CUBButler.HEALTH_STATES.INJURED;
        }
    }

    /**
     * Checks the health state of an actor using the update supplied from a Hook
     * @param {Object} actor 
     * @param {Object} update 
     */
    _checkActorHealthState(actor, update) {
        const currentHealth = getProperty(actor, "data.data." + this.settings.healthAttribute + ".value");
        const updateHealth = getProperty(update, "data." + this.settings.healthAttribute + ".value");
        const maxHealth = getProperty(actor, "data.data." + this.settings.healthAttribute + ".max");

        if (this._checkForDead(currentHealth)) {
            return CUBButler.HEALTH_STATES.DEAD;
        } else if (this._checkForInjured(currentHealth, maxHealth)) {
            return CUBButler.HEALTH_STATES.INJURED;
        }
    }

    /**
     * Checks if the given value is 0
     * @param {Number} value 
     */
    _checkForDead(value) {
        return value === 0 ? true : false;
    }

    /**
     * Checks if the given value is below the threshold
     * @param {Number} value 
     * @param {Number} max 
     */
    _checkForInjured(value, max) {
        if (value < max * (this.settings.threshold / 100)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Removes injury and dead effects/overlay on a token
     * @param {Object} token 
     */
    _markHealthy(token) {
        const tokenEffects = getProperty(token, "data.effects");
        const tokenOverlay = getProperty(token, "data.overlayEffect");
        const hasOverlay = getProperty(token, "data.overlayEffect") != null;
        const hasEffects = getProperty(token, "data.effects.length") > 0;
        const wasInjured = Boolean(tokenEffects && tokenEffects.find(e => e == this.settings.injuredIcon)) || false;
        const wasDead = Boolean(tokenOverlay == this.settings.deadIcon);

        if (hasEffects && wasInjured) {
            token.toggleEffect(this.settings.injuredIcon);
        }

        if (hasOverlay && wasDead) {
            token.toggleOverlay(this.settings.deadIcon);
        }
    }

    /**
     * Sets an injured effect on a token, removes dead overlay
     * @param {Object} token 
     */
    _markInjured(token) {
        const tokenEffects = getProperty(token, "data.effects");
        const tokenOverlay = getProperty(token, "data.overlayEffect");
        const hasOverlay = getProperty(token, "data.overlayEffect") != null;
        const hasEffects = getProperty(token, "data.effects.length") > 0;
        const isInjured = Boolean(tokenEffects.find(e => e == this.settings.injuredIcon)) || false;
        const wasDead = Boolean(tokenOverlay == this.settings.deadIcon);

        if (!isInjured) {
            token.toggleEffect(this.settings.injuredIcon);
        }

        if (wasDead) {
            token.toggleOverlay(this.settings.deadIcon);
        }
    }

    /**
     * Set a dead overlay on a token, removes all effects
     * @param {Object} token 
     */
    _markDead(token) {
        const tokenEffects = getProperty(token, "data.effects");
        const hasEffects = getProperty(token, "data.effects.length") > 0;
        const tokenOverlay = getProperty(token, "data.overlayEffect");
        const isDead = (tokenOverlay == this.settings.deadIcon) ? true : false;

        if (hasEffects) {
            token.update(token.scene.id, {
                "effects": []
            });
        }

        if (!isDead) {
            token.toggleOverlay(this.settings.deadIcon);
        }
    }

    /**
     * Toggles the combat tracker death status based on token hp
     * @param {Object} token 
     */
    _toggleTrackerDead(token) {
        if (!token.scene.active) {
            return;
        }

        const combat = game.combat;
        if (combat) {
            let combatant = combat.turns.find(t => t.tokenId == token.id);
            let tokenHp = getProperty(token, "actor.data.data.attributes.hp.value");
            if (combatant) {
                combat.updateCombatant({
                    _id: combatant._id,
                    defeated: (tokenHp == 0)
                });
            }
        }
    }

    /**
     * Hook on the token update,
     * check the health state of the token,
     * then mark it appropriately
     * @param {Object} token
     * @param {String} sceneId
     * @param {Object} update
     */
    _hookOnUpdateToken(scene, sceneID, update, tokenData, otherID) {
        //const token = scene.getEmbeddedEntity("Token", update._id);
        let token = game.scenes.active.data.tokens.find(t => t._id === update._id);
        token = new Token(token); token.scene = scene;

        const healthUpdate = getProperty(update, "actorData.data." + this.settings.healthAttribute + ".value");
        if (game.userId != this.callingUser || healthUpdate == undefined || token.actorLink) {
            return false;
        }

        let tokenHealthState;

        if (this.settings.injured || this.settings.dead || this.settings.combatTrackDead) {
            tokenHealthState = this._checkTokenHealthState(token, update);

            if (tokenHealthState == CUBButler.HEALTH_STATES.DEAD && (this.settings.dead || this.settings.combatTrackDead)) {
                this._markDead(token);
                if (this.settings.combatTrackDead) {
                    this._toggleTrackerDead(token);
                }
            } else if (tokenHealthState == CUBButler.HEALTH_STATES.INJURED && this.settings.injured) {
                this._markInjured(token);
                if (this.settings.combatTrackDead) {
                    this._toggleTrackerDead(token);
                }
            } else {
                this._markHealthy(token);
                if (this.settings.combatTrackDead) {
                    this._toggleTrackerDead(token);
                }
            }
        }
        this.callingUser = "";
        return false;
    }

    /**
     * Hook on the actor update,
     * check the health state of the actor,
     * then mark the active token appropriately
     * @param {Object} token
     * @param {String} sceneId
     * @param {Object} update
     */
    _hookOnUpdateActor(actor, update) {
        const healthUpdate = getProperty(update, "data." + this.settings.healthAttribute + ".value");
        const activeToken = canvas.tokens.ownedTokens.find(t => t.actor._id == actor.id);

        if (healthUpdate == undefined || (!this.settings.dead && !this.settings.injured) || activeToken == undefined) {
            return;
        }

        const healthState = this._checkActorHealthState(actor, update);

        if (activeToken == undefined) {
            return;
        }
        switch (healthState) {
            case CUBButler.HEALTH_STATES.DEAD:
                this._markDead(activeToken);
                if (this.settings.combatTrackDead) {
                    this._toggleTrackerDead(activeToken);
                }
                break;
            case CUBButler.HEALTH_STATES.INJURED:
                this._markInjured(activeToken);
                if (this.settings.combatTrackDead) {
                    this._toggleTrackerDead(activeToken);
                }
                break;
            default:
                this._markHealthy(activeToken);
                if (this.settings.combatTrackDead) {
                    this._toggleTrackerDead(activeToken);
                }
                break;
        }
    }
}

class CUBCombatTracker {
    constructor() {
        this.settings = {
            panOnNextTurn: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.PanOnNextTurnN + ")", this.SETTINGS_META.panOnNextTurn),
            panGMOnly: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.PanGMOnlyN + ")", this.SETTINGS_META.panGMOnly),
            panPlayers: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.PanPlayersN + ")", this.SETTINGS_META.panPlayers),
            selectOnNextTurn: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.SelectOnNextTurnN + ")", this.SETTINGS_META.selectOnNextTurn),
            selectGMOnly: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.SelectGMOnlyN + ")", this.SETTINGS_META.selectGMOnly),
            xpModule: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.XPModuleN + ")", this.SETTINGS_META.xpModule)
        };

        this.callingUser = "";
        this.addExperience;
    }

    get GADGET_NAME() {
        return "combat-tracker";
    }

    get SETTINGS_DESCRIPTORS() {
        return {
            PanOnNextTurnN: "--Pan to token--",
            PanOnNextTurnH: "Pan the canvas to the token whose turn it is in the combat tracker",
            PanGMOnlyN: "Pan for GM Only",
            PanGMOnlyH: "Only pan to token for the GM.",
            PanPlayersN: "Pan owned only",
            PanPlayersH: "Pan players to their owned tokens only",
            SelectOnNextTurnN: "--Select Token--",
            SelectOnNextTurnH: "Select the token whose turn it is in the combat tracker.",
            SelectGMOnlyN: "Select for GM Only",
            SelectGMOnlyH: "Only select token for the GM. If enabled for players, it will still only auto select owned tokens",
            XPModuleN: "--Enable XP Module--",
            XPModuleH: "REQUIRES REFRESH! Adds an option at the end of combat to automatically distribute xp from the combat to the players"
        };
    }

    get DEFAULT_CONFIG() {
        return {
            panOnNextTurn: false,
            selectOnNextTurn: false,
            panGMOnly: false,
            panPlayers: false,
            selectGMOnly: false,
            xpModule: false
        };
    }

    get SETTINGS_META() {
        return {
            panOnNextTurn: {
                name: this.SETTINGS_DESCRIPTORS.PanOnNextTurnN,
                hint: this.SETTINGS_DESCRIPTORS.PanOnNextTurnH,
                default: this.DEFAULT_CONFIG.panOnNextTurn,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.panOnNextTurn = s;
                }
            },
            panGMOnly: {
                name: this.SETTINGS_DESCRIPTORS.PanGMOnlyN,
                hint: this.SETTINGS_DESCRIPTORS.PanGMOnlyH,
                default: this.DEFAULT_CONFIG.panOnGMOnly,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.panOnGMOnly = s;
                }
            },
            panPlayers: {
                name: this.SETTINGS_DESCRIPTORS.PanPlayersN,
                hint: this.SETTINGS_DESCRIPTORS.PanPlayersH,
                default: this.DEFAULT_CONFIG.panPlayers,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.panPlayers = s;
                }
            },
            selectOnNextTurn: {
                name: this.SETTINGS_DESCRIPTORS.SelectOnNextTurnN,
                hint: this.SETTINGS_DESCRIPTORS.SelectOnNextTurnH,
                default: this.DEFAULT_CONFIG.selectOnNextTurn,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.selectOnNextTurn = s;
                }
            },
            selectGMOnly: {
                name: this.SETTINGS_DESCRIPTORS.SelectGMOnlyN,
                hint: this.SETTINGS_DESCRIPTORS.SelectGMOnlyH,
                default: this.DEFAULT_CONFIG.selectGMOnly,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.selectGMOnly = s;
                }
            },
            xpModule: {
                name: this.SETTINGS_DESCRIPTORS.XPModuleN,
                hint: this.SETTINGS_DESCRIPTORS.XPModuleH,
                default: this.DEFAULT_CONFIG.xpModule,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.xpModule = s;
                }
            }
        };
    }

    /**
     * Pans to the current token in the turn tracker
     * @param {Object} combat
     * @param {Object} update 
     */
    _panToToken(combat, update) {
        // seem to be difference params depending on who originated.
        if ((game.user.isGM && this.settings.panGMOnly) || !this.settings.panGMOnly) {
            let tracker = combat.entities ? combat.entities.find(tr=>tr._id===update._id) : combat;
            let token;
            if (hasProperty(update, "turn")) {
                token = tracker.turns[update.turn].token;
            } else {
                token = tracker.turns[0].token;
            }
            let actor = game.actors.get(token.actorId);
            if (game.user.isGM || actor.data.permission[game.userId] === 3) {
                let xCoord = token.x;
                let yCoord = token.y;
                canvas.animatePan({
                    x: xCoord,
                    y: yCoord
                });
            }
        }
    }

    /**
     * Selects the current token in the turn tracker
     * @param {Object} combat 
     * @param {Object} update 
     */
    _selectToken(combat, update) {
        if ((game.user.isGM && this.settings.selectGMOnly) || !this.settings.selectGMOnly) {
            let token;
            let tracker = combat.entities ? combat.entities.find(tr=>tr._id===update._id) : combat;
            if (hasProperty(update, "turn")) {
                token = tracker.turns[update.turn].token;
            } else {
                token = tracker.turns[0].token;
            }
            const canvasToken = canvas.tokens.get(token._id);
            if ((hasProperty(canvasToken.actor.data.permission, game.userId) && canvasToken.actor.data.permission[game.userId] > 1) || game.user.isGM) {
                canvasToken.control();
            }
        }
    }

    /**
     * Gives XP to the living PCs in the turn tracker based on enemies killed
     * @param {Object} combat -- the combat instance being deleted
     */
    _giveXP(combat) {
        const defeatedEnemies = combat.turns.filter(object => (!object.actor.isPC && object.defeated && object.token.disposition === -1));
        const players = combat.turns.filter(object => (object.actor.isPC && !object.defeated));
        let experience = 0;
        if (defeatedEnemies.length > 0 && this.addExperience) {
            defeatedEnemies.forEach(enemy => {
                experience += enemy.actor.data.data.details.xp.value;
            });
            if (players.length > 0) {
                const dividedExperience = Math.floor(experience / players.length);
                let experienceMessage = "<b>Experience Awarded!</b><p><b>" + dividedExperience + "</b> added to:</br>";
                players.forEach(player => {
                    const actor = game.actors.entities.find(actor => actor.i_d === player.actor.data._id);
                    actor.update({
                        "data.details.xp.value": player.actor.data.data.details.xp.value + dividedExperience
                    });
                    experienceMessage += player.actor.data.name + "</br>";
                });
                experienceMessage += "</p>";
                ChatMessage.create({
                    user: game.user._id,
                    speaker: {
                        actor: this.actor
                    },
                    content: experienceMessage
                });
            }
        }
    }

    /**
     * Hook on the combat update,
     * Pans or selects the current token
     */
    _hookOnUpdateCombat(combat, update) {
        let tracker = combat.entities ? combat.entities.find(tr=>tr._id===update._id) : combat;
        if (!game.combat || game.combat.turns.length === 0) {
            return;
        }
        if (this.settings.panOnNextTurn) {
            this._panToToken(tracker, update);
        }
        if (this.settings.selectOnNextTurn) {
            this._selectToken(tracker, update);
        }
    }

    /**
     * Hook on post combat delete
     * Gives players in the combat tracker xp for the combat
     */
    _hookOnDeleteCombat(combat, combatId, options, userId) {
        if (this.settings.xpModule && game.userId == userId) {
            this._giveXP(combat);
        }
    }

    /**
     * Replace Foundry's encCombat with our own
     */
    async endCombat() {
        return new Promise((resolve, reject) => {
            if (!game.user.isGM) {
                reject("You cannot end an active combat");
            }
            new Dialog({
                title: "End Combat?",
                content: "<p>End this combat encounter and empty the turn tracker?</p>",
                buttons: {
                    yes: {
                        icon: `<i class="fas fa-check"></i>`,
                        label: "End Combat",
                        callback: () => {
                            CUB.combatTracker.addExperience = false;
                            this.delete().then(resolve);
                        }
                    },
                    xp: {
                        icon: `<i class="fas fa-check"></i>`,
                        label: "End with XP",
                        callback: () => {
                            CUB.combatTracker.addExperience = true;
                            this.delete().then(resolve);
                        }
                    },
                    no: {
                        icon: `<i class="fas fa-times"></i>`,
                        label: "Cancel"
                    }
                },
                default: "yes"
            }).render(true);
        });
    }
}

class CUBTokenUtility {
    constructor() {
        this.settings = {
            mightySummoner: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.MightySummonerN + ")", this.SETTINGS_META.mightySummoner),
            autoRollHostileHp: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.AutoRollHostileHpN + ")", this.SETTINGS_META.autoRollHostileHp)
        };
    }

    get GADGET_NAME() {
        return "token-utility";
    }

    get SETTINGS_DESCRIPTORS() {
        return {
            MightySummonerN: "--Mighty Summoner--",
            MightySummonerH: "Automatically check to see if token owner of NEUTRAL actor also owns an actor with the Mighty Summoner feat. Automatically calculates and adds new HP formula and rolls HP for token on canvas drop",
            AutoRollHostileHpN: "--Auto Roll Hostile--",
            AutoRollHostileHpH: "Automatically roll hp for hostile tokens on canvas drop"
        };
    }

    get DEFAULT_CONFIG() {
        return {
            mightySummoner: false,
            AutoRollHostileHp: false
        };
    }

    get SETTINGS_META() {
        return {
            mightySummoner: {
                name: this.SETTINGS_DESCRIPTORS.MightySummonerN,
                hint: this.SETTINGS_DESCRIPTORS.MightySummonerH,
                default: this.DEFAULT_CONFIG.mightySummoner,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.mightySummoner = s;
                }
            },
            autoRollHostileHp: {
                name: this.SETTINGS_DESCRIPTORS.AutoRollHostileHpN,
                hint: this.SETTINGS_DESCRIPTORS.AutoRollHostileHpH,
                default: this.DEFAULT_CONFIG.autoRollHostileHp,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.autoRollHostileHp = s;
                }
            }
        };
    }

    _summonerFeats(token, sceneId, update) {
        if (!this._actorHasFeat(token.actor)) {
            console.log("Summoner feats "); console.log(token)
            const owners = Object.keys(token.actor.data.permission).filter(item => item != "default").filter(user => token.actor.data.permission[user] === 3);
            let actors;
            owners.forEach(owner => {
                const owned = game.actors.entities.filter(actor => hasProperty(actor, "data.permission." + owner));
                if (actors === undefined) {
                    actors = owned;
                } else {
                    actors.push(owned);
                }
            });
            let summoners;
            if (actors !== undefined) {
                summoners = actors.find(actor => this._actorHasFeat(actor));
            }
            if (summoners !== undefined && game.user.isGM) {
                new Dialog({
                    title: "Feat Summoning",
                    content: "<p>Mighty Summoner found. Is this monster being summoned?</p>",
                    buttons: {
                        yes: {
                            icon: `<i class="fas fa-check"></i>`,
                            label: "Yes",
                            callback: () => {
                                let formula = token.actor.data.data.attributes.hp.formula;
                                const match = formula.match(/\d+/)[0];
                                if (match !== undefined) {
                                    let actor = token.actor;
                                    formula += " + " + (match * 2);
                                    actor.data.data.attributes.hp.formula = formula;
                                    update.actorData = {
                                        data: {
                                            attributes: {
                                                hp: {
                                                    formula: formula,
                                                }
                                            }
                                        }
                                    };
                                    this._rerollTokenHp(token, sceneId);
                                }
                            }
                        },
                        no: {
                            icon: `<i class="fas fa-times"></i>`,
                            label: "No"
                        }
                    },
                    default: "yes"
                }).render(true);
            }
        }
    }

    _actorHasFeat(actor) {
        if (hasProperty(actor, "data.items")) {
            return (actor.data.items.find(item => (item.type === "feat" && item.name.includes("Mighty Summoner"))) !== undefined);
        }
    }

    _rerollTokenHp(token, sceneId) {
        const formula = token.actor.data.data.attributes.hp.formula;
        let r = new Roll(formula);
        r.roll();
        const hp = r.total;
        const update = {
            actorData: {
                data: {
                    attributes: {
                        hp: {
                            value: hp,
                            max: hp
                        }
                    }
                }
            }
        };
        canvas.tokens.get(token.data._id).update(sceneId, update);
    }

    /**
     * Hook on token create
     * @param {Object} token 
     * @param {String} sceneId 
     * @param {Object} update 
     * @todo move this to a preCreate hook to avoid a duplicate call to the db
     */
    _hookOnCreateToken(scene, sceneId, tokenData, collection, update) {
        let token = new Token(tokenData); token.scene = scene;
        if (token.data.disposition === -1 && this.settings.autoRollHostileHp && !token.actor.isPC) {
            this._rerollTokenHp(token, sceneId);
        } else if (this.settings.mightySummoner) {
            this._summonerFeats(token, sceneId, update);
        }
    }
}

/**
 * Start the module
 */
CUBSignal.lightUp();
