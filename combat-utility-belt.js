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
            DEAD: "dead",
            UNCONSCIOUS: "unconscious"
        };
    }
}

/**
 * Initiates module classes (and shines a light on the dark night sky)
 */
class CUBSignal {
    static lightUp() {
        CUBSignal.hookOnInit();
        CUBSignal.hookOnCanvasInit();
        CUBSignal.hookOnReady();
        CUBSignal.hookOnRenderSettings();
        CUBSignal.hookOnRenderTokenHUD();
        CUBSignal.hookOnRenderActorSheet();
        CUBSignal.hookOnRenderImagePopout();
        CUBSignal.hookOnCreateToken();
        CUBSignal.hookOnPreUpdateToken();
        CUBSignal.hookOnUpdateToken();
        CUBSignal.hookOnPreUpdateActor();
        CUBSignal.hookOnUpdateActor();
        CUBSignal.hookOnPreUpdateCombat();
        CUBSignal.hookOnUpdateCombat();
        CUBSignal.hookOnDeleteCombat();
        CUBSignal.hookOnDeleteCombatant();
        CUBSignal.hookOnRenderCombatTracker();
        CUBSignal.hookOnRenderCombatTrackerConfig();
        CUBSignal.hookOnRenderChatMessage();
    }


    static hookOnInit() {
        Hooks.on("init", () => {
            CUB.animatedDie = new CUBAnimatedDie();
            CUB.enhancedConditions = new CUBEnhancedConditions();
            CUB.hideNPCNames = new CUBHideNPCNames();
            CUB.combatTracker = new CUBCombatTracker();
            CUB.concentrator = new CUBConcentrator();
            CUB.tokenUtility = new CUBTokenUtility();
            CUBSidekick.handlebarsHelpers();
            CUBSidekick.jQueryHelpers();

            if (CUB.tokenUtility.settings.tokenEffectSize) {
                Token.prototype.drawEffects = CUBTokenUtility._patchDrawEffects;
            }
        });
    }

    static hookOnCanvasInit() {
        Hooks.on("canvasInit", () => {
           
        });
    }

    static hookOnReady() {
        Hooks.on("ready", () => {
            CUB.rerollInitiative = new CUBRerollInitiative();
            CUB.injuredAndDead = new CUBInjuredAndDead();
            CUB.actorUtility = new CUBActorUtility();
            
            
            if (CUB.combatTracker.settings.xpModule) {
                Combat.prototype.endCombat = CUBCombatTracker.prototype.endCombat;
            }
        });
    }

    static hookOnRenderSettings() {
        Hooks.on("renderSettings", (app, html) => {
            CUBEnhancedConditions._createSidebarButton(html);
            CUB.enhancedConditions._toggleSidebarButtonDisplay(CUB.enhancedConditions.settings.enhancedConditions);
        });
    }

    static hookOnRenderTokenHUD() {
        Hooks.on("renderTokenHUD", (app, html, data) => {
            CUB.enhancedConditions._hookOnRenderTokenHUD(app, html, data);
        });
    }

    static hookOnRenderActorSheet() {
        Hooks.on("renderActorSheet", (app, html, data) => {
            CUB.actorUtility._onRenderActorSheet(app, html, data);
        });
    }

    static hookOnRenderImagePopout() {
        Hooks.on("renderImagePopout", (app, html, data) => {
            CUB.hideNPCNames._onRenderImagePopout(app, html, data);
        });
    }

    static hookOnCreateToken() {
        Hooks.on("createToken", (scene, sceneId, tokenData, options, userId) => {
            CUB.tokenUtility._hookOnCreateToken(scene, sceneId, tokenData);
        });
    }

    static hookOnPreUpdateToken() {
        Hooks.on("preUpdateToken", (scene, sceneId, actorData, currentData) => {
            CUB.concentrator._hookOnPreUpdateToken(scene, sceneId, actorData, currentData)
        });
    }

    static hookOnUpdateToken() {
        Hooks.on("updateToken", (scene, sceneID, update, options, userId) => {
            CUB.enhancedConditions._hookOnUpdateToken(scene, sceneID, update, options, userId);
            CUB.injuredAndDead._hookOnUpdateToken(scene, sceneID, update, options, userId);
            CUB.concentrator._hookOnUpdateToken(scene, sceneID, update, options, userId);
        });
    }

    static hookOnPreUpdateActor() {
        Hooks.on("preUpdateActor", (actor, update, options) => {
            CUB.concentrator._hookOnPreUpdateActor(actor, update, options);
        });
    }

    static hookOnUpdateActor() {
        Hooks.on("updateActor", (actor, update, options) => {
            // Workaround for actor array returned in hook for non triggering clients
            if (actor instanceof Collection) {
                actor = actor.entities.find(a => a._id === update._id);
            }
            CUB.concentrator._hookOnUpdateActor(actor, update, options);
            CUB.injuredAndDead._hookOnUpdateActor(actor, update);
        });
    }

    static hookOnPreUpdateCombat() {
        Hooks.on("preUpdateCombat", (combat, update, options) => {
            
        });
    }

    static hookOnUpdateCombat() {
        Hooks.on("updateCombat", (combat, update, options, userId) => {
            CUB.rerollInitiative._onUpdateCombat(combat, update, options, userId);
            CUB.combatTracker._hookOnUpdateCombat(combat, update);
        });
    }

    static hookOnDeleteCombat() {
        Hooks.on("deleteCombat", (combat, combatId, options, userId) => {
            CUB.combatTracker._hookOnDeleteCombat(combat, combatId, options, userId);
        });
    }

    static hookOnDeleteCombatant() {
        Hooks.on("preDeleteCombatant", (combat, combatId, combatantId, options) => {
            CUB.combatTracker._hookOnDeleteCombatant(combat, combatId, combatantId, options);
        });
    }

    static hookOnRenderCombatTracker() {
        Hooks.on("renderCombatTracker", (app, html, data) => {
            CUB.hideNPCNames._hookOnRenderCombatTracker(app, html, data);
            CUB.combatTracker._onRenderCombatTracker(app, html, data);
        });
    }

    static hookOnRenderCombatTrackerConfig() {
        Hooks.on("renderCombatTrackerConfig", (app, html, data) => {
            // Possible future feature
            //CUB.combatTracker._onRenderCombatTrackerConfig(app, html, data);
        });
    }

    static hookOnRenderChatMessage() {
        Hooks.on("renderChatMessage", (message, html, data) => {
            CUB.hideNPCNames._hookOnRenderChatMessage(message, html, data);
            CUB.concentrator._onRenderChatMessage(message, html, data);
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
        return !!(object instanceof Object);
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

    /**
     * Adds additional handlebars helpers
     */
    static handlebarsHelpers() {
        Handlebars.registerHelper("concat", () => {
            let result;

            for (let a in arguments) {
                result += (typeof arguments[a] === "string" ? arguments[a] : "");
            }
            return result;
        });
    }

    /**
     * Adds additional jquery helpers
     */
    static jQueryHelpers() {
        jQuery.expr[':'].icontains = function(a, i, m) {
            return jQuery(a).text().toUpperCase()
                .indexOf(m[3].toUpperCase()) >= 0;
        };
    }

    /**
     * Takes an array of terms (eg. name parts) and returns groups of neighbouring terms
     * @param {*} arr 
     */
    static getTerms(arr) {
        const terms = [];
        const rejectTerms = ["of", "its", "the", "a", "it's", "if", "in", "for", "on", "by"];
        for ( let i of arr.keys() ) {
            let len = arr.length - i;
            for ( let p=0; p<=i; p++ ) {
                let part = arr.slice(p, p+len);
                if (part.length === 1 && rejectTerms.includes(part[0])) {
                    continue;
                } 
                terms.push(part.join(" "));
            }
        }
        return terms;
    }

    /**
     * Escapes regex special chars
     * @param {*} string 
     */
    static escapeRegExp(string) {
        return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
    }
}

/**
 * Rerolls initiative for all combatants
 * @todo refactor to preUpdate hook
 */
class CUBRerollInitiative {
    constructor() {
        this.settings = {
            reroll: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.RerollN + ")", this.SETTINGS_META.enableReroll),
            rerollTempCombatants: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.RerollTempCombatantsN + ")" , this.SETTINGS_META.includeTempCombatants)
        };
    }

    get GADGET_NAME() {
        return "reroll-initiative";
    }


    get DEFAULT_CONFIG() {
        return {
            reroll: false,
            rerollTempCombatants: false
        };
    }

    get SETTINGS_DESCRIPTORS() {
        return {
            RerollN: "--Reroll Initiative--",
            RerollH: "Reroll initiative for each combatant every round",
            RerollTempCombatantsN: "Reroll Temporary Combatants",
            RerollTempCombatantsH: "Set whether to reroll initiative for Temporary Combatants if they are enabled"
        };

    }

    get SETTINGS_META() {
        return {
            enableReroll: {
                name: this.SETTINGS_DESCRIPTORS.RerollN,
                hint: this.SETTINGS_DESCRIPTORS.RerollH,
                scope: "world",
                type: Boolean,
                default: this.DEFAULT_CONFIG.reroll,
                config: true,
                onChange: s => {
                    this.settings.reroll = s;
                }
            },
            includeTempCombatants: {
                name: this.SETTINGS_DESCRIPTORS.RerollTempCombatantsN,
                hint: this.SETTINGS_DESCRIPTORS.RerollTempCombatantsH,
                scope: "world",
                type: Boolean,
                default: this.DEFAULT_CONFIG.rerollTempCombatants,
                config: true,
                onChange: s => {
                    this.settings.rerollTempCombatants = s;
                }
            }
        };

    }

    async _onUpdateCombat(combat, update, options={}, userId) {
        // Return early if we are NOT a GM OR we are not the player that triggered the update AND that player IS a GM
        if (!game.user.isGM || (game.userId !== userId && game.users.get(userId).isGM)) {
            return
        }

        const roundUpdate = !!getProperty(update, "round");

        // Return if the reroll setting is not enabled or this update does not contains a round
        if (!this.settings.reroll || !roundUpdate) {
            return;
        }

        if (combat instanceof CombatEncounters) {
            combat = game.combats.get(update._id);
        }
        
        // If we are not moving forward through the rounds, return
        if (update.round < 1 || update.round < combat.previous.round) {
            return;
        }

        let combatantIds;

        if (!this.settings.rerollTempCombatants) {
            combatantIds = combat.combatants.filter(c => !hasProperty(c, "flags." + [CUBButler.MODULE_NAME] + "." + [CUB.combatTracker.GADGET_NAME] + "(temporaryCombatant)")).map(c => c._id);
        } else {
            combatantIds = combat.combatants.map(c => c._id);
        }

        await combat.rollInitiative(combatantIds);
        await combat.update({turn: 0});

        /*
        const ids = combat.turns.map(c => c._id);

        // Taken from foundry.js Combat.rollInitiative() -->
        const currentId = combat.combatant._id;

        // Iterate over Combatants, performing an initiative roll for each
        const [updates, messages] = ids.reduce((results, id, i) => {
            let [updates, messages] = results;

            const messageOptions = options.messageOptions || {};
    
            // Get Combatant data
            const c = combat.getCombatant(id);
            if ( !c ) return results;
            const actorData = c.actor ? c.actor.data.data : {};
            const formula = combat.formula || combat._getInitiativeFormula(c);
    
            // Roll initiative
            const roll = new Roll(formula, actorData).roll();
            updates.push({_id: id, initiative: roll.total});
    
            // Construct chat message data
            const rollMode = messageOptions.rollMode || (c.token.hidden || c.hidden) ? "gmroll" : "roll";
            let messageData = mergeObject({
            speaker: {
                scene: canvas.scene._id,
                actor: c.actor ? c.actor._id : null,
                token: c.token._id,
                alias: c.token.name
            },
            flavor: `${c.token.name} rolls for Initiative!`
            }, messageOptions);
            const chatData = roll.toMessage(messageData, {rollMode, create:false});
            if ( i > 0 ) chatData.sound = null;   // Only play 1 sound for the whole set
            messages.push(chatData);
    
            // Return the Roll and the chat data
            return results;
        }, [[], []]);

        if ( !updates.length ) {
            return;
        }

        // Update multiple combatants
        await combat.updateManyEmbeddedEntities("Combatant", updates);

        // Ensure the turn order remains with the same combatant
        update.turn = combat.turns.findIndex(t => t._id === currentId);

        // Create multiple chat messages
        await ChatMessage.createMany(messages);
        // <-- End of borrowed code
        */
    }
}

/**
 * Hides NPC names in the combat tracker
 */
class CUBHideNPCNames {
    constructor() {
        this.settings = {
            hideNames: CUBSidekick.initGadgetSetting(
                this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.HideNamesN + ")", 
                this.SETTINGS_META.hideNames
            ),
            unknownCreatureString: CUBSidekick.initGadgetSetting(
                this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.UnknownCreatureN + ")",
                this.SETTINGS_META.unknownCreatureString
            ),
            hideFooter: CUBSidekick.initGadgetSetting(
                this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.HideFooterN + ")",
                this.SETTINGS_META.hideFooter
            )
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
            UnknownCreatureH: "Text to display for hidden NPC names",
            HideFooterN: "Hide Chat Card Footer",
            HideFooterH: "When NPC names are hidden, also hide the chat card footer which can contain sensitive information"
        };
    }

