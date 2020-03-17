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
            conditionLab: "CUB: Condition Lab",
            enhancedConditions: "CUB Enhanced Conditions"
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
        if (!this.settings.enhancedConditions || !game.user.isGM || (game.users.get(userId).isGM && !game.userId === userId)) {
            return;
        }

        //console.log(token,sceneId,update);
        let effects = update.effects;

        if (!effects || effects.length === 0) {
            return;
        }

        //If the update has effects in it, lookup mapping and set the current token
        this.currentToken = canvas.tokens.get(update._id);
        return this.lookupEntryMapping(effects);
    }

    /**
     * Hooks on token updates. If the update includes effects, calls the journal entry lookup
     */
    _hookOnPreUpdateToken(scene, sceneID, update, options) {
        if (!this.settings.enhancedConditions) {
            return;
        }

        //console.log(token,sceneId,update);
        let effects = update.effects;

        if (!effects || effects.length === 0) {
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
        const conditionEntries = this.map.filter(row => {
            const [c, i, j] = row;
            return icons.includes(i) ? true : false;
        });

        if (conditionEntries.length === 0) {
            return;
        }

        return this.outputChatMessage(conditionEntries);
    }

    /**
     * Output condition entries to chat
     */
    async outputChatMessage(entries) {
        const chatUser = game.userId;
        const token = this.currentToken;
        const chatType = CONST.CHAT_MESSAGE_TYPES.OTHER;

        let tokenSpeaker = ChatMessage.getSpeaker({token});
        let chatContent;

        if (entries.length === 0) {
            return;
        }

        //create some boiler text for prepending to the conditions array
        chatContent = `<h3>${this.DEFAULT_CONFIG.enhancedConditions}</h3><p>${tokenSpeaker.alias} is:</p><ul class="chat-message condition-list">`;

        const chatConditions = entries.map(row => {
            const [condition, icon, journalId] = row;
            return `<li>${icon ? `<img src="${icon}" class="icon chat-message" title="${condition}">` : ""}${journalId.trim() ? `@JournalEntry[${journalId}]` : ` ${condition}`}</li>`
        })

        if (chatConditions.length === 0) {
            return;
        }

        //add the conditions to the boiler text
        chatContent += `${chatConditions.join("")}</ul>`;

        return await ChatMessage.create({
            speaker: tokenSpeaker,
            content: chatContent,
            type: chatType,
            user: chatUser
        });
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