    get DEFAULT_CONFIG() {
        return {
            hideNames: false,
            unknownCreatureString: "Unknown Creature",
            hideFooter: false
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
                    ui.chat.render();
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
            },
            hideFooter: {
                name: this.SETTINGS_DESCRIPTORS.HideFooterN,
                hint: this.SETTINGS_DESCRIPTORS.HideFooterH,
                scope: "world",
                type: Boolean,
                default: this.DEFAULT_CONFIG.hideFooter,
                config: true,
                onChange: s => {
                    this.settings.hideFooter = s;
                    ui.chat.render();
                }
            }
        };
    }

    /**
     * Hooks on the Combat Tracker render to replace the NPC names
     * @param {Object} app - the Application instance
     * @param {Object} html - jQuery html object
     * @todo refactor required
     */
    _hookOnRenderCombatTracker(app, html) {
        if (game.user.isGM || !this.settings.hideNames) {
            return;
        }
        
        const combatantListElement = html.find("li");

        const npcElements = combatantListElement.filter((i, el) => {
            const token = game.scenes.active.data.tokens.find(t => t._id === el.dataset.tokenId);
            const actor = game.actors.entities.find(a => a._id === token.actorId);

            if (actor.isPC === false) {
                return true;
            }
        });

        if (npcElements.length === 0) {
            return;
        }

        const replacement = this.settings.unknownCreatureString || " ";

        $(npcElements).find(".token-name").text(replacement);
        $(npcElements).find(".token-image").attr("title", replacement);
    }

    /**
     * Replaces instances of hidden NPC name in chat
     * @todo: If a player owns the message speaker - reveal the message
     */
    _hookOnRenderChatMessage(message, html, data) {
        if (game.user.isGM || !this.settings.hideNames) {
            return;
        }

        const messageActorId = message.data.speaker.actor;
        const messageActor = game.actors.get(messageActorId);
        const speakerIsNPC = messageActor && !messageActor.isPC;

        if (!speakerIsNPC) {
            return;
        }

        const replacement = this.settings.unknownCreatureString || " ";
        const matchString = data.alias.includes(" ") ? CUBSidekick.getTerms(data.alias.split(" ")).map(e => CUBSidekick.escapeRegExp(e)).join("|") : data.alias;
        const regex = matchString + "(?=[\\s,.!?;:]|[s]|['s])";
            
        html.each((i, el) => {
            el.innerHTML = el.innerHTML.replace(new RegExp(regex, "gim"), replacement);
        });

        if (!this.settings.hideFooter) {
            return;
        }

        const cardFooter = html.find(".card-footer");
        cardFooter.prop("hidden", true);    
    }

    /**
     * Replace names in the image popout
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    _onRenderImagePopout(app, html, data) {
        if (game.user.isGM || app.options.entity.type !== "Actor" || !this.settings.hideNames) {
            return;
        }

        const actor = game.actors.get(app.options.entity.id);

        if (actor.isPC) {
            return;
        }

        const windowTitle = html.find(".window-title");
        const replacement = this.settings.unknownCreatureString || " ";

        if (windowTitle.length === 0) {
            return;
        } 

        windowTitle.text(replacement);
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
            conditionLab: "CUB: Condition Lab"
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
     * @todo: map to entryId and then rebuild on import
     */
    get DEFAULT_MAPS() {
        const dnd5eMap = [
            //Condition - Icon - JournalEntry
            ["Blinded", this.DEFAULT_CONFIG.iconPath + "blinded.svg", ""],
            ["Charmed", this.DEFAULT_CONFIG.iconPath + "charmed.svg", ""],
            ["Concentrating", this.DEFAULT_CONFIG.iconPath + "concentrating.svg", ""],
            ["Deafened", this.DEFAULT_CONFIG.iconPath + "deafened.svg", ""],
            ["Exhaustion 1", this.DEFAULT_CONFIG.iconPath + "exhaustion1.svg", ""],
            ["Exhaustion 2", this.DEFAULT_CONFIG.iconPath + "exhaustion2.svg", ""],
            ["Exhaustion 3", this.DEFAULT_CONFIG.iconPath + "exhaustion3.svg", ""],
            ["Exhaustion 4", this.DEFAULT_CONFIG.iconPath + "exhaustion4.svg", ""],
            ["Exhaustion 5", this.DEFAULT_CONFIG.iconPath + "exhaustion5.svg", ""],
            ["Frightened", this.DEFAULT_CONFIG.iconPath + "frightened.svg", ""],
            ["Grappled", this.DEFAULT_CONFIG.iconPath + "grappled.svg",""],
            ["Incapacitated", this.DEFAULT_CONFIG.iconPath + "incapacitated.svg", ""],
            ["Invisible", this.DEFAULT_CONFIG.iconPath + "invisible.svg", ""],
            ["Paralyzed", this.DEFAULT_CONFIG.iconPath + "paralyzed.svg", ""],
            ["Petrified", this.DEFAULT_CONFIG.iconPath + "petrified.svg", ""],
            ["Poisoned", this.DEFAULT_CONFIG.iconPath + "poisoned.svg", ""],
            ["Prone", this.DEFAULT_CONFIG.iconPath + "prone.svg", ""],
            ["Restrained", this.DEFAULT_CONFIG.iconPath + "restrained.svg", ""],
            ["Stunned", this.DEFAULT_CONFIG.iconPath + "stunned.svg", ""],
            ["Unconscious", "icons/svg/unconscious.svg", ""]
        ];

        const pf1eMap = [];

        const pf2eMap = [
            //Condition - Icon - JournalEntry
            ["Blinded", "systems/pf2e/icons/skills/light_03.jpg", ""],
            ["Broken", "systems/pf2e/icons/skills/red_16.jpg", ""],
            ["Clumsy", "systems/pf2e/icons/skills/light_05.jpg", ""],
            ["Concealed", "systems/pf2e/icons/skills/shadow_14.jpg", ""],
            ["Confused", "systems/pf2e/icons/skills/red_01.jpg", ""],
            ["Controlled", "systems/pf2e/icons/skills/red_05.jpg", ""],
            ["Dazzled", "systems/pf2e/icons/skills/shadow_12.jpg", ""],
            ["Deafened", "systems/pf2e/icons/skills/red_10.jpg", ""],
            ["Doomed", "systems/pf2e/icons/skills/blood_12.jpg", ""],
            ["Drained", "systems/pf2e/icons/skills/affliction_01.jpg", ""],
            ["Dying", "systems/pf2e/icons/skills/yellow_32.jpg", ""],
            ["Encumbered", "systems/pf2e/icons/skills/gray_05.jpg", ""],
            ["Enfeebled", "systems/pf2e/icons/skills/violet_28.jpg", ""],
            ["Fascinated", "systems/pf2e/icons/skills/violet_17.jpg", ""],
            ["Fatigued", "systems/pf2e/icons/skills/red_33.jpg", ""],
            ["Flat-Footed", "systems/pf2e/icons/skills/weapon_17.jpg", ""],
            ["Fleeing", "systems/pf2e/icons/skills/beast_01.jpg", ""],
            ["Frightened", "systems/pf2e/icons/skills/shadow_01.jpg", ""],
            ["Grabbed", "systems/pf2e/icons/skills/yellow_08.jpg", ""],
            ["Hidden", "systems/pf2e/icons/skills/shadow_17.jpg", ""],
            ["Immobilized", "systems/pf2e/icons/skills/green_16.jpg", ""],
            ["Invisible", "systems/pf2e/icons/skills/water_07.jpg", ""],
            ["Observed", "systems/pf2e/icons/skills/light_02.jpg", ""],
            ["Paralyzed", "systems/pf2e/icons/skills/ice_03.jpg", ""],
            ["Persistent Damage", "systems/pf2e/icons/skills/blood_03.jpg", ""],
            ["Petrified", "systems/pf2e/icons/skills/affliction_09.jpg", ""],
            ["Prone", "systems/pf2e/icons/skills/yellow_19.jpg", ""],
            ["Quickened", "systems/pf2e/icons/skills/blue_35.jpg", ""],
            ["Restrained", "systems/pf2e/icons/skills/red_06.jpg", ""],
            ["Sickened", "systems/pf2e/icons/skills/affliction_13.jpg", ""],
            ["Slowed", "systems/pf2e/icons/skills/blue_04.jpg", ""],
            ["Stunned", "systems/pf2e/icons/skills/affliction_02.jpg", ""],
            ["Stupefied", "systems/pf2e/icons/skills/violet_03.jpg", ""],
            ["Unconscious", "systems/pf2e/icons/skills/light_01.jpg", ""],
            ["Undetected", "systems/pf2e/icons/skills/emerald_07.jpg", ""],
            ["Unnoticed", "systems/pf2e/icons/skills/green_18.jpg", ""],
            ["Wounded", "systems/pf2e/icons/skills/blood_04.jpg", ""],
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
    _hookOnUpdateToken(scene, sceneID, update, options, userId) {
        if (!this.settings.enhancedConditions || game.userId != userId) {
            return;
        }

        //console.log(token,sceneId,update);
        let effects = update.effects;

        if (!effects) {
            return;
        }

        //If the update has effects in it, lookup mapping and set the current token
        this.currentToken = canvas.tokens.get(update._id);
        return this.lookupEntryMapping(effects);
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
                //speaker: tokenSpeaker,
                speaker: {
                    alias: this.DEFAULT_CONFIG.conditionLab
                },
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
            unconscious: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.UnconsciousN + ")", this.SETTINGS_META.unconscious),
            unconsciousActorType: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.UnconsciousActorTypeN + ")", this.SETTINGS_META.unconsciousActorType),
            unconsciousIcon: CUBSidekick.initGadgetSetting(this.GADGET_NAME +  "(" + this.SETTINGS_DESCRIPTORS.UnconsciousIconN + ")", this.SETTINGS_META.unconsciousIcon), 
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
            HealthAttributeH: "Health/HP attribute name as defined by game system",
            UnconsciousN: "--Mark Unconscious--",
            UnconsciousH: "Sets a unconscious (instead of dead) status marker on a certain Actor type when they reach 0 health",
            UnconsciousActorTypeN: "Unconscious Actor Type",
            UnconsciousActorTypeH: "Select the Actor Type to mark unconscious instead of dead",
            UnconsciousIconN: "Unconscious Status Marker",
            UnconsciousIconH: "Path to the status marker to display for Unconscious Tokens"
        };
    }

    get DEFAULT_CONFIG() {
        return {
            injured: false,
            injuredIcon: "icons/svg/blood.svg",
            threshold: 50,
            dead: false,
            deadIcon: "icons/svg/skull.svg",
            combatTrackDead: false,
            unconscious: false,
            unconsciousActorType: "",
            unconsciousIcon: "icons/svg/unconscious.svg"
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
            },
            unconscious: {
                name: this.SETTINGS_DESCRIPTORS.UnconsciousN,
                hint: this.SETTINGS_DESCRIPTORS.UnconsciousH,
                default: this.DEFAULT_CONFIG.unconscious,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.unconscious = s;
                }
            },
            unconsciousActorType: {
                name: this.SETTINGS_DESCRIPTORS.UnconsciousActorTypeN,
                hint: this.SETTINGS_DESCRIPTORS.UnconsciousActorTypeH,
                default: this.DEFAULT_CONFIG.unconsciousActorType,
                scope: "world",
                type: String,
                choices: game.system.entityTypes.Actor,
                config: true,
                onChange: s => {
                    this.settings.unconsciousActorType = s;
                }
            },
            unconsciousIcon: {
                name: this.SETTINGS_DESCRIPTORS.UnconsciousIconN,
                hint: this.SETTINGS_DESCRIPTORS.UnconsciousIconH,
                default: this.DEFAULT_CONFIG.unconsciousIcon,
                scope: "world",
                type: String,
                config: true,
                onChange: s => {
                    this.settings.unconsciousIcon = s;
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
        const isDead = this._checkForDead(currentHealth);
        const isInjured = this._checkForInjured(currentHealth, maxHealth);
        const markUnconscious = (this.settings.unconscious && token.actor.data.type === this.settings.unconsciousActorType) ? true : false;

        if (isDead) {
            if (markUnconscious) {
                return CUBButler.HEALTH_STATES.UNCONSCIOUS;
            }
            return CUBButler.HEALTH_STATES.DEAD;
        } else if (isInjured) {
            return CUBButler.HEALTH_STATES.INJURED;
        }

        return;
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
        const isDead = this._checkForDead(currentHealth);
        const isInjured = this._checkForInjured(currentHealth, maxHealth);
        const markUnconscious = (this.settings.unconscious && actor.data.type === this.unconsciousActorType) ? true : false;

        if (isDead) {
            if (markUnconscious) {
                return CUBButler.HEALTH_STATES.UNCONSCIOUS;
            }
            return CUBButler.HEALTH_STATES.DEAD;
        } else if (isInjured) {
            return CUBButler.HEALTH_STATES.INJURED;
        }

        return;
    }

    /**
     * Checks if the given health value is 0
     * @param {Number} value 
     * @returns {Boolean}
     */
    _checkForDead(value) {
        return value === 0 ? true : false;
    }

    /**
     * Checks if the given value is below the threshold
     * @param {Number} value 
     * @param {Number} max
     * @returns {Boolean}
     */
    _checkForInjured(value, max) {
        return (value < max * (this.settings.threshold / 100)) ?  true : false;
    }

    /**
     * Retrieves an Actor type based on the index stored in the setting
     * @returns {String}
     */
    get unconsciousActorType() {
        try {
            return game.system.entityTypes.Actor[this.settings.unconsciousActorType];
        } catch(e) {
            console.warn(e);
            return;
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
        const wasDead = Boolean(tokenOverlay === this.settings.deadIcon);
        const wasUnconscious = Boolean(tokenOverlay === this.settings.unconsciousIcon);

        if (hasEffects && wasInjured) {
            return token.toggleEffect(this.settings.injuredIcon);
        }

        if (hasOverlay && wasDead) {
            return token.toggleOverlay(this.settings.deadIcon);
        }

        if (hasOverlay && wasUnconscious) {
            return token.toggleOverlay(this.settings.unconsciousIcon);
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
        const wasUnconscious = Boolean(tokenOverlay === this.settings.unconsciousIcon);

        if (!isInjured) {
            token.toggleEffect(this.settings.injuredIcon);
        }

        if (wasDead) {
            token.toggleOverlay(this.settings.deadIcon);
        }

        if (wasUnconscious) {
            token.toggleOverlay(this.settings.unconsciousIcon);
        }
    }

    /**
     * Set a dead overlay on a token, removes all effects
     * @param {Object} token 
     */
    async _markDead(token) {
        const tokenEffects = getProperty(token, "data.effects");
        const hasEffects = getProperty(token, "data.effects.length") > 0;
        const tokenOverlay = getProperty(token, "data.overlayEffect");
        const isDead = (tokenOverlay === this.settings.deadIcon) ? true : false;
        const isInjured = Boolean(tokenEffects.find(e => e == this.settings.injuredIcon)) || false;
        const isUnconscious = (tokenOverlay === this.settings.unconsciousIcon) ? true : false;
        const markUnconscious = (this.settings.unconscious && token.actor.data.type === this.unconsciousActorType) ? true : false;

        if (!isUnconscious && markUnconscious) {
            if (hasEffects && isInjured) {
                token.toggleEffect(this.settings.injuredIcon);
            }
            await token.toggleOverlay(this.settings.unconsciousIcon);
            if (CUB.enhancedConditions && CUB.enhancedConditions.settings.enhancedConditions) {
                CUB.enhancedConditions.currentToken = token;
                const effects = tokenEffects.concat(token.data.overlayEffect);

                CUB.enhancedConditions.lookupEntryMapping(effects);
            }

            return;
        }

        if (hasEffects) {
            token.update(token.scene.id, {
                "effects": []
            });
        }

        if (!isDead) {
            return token.toggleOverlay(this.settings.deadIcon);
        }
    }

    /**
     * Toggles the combat tracker death status based on token hp
     * @param {Object} token 
     */
    async _toggleTrackerDead(token) {
        if (!token.scene.active || !game.user.isGM) {
            return;
        }

        const combat = game.combat;
        if (combat) {
            let combatant = combat.turns.find(t => t.tokenId == token.id);
            let tokenHp = getProperty(token, "actor.data.data.attributes.hp.value");
            if (combatant) {
                await combat.updateCombatant({
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
    async _hookOnUpdateToken(scene, sceneID, update, options, userId) {
        if (!this.settings.dead && !this.settings.injured && !this.settings.unconscious) {
            return;
        }

        let token = canvas.tokens.get(update._id);
        const healthUpdate = getProperty(update, "actorData.data." + this.settings.healthAttribute + ".value");
        if (game.userId != userId || healthUpdate == undefined || token.actorLink) {
            return;
        }

        let tokenHealthState;

        if (this.settings.injured || this.settings.dead || this.settings.unconscious || this.settings.combatTrackDead) {
            tokenHealthState = this._checkTokenHealthState(token, update);

            if ((tokenHealthState === CUBButler.HEALTH_STATES.DEAD || tokenHealthState === CUBButler.HEALTH_STATES.UNCONSCIOUS) && (this.settings.dead || this.settings.combatTrackDead)) {
                if (this.settings.combatTrackDead) {
                    await this._toggleTrackerDead(token);
                }
                this._markDead(token);
            } else if (tokenHealthState === CUBButler.HEALTH_STATES.INJURED && this.settings.injured) {
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
        return;
    }

    /**
     * Hook on the actor update,
     * check the health state of the actor,
     * then mark the active token appropriately
     * @param {Object} token
     * @param {String} sceneId
     * @param {Object} update
     * @todo refactor as updateMany
     */
    _hookOnUpdateActor(actor, update) {
        if (!this.settings.dead && !this.settings.injured && !this.settings.unconscious) {
            return;
        }

        const healthUpdate = getProperty(update, "data." + this.settings.healthAttribute + ".value");
        const activeTokens = actor.getActiveTokens();

        if (healthUpdate === undefined || !activeTokens.length) {
            return;
        }

        const healthState = this._checkActorHealthState(actor, update);

        for (let t of activeTokens) {
            switch (healthState) {
                case CUBButler.HEALTH_STATES.DEAD:
                case CUBButler.HEALTH_STATES.UNCONSCIOUS:
                    this._markDead(t);
                    if (this.settings.combatTrackDead) {
                        this._toggleTrackerDead(t);
                    }
                    break;

                case CUBButler.HEALTH_STATES.INJURED:
                    this._markInjured(t);
                    if (this.settings.combatTrackDead) {
                        this._toggleTrackerDead(t);
                    }
                    break;

                default:
                    this._markHealthy(t);
                    if (this.settings.combatTrackDead) {
                        this._toggleTrackerDead(t);
                    }
                    break;
                
            }
        }
    }
}

/**
 * Request a roll or display concentration checks when damage is taken.
 * @author JacobMcAuley
 * @todo Supply DC
 */
class CUBConcentrator {
    constructor(){
        this.settings = {
            concentrating: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ConcentratingN + ")", this.SETTINGS_META.concentrating),
            concentratingIcon: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ConcentratingIconN + ")", this.SETTINGS_META.concentratingIcon),
            healthAttribute: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.HealthAttributeN + ")", this.SETTINGS_META.healthAttribute),
            displayChat: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ConcentratingChatPromptN + ")", this.SETTINGS_META.displayChat),
            rollRequest: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ConcentratingRollRequestN + ")", this.SETTINGS_META.rollRequest),
            ability: "con", //change to a setting later maybe?
            autoConcentrate: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ConcentratingAutoStatusN + ")", this.SETTINGS_META.autoConcentrate),
            notifyDoubleConcentration: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ConcentratingNotifyDoubleN + ")", this.SETTINGS_META.notifyDoubleConcentration)   
        }
    }

    get GADGET_NAME() {
        return "concentrator"
    }

    get SETTINGS_DESCRIPTORS(){
        return {
            ConcentratingN: "--Force Concentration Checks--",
            ConcentratingH: "Requires concentration checks on tokens with the concentrating status effect when they take damage (D&D 5e only)",
            ConcentratingIconN: "Concentration Status Icon",
            ConcentratingIconH: "Path to the icon to use for Concentration",
            ConcentratingChatMessageN: "Notify Chat",
            ConcentratingChatMessageH: "Display a message in chat whenever concentration is threatened",
            ConcentratingRollRequestN: "Prompt Player",
            ConcentratingRollRequestH: "Prompt the player to make the check or not",
            HealthAttributeN: "Health Attribute",
            HealthAttributeH: "Health/HP attribute name as defined by game system",
            ConcentratingAutoStatusN: "Automatically Set Concentrating Status",
            ConcentratingAutoStatusH: "When a Concentration spell is cast, automatically set the Concentrating status",
            ConcentratingNotifyDoubleN: "Notify on Double Concentration",
            ConcentratingNotifyDoubleH: "Send a message when a Concentration spell is cast while another spell is being Concentrated on"
        }
    }

    get DEFAULT_CONFIG(){
        return {
            concentrating: false,
            concentratingIcon: "modules/combat-utility-belt/icons/concentrating.svg",
            concentrator: "CUB: Concentrator"
        };
    }

    get SETTINGS_META(){
        return {
            concentrating: {
                name: this.SETTINGS_DESCRIPTORS.ConcentratingN,
                hint: this.SETTINGS_DESCRIPTORS.ConcentratingH,
                default: this.DEFAULT_CONFIG.concentrating,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.concentrating = s;
                }
            },
            concentratingIcon: {
                name: this.SETTINGS_DESCRIPTORS.ConcentratingIconN,
                hint: this.SETTINGS_DESCRIPTORS.ConcentratingIconH,
                default: this.DEFAULT_CONFIG.concentratingIcon,
                scope: "world",
                type: String,
                config: true,
                onChange: s => {
                    this.settings.concentratingIcon = s;
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
            displayChat: {
                name: this.SETTINGS_DESCRIPTORS.ConcentratingChatMessageN,
                hint: this.SETTINGS_DESCRIPTORS.ConcentratingChatMessageH,
                default: (CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id] != null) ? CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id].healthAttribute : CUBButler.DEFAULT_GAME_SYSTEMS.other.healthAttribute,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.displayChat = s;
                }
            },
            rollRequest: {
                name: this.SETTINGS_DESCRIPTORS.ConcentratingRollRequestN,
                hint: this.SETTINGS_DESCRIPTORS.ConcentratingRollRequestH,
                default: (CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id] != null) ? CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id].healthAttribute : CUBButler.DEFAULT_GAME_SYSTEMS.other.healthAttribute,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.rollRequest = s;
                }
            },
            autoConcentrate: {
                name: this.SETTINGS_DESCRIPTORS.ConcentratingAutoStatusN,
                hint: this.SETTINGS_DESCRIPTORS.ConcentratingAutoStatusH,
                default: false,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.autoConcentrate = s;
                }
            },
            notifyDoubleConcentration: {
                name: this.SETTINGS_DESCRIPTORS.ConcentratingNotifyDoubleN,
                hint: this.SETTINGS_DESCRIPTORS.ConcentratingNotifyDoubleH,
                default: "None",
                scope: "world",
                type: String,
                choices: ["None", "GM Only", "Everyone"],
                config: true,
                onChange: s => {
                    this.settings.notifyDoubleConcentration = s;
                }
            }
        };
    }

    /**
     * Determines if health has been reduced 
     * @param {*} update 
     * @param {*} current 
     * @returns {Boolean}
     */
    _wasDamageTaken(newHealth, oldHealth) {
        return newHealth < oldHealth || false;
    }

    /**
     * Checks for the presence of the concentration condition effect
     * @param {*} token
     * @returns {Boolean}
     */
    _isConcentrating(token) {
        const tokenEffects = getProperty(token, "data.effects");
        const _isConcentrating = Boolean(tokenEffects && tokenEffects.find(e => e == this.settings.concentratingIcon)) || false;

        return _isConcentrating;
    }

    /**
     * Calculates damage taken based on two health values
     * @param {*} newHealth 
     * @param {*} oldHealth
     * @returns {Number}
     */
    _calculateDamage(newHealth, oldHealth) {
        return oldHealth - newHealth || 0;
    }

    /**
     * Handle render ChatMessage
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    _onRenderChatMessage(app, html, data) {
        if (!game.user.isGM || app.data.timestamp + 500 < Date.now() || !this.settings.autoConcentrate) {
            return;
        }

        const itemDiv = html.find("div[data-item-id]");

        // support Beyond20
        const concentrationDiv = html.find(":contains('Requires Concentration')");

        if (itemDiv.length === 0 && concentrationDiv.length === 0) {
            return;
        }

        const actorId = app.data.speaker.actor || null;
        const tokenId = app.data.speaker.token || null;
        const itemId = itemDiv.data("itemId") || null;

        if (!tokenId && !actorId) {
            return;
        }

        const actor = game.actors.get(actorId);
        const tokens = [canvas.tokens.get(tokenId)] || actor ? actor.getActiveTokens() : [];

        if (!tokens) {
            return;
        }

        for (const t of tokens) {
            const item = itemId ? (tokenId ? t.actor.getOwnedItem(itemId) : actor.getOwnedItem(itemId)) : null;
            const isSpell = (concentrationDiv.length > 0 && itemDiv.length === 0) ? true : (itemDiv.length > 0 ? item.type === "spell" : false);
            const isConcentration = concentrationDiv.length > 0 ? true : (itemDiv.length > 0 && isSpell) ? item.data.data.components.concentration : false;

            if (!isConcentration) {
                continue;
            }

            const tokenEffects = getProperty(t, "data.effects");
            const isAlreadyConcentrating = !!tokenEffects.find(e => e === this.settings.concentratingIcon);

            if (isAlreadyConcentrating) {

                if (this.settings.notifyDoubleConcentration !== "None") {
                    this._notifyDoubleConcentration(t);
                }

                continue;
            }

            t.toggleEffect(this.settings.concentratingIcon);
        }  
    }

    /**
     * Handles preUpdateToken
     * @param {*} scene 
     * @param {*} sceneID 
     * @param {*} update 
     * @param {*} options 
     */
    _hookOnPreUpdateToken(scene, sceneID, update, options){
        const token = canvas.tokens.get(update._id);
        const actorId = getProperty(token, "data.actorId");
        const current = getProperty(token, "actor");

        // Return early if basic requirements not met
        if (!game.user.isGM || !current || !this.settings.concentrating || token.actorLink || !actorId) {
            return;
        }

        const newHealth = getProperty(update, "actorData.data." + this.settings.healthAttribute + ".value");
        const oldHealth = getProperty(current, "data.data." + this.settings.healthAttribute + ".value");
        const isConcentrating = this._isConcentrating(token);
        const damageTaken = this._wasDamageTaken(newHealth, oldHealth);

        // Return early if damage wasn't taken or the token wasn't concentrating
        if (!isConcentrating || !damageTaken) {
            return;
        }

        const damageAmount = this._calculateDamage(newHealth, oldHealth)

        if(this.settings.displayChat) {
            this._displayChat(getProperty(options, "currentData.name"), damageAmount);
        }
                
        if(this.settings.rollRequest) {
            const actor = game.actors.get(actorId);

            if (!actor) {
                return;
            }

            const owners = game.users.entities.filter(user => actor.hasPerm(user, "OWNER"));
            options['affectedUsers'] = {'actorId' : actorId, 'owners': owners};
        }
    }

    /**
     * Handles preUpdate Actor
     * @param {*} actor 
     * @param {*} update 
     * @param {*} options 
     */
    _hookOnPreUpdateActor(actor, update, options) {
        const tokens = actor.getActiveTokens();
        const actorId = update._id;
        const newHealth = getProperty(update, "data." + this.settings.healthAttribute + ".value");
        const oldHealth = getProperty(actor, "data.data." + this.settings.healthAttribute + ".value");
        const owners = game.users.entities.filter(user => actor.hasPerm(user, "OWNER") && !user.isGM);

        if (owners.length == 0) {
            owners.push(game.users.entities.find(user => user.isGM));
        }
            
        if (!tokens || !newHealth || !oldHealth || !actor) {
            return;
        }
        
        const concentratingTokens = tokens.filter(t => this._isConcentrating(t) && this._wasDamageTaken(newHealth, oldHealth));

        if (!concentratingTokens.length) {
            return;
        }

        const damageAmount = this._calculateDamage(newHealth, oldHealth);

        if(this.settings.displayChat) {
            for (const t of tokens) {
                this._displayChat(getProperty(t, "name"), damageAmount);
            } 
        }
                    
                
        if(this.settings.rollRequest && actorId) {
            options['affectedUsers'] = {'actorId' : actorId, 'owners': owners};
        }
    }

    /**
     * Handle update Actor
     * @param {*} actor 
     * @param {*} update 
     * @param {*} options 
     */
    _hookOnUpdateActor(actor, update, options){
        this._determineDisplayedUsers(options);
    }

    /**
     * Handle update Token
     * @param {*} scene 
     * @param {*} sceneID 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    _hookOnUpdateToken(scene, sceneID, update, options, userId){
        this._determineDisplayedUsers(options);
    }

    /**
     * Distributes concentration prompts to affected users
     * @param {*} options 
     */
    _determineDisplayedUsers(options){
        const owners = getProperty(options, 'affectedUsers.owners');
        const actorId = getProperty(options, 'affectedUsers.actorId');

        if(!owners || !actorId) {
            return;
        }

        const users = owners.filter(owner => game.user._id === owner._id) || [];

        if (users.length > 0) {
            return this._distributePrompts(actorId, users);
        }

        if (users.length === 0 && game.user.isGM) {
            users.push(game.userId);
            return this._distributePrompts(actorId, users);
        }
    }

    /**
     * Displays a chat message for concentration checks
     * @param {*} name
     * @param {*} damage
     */
    _displayChat(name, damage){
        if (!game.user.isGM) {
            return;
        }
        const halfDamage = Math.floor(damage / 2);
        const dc = halfDamage > 10 ? halfDamage : 10;

        ChatMessage.create({
            user: game.user._id,
            speaker: {
                alias: this.DEFAULT_CONFIG.concentrator
            },
            content: `${name} took damage and their concentration is being tested (DC${dc})!`,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER
        });       
    }

    /**
     * Distribute concentration prompts to affected users
     * @param {*} actorId 
     * @param {*} users 
     */
    _distributePrompts(actorId, users){
        for (const u of users) {
            this._displayPrompt(actorId, u._id);
        }
    }

    /**
     * Displays the prompt to roll a concentration check
     * @param {*} actorId 
     * @param {*} userId 
     */
    _displayPrompt(actorId, userId){
        const actor = game.actors.get(actorId);
        const ability = this.settings.ability;

        if (!actor) {
            return;
        }

        new Dialog({
            title: "Concentration Check",
            content: `<p>Roll a concentration check for ${actor.name}?</p>`,
            buttons: {
                yes: {
                    label: "Yes",
                    icon: `<i class="fas fa-check"></i>`,
                    callback: e => {
                        actor.rollAbilitySave(ability);
                    }
                },
                no: {
                    label: "No",
                    icon: `<i class="fas fa-times"></i>`,
                    callback: e => {
                        //maybe whisper the GM to alert them that the player canceled the check?
                    }
                }
            },
            default: "Yes"
        }).render(true);
    }

    /**
     * Displays a chat message to GMs if a Concentration spell is cast while already concentrating
     * @param {*} token 
     */
    _notifyDoubleConcentration(token) {
        const isWhisper = this.settings.notifyDoubleConcentration === "GM Only";

        ChatMessage.create({
            speaker: {
                alias: CUBConcentrator.prototype.DEFAULT_CONFIG.concentrator
            },
            whisper: isWhisper ? game.users.entities.filter(u => u.isGM) : "",
            content: `<p>${token.name} cast a spell requiring Concentration while concentrating on another spell. Concentration on the original spell is lost.`,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER
        });
    }
}

class CUBCombatTracker {
    constructor() {
        this.settings = {
            panOnNextTurn: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.PanOnNextTurnN + ")", this.SETTINGS_META.panOnNextTurn),
            panGM: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.PanGMN + ")", this.SETTINGS_META.panGM),
            panPlayers: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.PanPlayersN + ")", this.SETTINGS_META.panPlayers),
            selectOnNextTurn: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.SelectOnNextTurnN + ")", this.SETTINGS_META.selectOnNextTurn),
            selectGM: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.SelectGMN + ")", this.SETTINGS_META.selectGM),
            selectPlayers: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.SelectPlayersN + ")", this.SETTINGS_META.selectPlayers),
            observerDeselect: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ObserverDeselectN + ")", this.SETTINGS_META.observerDeselect),
            trackerConfigSettings: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.TrackerConfigSettingsN + ")", this.SETTINGS_META.trackerConfigSettings),
            tempCombatants: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.TempCombatantsN + ")", this.SETTINGS_META.tempCombatants),
            xpModule: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.XPModuleN + ")", this.SETTINGS_META.xpModule)
        };

        this.callingUser = "";
    }

    get GADGET_NAME() {
        return "combat-tracker";
    }

    get SETTINGS_DESCRIPTORS() {
        return {
            PanOnNextTurnN: "--Pan to Token--",
            PanOnNextTurnH: "Enables the following token panning functionality",
            PanGMN: "Pan GM",
            PanGMH: "Pans GM. Options: None (do not pan GM), NPC (pan only to non-player character tokens), All (pan to all tokens)",
            PanPlayersN: "Pan Players",
            PanPlayersH: "Pans players. Options: None (do not pan players), Owner (pan only to Owned tokens), Observer (pan to Observed AND Owned tokens), All (pan to all tokens)",
            SelectOnNextTurnN: "--Select Token--",
            SelectOnNextTurnH: "Enables the following token select functionality",
            SelectGMN: "Select GM",
            SelectGMH: "Selects token based on selected option: None (do not select), NPC (select only non-player character tokens), All (select all tokens)",
            SelectPlayersN: "Select Players",
            SelectPlayersH: "Selects Player-owned tokens on their turn in combat",
            ObserverDeselectN: "Deselect Tokens",
            ObserverDeselectH: "Deselect controlled tokens on any non-Owned combatant's turn",
            TempCombatantsN: "--Enable Temporary Combatants--",
            TempCombatantsH: "Allows the creation of temporary/freeform combatants from the Combat Tracker",
            TrackerConfigSettingsN: "Combat Tracker Settings",
            TrackerConfigSettingsH: "Additional settings for the Combat Tracker",
            XPModuleN: "--Enable XP Module--",
            XPModuleH: "REQUIRES REFRESH! Adds an option at the end of combat to automatically distribute xp from the combat to the players"
        };
    }

    get DEFAULT_CONFIG() {
        return {
            panOnNextTurn: false,
            selectOnNextTurn: false,
            panGM: {
                none: "None",
                npc: "NPC",
                all: "All"
            },
            panPlayers: {
                none: "None",
                owner: "Owner",
                observer: "Observer",
                all: "All"
            },
            selectPlayers: false,
            observerDeselect: false,
            tempCombatants: false,
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
            panGM: {
                name: this.SETTINGS_DESCRIPTORS.PanGMN,
                hint: this.SETTINGS_DESCRIPTORS.PanGMH,
                default: CUBSidekick.getKeyByValue(this.DEFAULT_CONFIG.panGM, this.DEFAULT_CONFIG.panGM.none),
                scope: "world",
                type: String,
                choices: this.DEFAULT_CONFIG.panGM,
                config: true,
                onChange: s => {
                    this.settings.panGM = s;
                }
            },
            panPlayers: {
                name: this.SETTINGS_DESCRIPTORS.PanPlayersN,
                hint: this.SETTINGS_DESCRIPTORS.PanPlayersH,
                default: CUBSidekick.getKeyByValue(this.DEFAULT_CONFIG.panPlayers, this.DEFAULT_CONFIG.panPlayers.none),
                scope: "world",
                type: String,
                choices: this.DEFAULT_CONFIG.panPlayers,
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
            selectGM: {
                name: this.SETTINGS_DESCRIPTORS.SelectGMN,
                hint: this.SETTINGS_DESCRIPTORS.SelectGMH,
                default: CUBSidekick.getKeyByValue(this.DEFAULT_CONFIG.panGM, this.DEFAULT_CONFIG.panGM.none),
                scope: "world",
                type: String,
                choices: this.DEFAULT_CONFIG.panGM, //uses same options as Pan GM
                config: true,
                onChange: s => {
                    this.settings.selectGM = s;
                }
            },
            selectPlayers: {
                name: this.SETTINGS_DESCRIPTORS.SelectPlayersN,
                hint: this.SETTINGS_DESCRIPTORS.SelectPlayersH,
                default: this.DEFAULT_CONFIG.selectPlayers,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.selectPlayers = s;
                }
            },
            observerDeselect: {
                name: this.SETTINGS_DESCRIPTORS.ObserverDeselectN,
                hint: this.SETTINGS_DESCRIPTORS.ObserverDeselectH,
                default: this.DEFAULT_CONFIG.observerDeselect,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.observerDeselect = s;
                }
            },
            tempCombatants: {
                name: this.SETTINGS_DESCRIPTORS.TempCombatantsN,
                hint: this.SETTINGS_DESCRIPTORS.TempCombatantsH,
                default: this.DEFAULT_CONFIG.tempCombatants,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.tempCombatants = s;
                    ui.combat.render();
                }
            },
            trackerConfigSettings: {
                name: this.SETTINGS_DESCRIPTORS.TrackerConfigSettingsN,
                hint: this.SETTINGS_DESCRIPTORS.TrackerConfigSettingsH,
                default: {},
                scope: "world",
                type: Object,
                config: false,
                onChange: s => {
                    this.settings.trackerConfigSettings = s;
                    ui.combat.render();
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
     * Determines if a panning workflow should begin
     * @param {Object} combat
     * @param {Object} update 
     */
    _panHandler(combat, update) {
        if (!hasProperty(update, "turn") || !this.settings.panOnNextTurn || (!game.user.isGM && this.settings.panGMOnly)) {
            return;
        }

        const combatant = combat.combatant;
        const temporary = hasProperty(combatant, "flags." + CUBButler.MODULE_NAME + "." + CUBCombatTracker.prototype.GADGET_NAME + "(temporaryCombatant)");

        if (temporary) {
            return;
        }

        const tracker = combat.entities ? combat.entities.find(tr => tr._id === update._id) : combat;
        const token = hasProperty(update, "turn") ? tracker.turns[update.turn].token : tracker.turns[0].token;

        if (!game.user.isGM && this.settings.panPlayers !== CUBSidekick.getKeyByValue(this.DEFAULT_CONFIG.panPlayers, this.DEFAULT_CONFIG.panPlayers.none)) {
            return this._checkPlayerPan(token);
        }

        if (game.user.isGM && this.settings.panGM !== CUBSidekick.getKeyByValue(this.DEFAULT_CONFIG.panGM, this.DEFAULT_CONFIG.panGM.none)) {
            return this._checkGMPan(token);
        }
    }

    /**
     * Determine if the player should be panned
     * @param {*} token
     */
    _checkPlayerPan(token) {
        const actor = token ? game.actors.get(token.actorId) : null;
        const actorPermission = actor ? actor.data.permission[game.userId] || 0 : null;

        if (actorPermission === null) {
            return;
        }
        // all - pan always, owner - pan when i own, observer - pan when i own OR observe, none - return

        switch (this.DEFAULT_CONFIG.panPlayers[this.settings.panPlayers]) {
            case this.DEFAULT_CONFIG.panPlayers.observer:
                if (actorPermission >= CONST.ENTITY_PERMISSIONS.OBSERVER) {
                    break;
                }

                return;
     
            case this.DEFAULT_CONFIG.panPlayers.owner:
                if (actorPermission >= CONST.ENTITY_PERMISSIONS.OWNER) {
                    break;
                }

                return;

            case this.DEFAULT_CONFIG.panPlayers.all:
                break;

            case this.DEFAULT_CONFIG.panPlayers.none:
            default:
                if (!game.user.isGM) {
                    return;
                }
        }

        return this._panToToken(token);
    }

    /**
     * Determine if the GM should be panned
     * @param {*} token
     */
    _checkGMPan(token) {
        const actor = token ? game.actors.get(token.actorId) : null;

        if (!actor) {
            return;
        }

        switch (this.DEFAULT_CONFIG.panGM[this.settings.panGM]) {
            case this.DEFAULT_CONFIG.panGM.none:
                return;
            
            case this.DEFAULT_CONFIG.panGM.npc:
                if (actor.isPC) {
                    return;
                }
                
                break;
            
            case this.DEFAULT_CONFIG.panGM.all:
                break;

            default:
                return;
        }

        return this._panToToken(token);
    }

    /**
     * Pans user to the token
     * @param {*} token 
     */
    _panToToken(token) {
        const xCoord = token.x;
        const yCoord = token.y;
        return canvas.animatePan({
                x: xCoord,
                y: yCoord
        });
    }

    /**
     * Selects the current token in the turn tracker
     * @param {Object} combat 
     * @param {Object} update 
     */
    async _selectHandler(combat, update) {
        if (!hasProperty(update, "turn") || !this.settings.selectOnNextTurn) {
            return;
        }

        const combatant = combat.combatant;
        const temporary = hasProperty(combatant, "flags." + CUBButler.MODULE_NAME + "." + CUBCombatTracker.prototype.GADGET_NAME + "(temporaryCombatant)");

        if (temporary) {
            return;
        }

        const tracker = combat.entities ? combat.entities.find(tr => tr._id === update._id) : combat;
        const token = hasProperty(update, "turn") ? tracker.turns[update.turn].token : tracker.turns[0].token;

        if (!token) {
            return;
        }

        if (game.user.isGM && this.settings.selectOnNextTurn && this.settings.selectGM !== CUBSidekick.getKeyByValue(this.DEFAULT_CONFIG.panGM, this.DEFAULT_CONFIG.panGM.none)) {
            return this._checkGMSelect(token);
        }

        if (this.settings.observerDeselect) {
            this._checkObserverDeselect(token);
        }

        if (this.settings.selectPlayers) {
            this._checkPlayerSelect(token);
        }
        
        return;
    }

    /**
     * Determine if the current combatant token should be selected for the GM 
     * @param {*} token 
     */
    _checkGMSelect(token) {
        const actor = token ? game.actors.get(token.actorId) : null;

        if (!actor) {
            return;
        }

        switch (this.DEFAULT_CONFIG.panGM[this.settings.selectGM]) {
            case this.DEFAULT_CONFIG.panGM.none:
                return;
            
            case this.DEFAULT_CONFIG.panGM.npc:
                if (actor.isPC) {
                    return;
                }
                
                break;
            
            case this.DEFAULT_CONFIG.panGM.all:
                break;

            default:
                return;
        }

        const canvasToken = canvas.tokens.get(token._id) || null;
        return canvasToken.control();
    }

    /**
     * Determines if Player can select the current combatant token
     * @param {*} token 
     */
    _checkPlayerSelect(token) {
        const actor = token ? game.actors.get(token.actorId) : null;
        const actorPermission = actor ? actor.data.permission[game.userId] || 0 : null;

        if (!actor || actorPermission === null || actorPermission < CONST.ENTITY_PERMISSIONS.OWNER) {
            return;
        }

        const canvasToken = canvas.tokens.get(token._id) || null;
        return canvasToken.control();
    }

    /**
     * Determines if tokens should be deselected when a non-owned Combatant has a turn
     * @param {*} token 
     */
    _checkObserverDeselect(token) {
        const actor = token ? game.actors.get(token.actorId) : null;
        const actorPermission = actor ? actor.data.permission[game.userId] || 0 : null;

        if (actorPermission === null) {
            return;
        }

        if (actorPermission < CONST.ENTITY_PERMISSIONS.OWNER) {
            return canvas.tokens.releaseAll();
        }
    }

    /**
     * Gives XP to the living PCs in the turn tracker based on enemies killed
     * @param {Object} combat -- the combat instance being deleted
     */
    async _giveXP(combat) {
        const defeatedEnemies = combat.turns.filter(object => (!object.actor.isPC && object.defeated && object.token.disposition === -1));
        const players = combat.turns.filter(object => (object.actor.isPC && !object.defeated));
        let experience = 0;
        if (defeatedEnemies.length > 0 && this.addExperience) {
            defeatedEnemies.forEach(enemy => {
                experience += enemy.actor.data.data.details.xp.value;
            });
            if (players.length > 0) {
                const dividedExperience = Math.floor(experience / players.length);
                let experienceMessage = "<b>Experience Awarded!</b> (" + experience + "xp)<p><b>" + dividedExperience + "xp </b> added to:</br>";
                players.forEach(player => {
                    const actor = game.actors.entities.find(actor => actor._id === player.actor.data._id);
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
                    content: experienceMessage,
                    type: CONST.CHAT_MESSAGE_TYPES.OTHER
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
            this._panHandler(tracker, update);
        }

        if (this.settings.selectOnNextTurn) {
            this._selectHandler(tracker, update);
        }
    }

    /**
     * Handler for deleteCombat hook
     * @param {*} combat 
     * @param {*} combatId 
     * @param {*} options 
     * @param {*} userId 
     */
    _hookOnDeleteCombat(combat, combatId, options, userId) {
        if (this.settings.xpModule && game.userId == userId) {
            this._giveXP(combat);
        }

        const tempCombatants = combat.combatants.filter(c => hasProperty(c, "flags." + CUBButler.MODULE_NAME + "." + this.GADGET_NAME + "(temporaryCombatant)"));

        if (this.settings.tempCombatants && tempCombatants.length) {
            this._removeTemporaryCombatants(tempCombatants, combat.scene);
        }  
    }

    /**
     * Handler for deleteCombatant hook
     * @param {*} combat 
     * @param {*} combatId 
     * @param {*} combatantId 
     * @param {*} options 
     */
    _hookOnDeleteCombatant(combat, combatId, combatantId, options) {
        const combatant = combat.combatants.find(c => c._id === combatantId);
        const tokenData = combatant.token.data || null;

        if (hasProperty(tokenData, "flags." + [CUBButler.MODULE_NAME] + "." + [CUB.combatTracker.GADGET_NAME] + "(temporaryCombatant)")) {
            this._removeTemporaryCombatant(combatant, combat.scene);
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

    /**
     * Handler for combat tracker render
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    async _onRenderCombatTracker(app, html, data) {
        if (!game.user.isGM) {
            return;
        }

        const resourceSpans = html.find(".resource");

        if (resourceSpans.length) {
            this._replaceResourceElement(html);
        }

        if (!this.settings.tempCombatants) {
            return;
        }

        const combatantList = html.find("#combat-tracker.directory-list");

        const listItemHtml = `<div class="flexrow"><a class="add-temporary"><i class="fa fa-plus"></i> Add Temporary Combatant</a></div>`

        if (!game.combat || !combatantList.length) {
            return;
        }

        combatantList.append(listItemHtml);

        const button = combatantList.find(".add-temporary")

        button.on("click", event => {
            this._onAddTemporaryCombatant(event);
        });

        // Possible future feature
        /*
        const trackerConfigButton = html.find("a.combat-settings");

        trackerConfigButton.off("click");

        trackerConfigButton.on("click", event => {
            event.preventDefault();

            new CUBCombatTrackerConfig().render(true);
        });

        const trackerSettings = CUBSidekick.getGadgetSetting(CUB.combatTracker.GADGET_NAME + "(" + CUB.combatTracker.SETTINGS_DESCRIPTORS.TrackerConfigSettingsN + ")");

        if (trackerSettings.resource2) {

        }
        */
    }

    /**
     * Replaces the default token resource span with a text input
     * @param {*} html 
     */
    _replaceResourceElement(html) {
        // Find all the resource spans
        const resourceSpans = html.find(".resource");


        // Replace the element
        $(resourceSpans).each(function() {
            $(this).replaceWith('<input type="text" name="resource" value="' + $(this).text() + '">');
        });

        const resourceInputs = html.find('input[name="resource"]');
        resourceInputs.on("change", event => this._onChangeResource(event));
    }

    /**
     * Handler for updates to the token resource
     * @param {*} event 
     */
    async _onChangeResource(event) {
        // Get the tracker settings and extract the resource property
        const trackerSettings = game.settings.get("core", Combat.CONFIG_SETTING);
        const resource = trackerSettings.resource;

        // Find the parent list element
        const li = event.target.closest("li");

        // Get the tokenId from the list element
        const tokenId = li.dataset.tokenId;

        // Find the token and update
        const token = canvas.tokens.get(tokenId);
        await token.actor.update({["data." + resource]: event.target.value});
    }

    /**
     * Open the Temporary Combatant form
     * @param {*} event 
     */
    _onAddTemporaryCombatant(event) {
        // spawn a form to enter details
        const temporaryCombatantForm = new CUBTemporaryCombatantForm(this).render(true);
    }

    /**
     * Removes any temporary combatants created by this module
     * @param {*} combatants 
     * @param {*} scene 
     */
    _removeTemporaryCombatants(combatants, scene) {
        
        const tokenIds = combatants.map(c => c.tokenId);
        const actorIds = combatants.map(c => c.actor._id);

        if (tokenIds) {
            scene.deleteManyEmbeddedEntities("Token", tokenIds);
        }
        
        if (actorIds) {
            Actor.deleteMany(actorIds);
        }
        
    }

    /**
     * Removes a single temporary combatant created by this module
     * @param {*} combatant 
     * @param {*} scene 
     */
    _removeTemporaryCombatant(combatant, scene) {
        const tokenId = combatant.tokenId;
        const actor = game.actors.get(combatant.actor._id);

        if (tokenId){
            scene.deleteEmbeddedEntity("Token", tokenId);
        }
        
        if (actor){
            actor.delete();
        }
        
    }
}

/**
 * 
 */
class CUBCombatTrackerConfig extends CombatTrackerConfig {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/combat-utility-belt/templates/combat-config.html",
            height: 500
        });
    }

    getData() {
        return mergeObject(super.getData, {
            cubSettings: CUBSidekick.getGadgetSetting(CUB.combatTracker.GADGET_NAME + "(" + CUB.combatTracker.SETTINGS_DESCRIPTORS.TrackerConfigSettingsN + ")")
        });
    }

    _updateObject(event, formData) {
        super._updateObject(event, formData);

        const icon1 = formData.icon1;
        const resource2 = formData.resource2;
        const icon2 = formData.icon2;

        CUBSidekick.setGadgetSetting(CUB.combatTracker.GADGET_NAME + "(" + CUB.combatTracker.SETTINGS_DESCRIPTORS.TrackerConfigSettingsN + ")", {
            icon1: icon1,
            resource2: resource2,
            icon2: icon2
        });
    }
}

/**
 * 
 */
class CUBTemporaryCombatantForm extends FormApplication {
    constructor(object, options) {
        super(object, options);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "temporary-combatant-form",
            title: "Temporary Combatant",
            template: "modules/combat-utility-belt/templates/temporary-combatant-form.html",
            classes: ["sheet"],
            width: 500,
            height: "auto",
            resizable: true
        });
    }

    async _updateObject(event, formData) {
        const folderName = "Temporary Combatants";
        let folder = game.folders.entities.find(f => f.name === folderName);
        if (!folder) {
            folder = await Folder.create({name: "Temporary Combatants", type: "Actor", parent: null}, {displaySheet: false});
        }

        const actor = await Actor.create({
            name: formData.name, 
            type:"npc",
            img: formData.icon,
            folder: folder.id,
            flags: {
                [CUBButler.MODULE_NAME + "." + CUB.combatTracker.GADGET_NAME + "(temporaryCombatant)"]: true
            }
        },{displaySheet: false});

        const tokenData = duplicate(actor.data.token);
        tokenData.x = 0;
        tokenData.y = 0;
        tokenData.disposition = 0;
        tokenData.img = formData.icon;
        const token = await Token.create(game.scenes.active._id, tokenData);

        const combatant = await game.combat.createEmbeddedEntity("Combatant", {
            tokenId: token._id, 
            hidden: formData.hidden, 
            initiative: formData.init,
            flags: {
                [CUBButler.MODULE_NAME + "." + CUB.combatTracker.GADGET_NAME + "(temporaryCombatant)"]: true
            }
        });
        
    }
}

/**
 * 
 */
class CUBAnimatedDie {
    _onRenderRollInitiative(app, html, data) {
        this.html = html;
        this.die = html.find(".die");
        this.sides = 20;
        this.initialSide = 1;
        this.lastFace = null;
        this.timeoutId = null;
        this.transitionDuration = 300;
        this.animationDuration = 1000;
      
        const listItemHref = html.find("ul > li > a");

        listItemHref.on("click", event => {
            this.reset();
            this.rollTo($(listItemHref).attr("href"));
      
            return false;
        });

        this.roll();
    }
    
    /**
     * Return a random face
     */
    randomFace() {
        const face = Math.floor(Math.random() * this.sides) + this.initialSide;
        return face;
    }

    /**
     * 
     * @param {*} face 
     */
    rollTo(face) {
        clearTimeout(this.timeoutId);

        const listItemHref = this.html.find("ul > li > a");
        const faceHref = this.html.find("[href=" + face + "]");

        listItemHref.removeClass("active");
        faceHref.addClass("active");

        this.die.attr("data-face", face);
    }

    /**
     * Reset the die
     */
    reset() {
        this.die.attr("data-face", null).removeClass("rolling");
    }

    /**
     * Roll the die
     */
    roll() {
        this.die.addClass("rolling");
        clearTimeout(this.timeoutId);

        this.timeoutId = setTimeout(() => {
            this.die.removeClass("rolling");

            this.rollTo(20);
        }, this.animationDuration);

        return false;
    }
}

class CUBCombatCarousel extends Application {
    constructor(options={}) {
        super(options);

        Hooks.once("renderCUBCombatCarousel", (app, html, data) => {
            const wrapperDiv = html.find(".wrapper");

            $(wrapperDiv).slick({
                centerMode: true,
                centerPadding: '60px',
                slidesToShow: 3,
                responsive: [
                  {
                    breakpoint: 768,
                    settings: {
                      arrows: false,
                      centerMode: true,
                      centerPadding: '40px',
                      slidesToShow: 3
                    }
                  },
                  {
                    breakpoint: 480,
                    settings: {
                      arrows: true,
                      centerMode: true,
                      centerPadding: '40px',
                      slidesToShow: 1
                    }
                  }
                ]
            });

            return;
        });
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/combat-utility-belt/templates/combat-carousel.html",
            height: 300,
            width: 1000,
            id: "cub-combat-carousel",
            popOut: false,
            title: "Combat Carousel"
        });
    }

    getData() {
        return {
            combatants: game.combat.combatants
        } 
    }

    _activateListeners() {
        super._activateListeners();


    }
}

class CUBTokenUtility {
    constructor() {
        this.settings = {
            mightySummoner: CUBSidekick.initGadgetSetting(CUBTokenUtility.GADGET_NAME + "(" + CUBTokenUtility.SETTINGS_DESCRIPTORS.MightySummonerN + ")", this.SETTINGS_META.mightySummoner),
            autoRollHostileHp: CUBSidekick.initGadgetSetting(CUBTokenUtility.GADGET_NAME + "(" + CUBTokenUtility.SETTINGS_DESCRIPTORS.AutoRollHostileHpN + ")", this.SETTINGS_META.autoRollHostileHp),
            tokenEffectSize: CUBSidekick.initGadgetSetting(CUBTokenUtility.GADGET_NAME + "(" + CUBTokenUtility.SETTINGS_DESCRIPTORS.TokenEffectSizeN + ")", this.SETTINGS_META.tokenEffectSize)
        };
    }

    static get GADGET_NAME() {
        return "token-utility";
    }

    static get SETTINGS_DESCRIPTORS() {
        return {
            MightySummonerN: "--Mighty Summoner--",
            MightySummonerH: "Automatically check to see if token owner of NEUTRAL actor also owns an actor with the Mighty Summoner feat. Automatically calculates and adds new HP formula and rolls HP for token on canvas drop",
            AutoRollHostileHpN: "--Auto Roll Hostile--",
            AutoRollHostileHpH: "Automatically roll hp for hostile tokens on canvas drop",
            TokenEffectSizeN: "--Token Effect Size--",
            TokenEffectSizeH: "Sets the size for token effects when drawn on the token. Default: Small"
        };
    }

    static get DEFAULT_CONFIG() {
        return {
            mightySummoner: false,
            AutoRollHostileHp: false,
            tokenEffectSize: {
                large: {
                    multiplier: 4,
                    divisor: 2
                },
                medium: {
                    multiplier: 3,
                    divisor: 3
                },
                small: {
                    multiplier: 2,
                    divisor: 5
                }
            },
            tokenEffectSizeChoices: {
                large: "Large",
                medium: "Medium",
                small: "Small"
            }
        };
    }

    get SETTINGS_META() {
        return {
            mightySummoner: {
                name: CUBTokenUtility.SETTINGS_DESCRIPTORS.MightySummonerN,
                hint: CUBTokenUtility.SETTINGS_DESCRIPTORS.MightySummonerH,
                default: CUBTokenUtility.DEFAULT_CONFIG.mightySummoner,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.mightySummoner = s;
                }
            },
            autoRollHostileHp: {
                name: CUBTokenUtility.SETTINGS_DESCRIPTORS.AutoRollHostileHpN,
                hint: CUBTokenUtility.SETTINGS_DESCRIPTORS.AutoRollHostileHpH,
                default: CUBTokenUtility.DEFAULT_CONFIG.autoRollHostileHp,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.autoRollHostileHp = s;
                }
            },
            tokenEffectSize: {
                name: CUBTokenUtility.SETTINGS_DESCRIPTORS.TokenEffectSizeN,
                hint: CUBTokenUtility.SETTINGS_DESCRIPTORS.TokenEffectSizeH,
                default: CUBSidekick.getKeyByValue(CUBTokenUtility.DEFAULT_CONFIG.tokenEffectSizeChoices, CUBTokenUtility.DEFAULT_CONFIG.tokenEffectSizeChoices.small),
                scope: "client",
                type: String,
                choices: CUBTokenUtility.DEFAULT_CONFIG.tokenEffectSizeChoices,
                config: true,
                onChange: s => {
                    this.settings.tokenEffectSize = s;
                    Token.prototype.drawEffects = CUBTokenUtility._patchDrawEffects;
                    canvas.draw();
                }
            }
        };
    }

    /**
     * 
     * @param {*} token 
     * @param {*} sceneId 
     */
    _summonerFeats(token, scene) {
        if (!game.user.isGM) {
            return;
        }

        // If the token actor doesn't have the feat, check the other actors owned by the token's owner
        if (token.actor && !this._actorHasFeat(token.actor)) {
            //console.log("Summoner feats "); console.log(token)
            
            const owners = Object.keys(token.actor.data.permission).filter(p => p !== "default" && token.actor.data.permission[p] === CONST.ENTITY_PERMISSIONS.OWNER);

            if (!owners) {
                return;
            }

            let actors;

            owners.forEach(owner => {
                const owned = game.actors.entities.filter(actor => hasProperty(actor, "data.permission." + owner));
                if (actors === undefined) {
                    actors = owned;
                } else {
                    actors.push(owned);
                }
            });

            if (!actors) {
                return;
            }

            const summoners = actors.find(actor => this._actorHasFeat(actor));

            if (!summoners) {
                return;
            }

            new Dialog({
                title: "Feat Summoning",
                content: "<p>Mighty Summoner found. Is this monster being summoned?</p>",
                buttons: {
                    yes: {
                        icon: `<i class="fas fa-check"></i>`,
                        label: "Yes",
                        callback: () => {
                            let actor = token.actor;
                            let formula = actor.data.data.attributes.hp.formula;
                            const match = formula.match(/\d+/)[0];
                            if (match !== undefined) {
                                formula += " + " + (match * 2);
                                actor.data.data.attributes.hp.formula = formula;
                                token.actorData = {
                                    data: {
                                        attributes: {
                                            hp: {
                                                formula: formula,
                                            }
                                        }
                                    }
                                };
                                this._rerollTokenHp(token, scene);
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

    /**
     * 
     * @param {*} actor 
     */
    _actorHasFeat(actor) {
        return !!actor.items.find(i => i.type === "feat" && i.name.includes("Mighty Summoner"));
    }

    /**
     * 
     * @param {*} token 
     * @param {*} sceneId 
     */
    _rerollTokenHp(token, scene) {
        const formula = token.actor.data.data.attributes.hp.formula;

        let r = new Roll(formula);
        r.roll();
        const hp = r.total;

        const update = {
            _id: token.id,
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

        scene.updateEmbeddedEntity("Token", update);
    }

    /**
     * Hook on token create
     * @param {Object} token 
     * @param {String} sceneId 
     * @param {Object} update 
     * @todo move this to a preCreate hook to avoid a duplicate call to the db
     */
    _hookOnCreateToken(scene, sceneId, tokenData, options, userId) {
        const token = new Token(tokenData);

        if (tokenData.disposition === -1 && this.settings.autoRollHostileHp && token.actor && !token.actor.isPC) {
            this._rerollTokenHp(token, scene);
        } else if (this.settings.mightySummoner) {
            this._summonerFeats(token, scene);
        }
    }

    /**
     * 
     */
    static _patchDrawEffects() {
        let effectSize; 
        
        try {
            effectSize = CUBSidekick.getGadgetSetting(CUBTokenUtility.GADGET_NAME + "(" + CUBTokenUtility.SETTINGS_DESCRIPTORS.TokenEffectSizeN + ")") 
        } catch (e) {
            console.warn(e);
            effectSize = null;
        }


        // Use the default values if no setting found
        const multiplier = effectSize ? CUBTokenUtility.DEFAULT_CONFIG.tokenEffectSize[effectSize].multiplier : 2;
        const divisor = effectSize ? CUBTokenUtility.DEFAULT_CONFIG.tokenEffectSize[effectSize].divisor : 5;

        this.effects.removeChildren().forEach(c => c.destroy());

        // Draw status effects
        if (this.data.effects.length > 0 ) {

            // Determine the grid sizing for each effect icon
            let w = Math.round(canvas.dimensions.size / 2 / 5) * multiplier;

            // Draw a background Graphics object
            let bg = this.effects.addChild(new PIXI.Graphics()).beginFill(0x000000, 0.40).lineStyle(1.0, 0x000000);

            // Draw each effect icon
            this.data.effects.forEach((src, i) => {
                let tex = PIXI.Texture.from(src, { scale: 1.0 });
                let icon = this.effects.addChild(new PIXI.Sprite(tex));
                icon.width = icon.height = w;
                icon.x = Math.floor(i / divisor) * w;
                icon.y = (i % divisor) * w;
                bg.drawRoundedRect(icon.x + 1, icon.y + 1, w - 2, w - 2, 2);
                this.effects.addChild(icon);
            });
        }

        // Draw overlay effect
        if ( this.data.overlayEffect ) {
            let tex = PIXI.Texture.from(this.data.overlayEffect, { scale: 1.0 });
            let icon = new PIXI.Sprite(tex),
                size = Math.min(this.w * 0.6, this.h * 0.6);
            icon.width = icon.height = size;
            icon.position.set((this.w - size) / 2, (this.h - size) / 2);
            icon.alpha = 0.80;
            this.effects.addChild(icon);
        }
    }
}

class CUBActorUtility {
    constructor() {
        this.actor = null;
    }

    _onRenderActorSheet(app, html, data) {
        this.actor = app.entity;
        const initiative = html.find(".initiative");

        if (initiative.length === 0) {
            return;
        }

        const heading = initiative.find("h4").first();

        if (heading.length === 0) {
            return;
        }

        heading.addClass("rollable");

        heading.on("click", event => {

            this._onClickInitiative(event);
        });
    }

    async _onClickInitiative(event) {
        if ( !game.combat ) {
            if ( game.user.isGM ) {
                await Combat.create({scene: canvas.scene._id, active: true});
            } else {
                return ui.notification.warn("GM must create an encounter before you can roll initiative");
            }
        } 

        const tokens = this.actor.getActiveTokens();

        if (!tokens) {
            return;
        }

        const tokensToAdd = tokens.filter(t => t.inCombat === false);
        const createData = tokensToAdd.map(t => {return {tokenId: t.id, hidden: t.data.hidden}});

        const combatants = await game.combat.createManyEmbeddedEntities("Combatant", createData);

        if (!combatants) {
            return;
        }

        const combatantsToRoll = combatants.map(c => c._id);

        if (!combatantsToRoll) {
            return;
        }

        await game.combat.rollInitiative(combatantsToRoll);
        
    }
}

/**
 * Start the module
 */
CUBSignal.lightUp();
