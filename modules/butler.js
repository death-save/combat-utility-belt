import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";
import { MightySummoner } from "./mighty-summoner.js";

export const NAME = "combat-utility-belt";

export const TITLE = "Combat Utility Belt";

export const SHORTNAME = "cub";

export const PATH = "modules/combat-utility-belt";

export const WIKIPATH = "https://github.com/death-save/combat-utility-belt/wiki"

export const GADGETS = {
    giveXP: {
        name: "Award XP",
        info: "Provides an end of combat prompt to distribute XP from defeated hostile combatants.",
        wiki: `${WIKIPATH}/award-xp`
    },
    concentrator: {
        name: "Concentrator",
        info: "Manages Concentration in the dnd5e game system.",
        wiki: `${WIKIPATH}/concentrator`
    },
    enhancedConditions: {
        name: "Enhanced Conditions",
        info: "Provides the ability to map Conditions to Status Effect icons",
        wiki: `${WIKIPATH}/enhanced-conditions`
    },
    hideNames: {
        name: "Hide Names",
        info: "Replaces Actor names with a new name of your choice",
        wiki: `${WIKIPATH}/hide-names`
    },
    panSelect: {
        name: "Pan/Select",
        info: "Automatic panning and selection of tokens during combat",
        wiki: `${WIKIPATH}/pan-select`
    },
    rerollInitiative: {
        name: "Reroll Initiative",
        info: "Rerolls Initiative on each Combat round change",
        wiki: `${WIKIPATH}/reroll-initiative`
    },
    tempCombatants: {
        name: "Temporary Combatants",
        info: "Allows the creation of temporary combatants to track things like environmental or lair actions",
        wiki: `${WIKIPATH}/temporary-combatants`
    },
    triggler: {
        name: "Triggler",
        info: "A trigger-management system for token/actor attribute changes",
        wiki: `${WIKIPATH}/triggler`
    },
    actorUtility: {
        name: "Misc Actor",
        info: "Miscellaneous Actor enhancements",
        wiki: `${WIKIPATH}/actor-misc`
    },
    tokenUtility: {
        name: "Misc Token",
        info: "Miscellaneous Token enhancements",
        wiki: null
    }
}
/**
 * Stores information about well known game systems. All other systems will resolve to "other"
 * Keys must match id
 */
export const KNOWN_GAME_SYSTEMS = {
    dnd5e: {
        id: "dnd5e",
        name: "Dungeons & Dragons 5th Edition",
        concentrationAttribute: "con",
        healthAttribute: "attributes.hp",
        initiative: "attributes.initiative"
    },
    pf1: {
        id: "pf1",
        name: "Pathfinder",
        concentrationAttribute: "",
        healthAttribute: "attributes.hp",
        initiative: "attributes.init.total"
    },
    pf2e: {
        id: "pf2e",
        name: "Pathfinder 2nd Edition",
        concentrationAttribute: "",
        healthAttribute: "attributes.hp",
        initiative: "attributes.perception"
    },
    wfrp4e: {
        id: "wfrp4e",
        name: "Warhammer Fantasy Roleplaying Game 4th Edition",
        concentrationAttribute: "",
        healthAttribute: "status.wounds",
        initiative: "characteristics.i"
    },
    archmage: {
        id: "archmage",
        name: "13th Age",
        concentrationAttribute: "",
        healthAttribute: "attributes.hp",
        initiative: "attributes.init.mod"
    },
    ironclaw2e: {
        id: "ironclaw2e",
        name: "Ironclaw Second Edition",
        concentrationAttribute: "",
        healthAttribute: "",
        initiative: ""
    },
    "cyberpunk-red-core": {
        id: "cyberpunk-red-core",
        name: "Cyberpunk Red Core"
    },
    other: {
        id: "other",
        name: "Custom/Other",
        concentrationAttribute: "--Unknown--",
        healthAttribute: "--Unknown--",
        initiative: "--Unknown--"
    }
} 
     
export const HEALTH_STATES = {
    HEALTHY: "healthy",
    INJURED: "injured",
    DEAD: "dead",
    UNCONSCIOUS: "unconscious"
}

export const DEFAULT_CONFIG = {
    aboutApp: {
        title: "About Combat Utility Belt"
    },
    concentrator: {
        conditionName: "Concentrating",
        enable: false,
        outputChat: false,
        promptRoll: false,
        autoConcentrate: false,
        autoEndConcentration: false,
        notifyConcentration: {
            none: "No one",
            gm: "GM & Owner/s",
            all: "Everyone"
        },
        notifyConcentrationCheck: {
            none: "No one",
            gm: "GM & Owner/s",
            all: "Everyone"
        },
        notifyDouble: {
            none: "No one",
            gm: "GM & Owner/s",
            all: "Everyone"
        },
        notifyEndConcentration: {
            none: "No one",
            gm: "GM & Owner/s",
            all: "Everyone"
        },
        icon: "modules/combat-utility-belt/icons/concentrating.svg",
        alias: "Concentrator",
        concentrationStatuses: {
            breaking: "breaking",
            active: "active",
            broken: "broken"
        },
        messageVisibility: {
            gmOwner: "GM And Owner",
            all: "All"
        }
    },
    cubPuter: {
        id: "cub-puter",
        title: "CUBPuter",
        buttonId: "cub-puter-button",
        config: {
            crt: true,
            terminal: false,
            startup: false,
            greeting: false,
            instructions: false,
            info: true
        }
    },
    enhancedConditions: {
        iconPath: `${PATH}/icons/`,
        conditionMapsPath: `${PATH}/condition-maps`,
        outputChat: false,
        outputCombat: false,
        removeDefaultEffects: false,
        conditionLab: {
            id: "cub-condition-lab",
            title: "Condition Lab",
        },
        macroConfig: {
            id: "cub-enhanced-condition-macro-config",
            title: "CUB Enhanced Condition - Macro Config"
        },
        triggerConfig: {
            id: "cub-enhanced-condition-trigger-config",
            title: "CUB Enhanced Condition - Trigger Config"
        },
        optionConfig: {
            id: "cub-enhanced-condition-option-config",
            title: "CUB Enhanced Condition - Option Config"
        },
        title: "Enhanced Conditions",
        mapTypes: {
            default: "System - Default",
            custom: "System - Custom",
            other: "Other/Imported"
        },
        referenceTypes: [
            {
                id: "journalEntry",
                name: "Journal",
                icon: `fas fa-book-open`
            },
            {
                id: "compendium.journalEntry",
                name: "Journal (C)",
                icon: `fas fa-atlas`
            },
            {
                id: "item",
                name: "Item",
                icon: `fas fa-suitcase`
            },
            {
                id: "compendium.item",
                name: "Item (C)",
                icon: `fas fa-suitcase`
            }
        ],
        templates: {
            conditionLab: `${PATH}/templates/condition-lab.hbs`,
            chatOutput: `${PATH}/templates/chat-conditions.hbs`,
            chatConditionsPartial: `${PATH}/templates/partials/chat-card-condition-list.hbs`,
            importDialog: `${PATH}/templates/import-conditions.html`,
            macroConfig: `${PATH}/templates/enhanced-condition-macro-config.hbs`,
            triggerConfig: `${PATH}/templates/enhanced-condition-trigger-config.hbs`,
            optionConfig: `${PATH}/templates/enhanced-condition-option-config.hbs`
        },
        migrationVersion: "",
        specialStatusEffects: {
            blinded: {
                optionProperty: "blindToken"
            },
            invisible: {
                optionProperty: "markInvisible"
            }
        }
    },
    giveXP: {
        enable: false,
        modifier: 1
    },
    hideNames: {
        enable: false,
        enableHostile: false,
        enableNeutral: false,
        enableFriendly: false,
        hideFooter: false,
        hideNameParts: false,
        hostileNameReplacement: "Unknown Creature",
        neutralNameReplacement: "Unknown Creature",
        friendlyNameReplacement: "Unknown Creature",
        hostileIcon: "far fa-angry",
        neutralIcon: "far fa-meh",
        friendlyIcon: "far fa-smile",
        actorForm: {
            id: "hide-names-actor",
            title: "Hide Name"
        }
    },
    injuredDead: {
        enableInjured: false,
        enableDead: false,
        enableUnconscious: false,
        injuredIcon: "icons/svg/blood.svg",
        threshold: 50,
        deadIcon: "icons/svg/skull.svg",
        markDefeated: false,
        unconsciousActorType: "",
        unconsciousIcon: "icons/svg/unconscious.svg"
    },
    mightySummoner: {
        enable: false,
        featName: "Mighty Summoner",
        promptGm: false
    },
    panSelect: {
        enablePan: false,
        enableSelect: false,
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
        selectGM: false,
        selectPlayers: false,
        observerDeselect: false,
    },
    rerollInitiative: {
        enable: false,
        rerollTempCombatants: false
    },
    tempCombatants: {
        enable: false
    },
    actorUtility: {
        initiativeFromSheet: false
    },
    tokenUtility: {
        autoRollHP: false,
        hideAutoRoll: false,
        effectSize: {
            xLarge: {
                multiplier: 5,
                divisor: 2
            },
            large: {
                multiplier: 3.3,
                divisor: 3
            },
            medium: {
                multiplier: 2.5,
                divisor: 4
            },
            small: {
                multiplier: 2,
                divisor: 5
            }
        },
        effectSizeChoices: {
            "small": "Small (Default) - 5x5",
            "medium": "Medium - 4x4",
            "large": "Large - 3x3",
            "xLarge": "Extra Large - 2x2"
        }
    },
    trackerUtility: {
        enableGiveXP: false,
    },
    triggler: {
        form: {
            title: "Triggler"
        },
        flags: {
            macro: "macroTrigger"
        },
        operators: {
            eq: "=",
            lt: "<",
            ne: "!=",
            lteq: "<=",
            gt: ">",
            gteq: ">="
        },
        options: {
            percent: "%"
        },
        templatePaths: {
            macroTriggerSelect: `${PATH}/templates/trigger-select.html`,
            trigglerButton: `${PATH}/templates/triggler-button.hbs`
        }
        
    }
}

export const FLAGS = {
    concentrator: {
        chatMessage: "concentratorChatMessageParsed",
        damageTaken: "damageWasTaken",
        damageAmount: "damageAmount",
        isDead: "isDead",
        updateProcessed: "concentrationUpdateProcessed",
        concentrationSpell: "concentrationSpell"
    },
    enhancedConditions: {
        conditionId: "conditionId",
        overlay: "overlay"
    },
    giveXP: {
        deselectByDefault: "deselectByDefault"
    },
    mightySummoner: {
        mightySummoner: "mightySummoner"
    },
    temporaryCombatants: {
        temporaryCombatant: "temporaryCombatant"
    },
    hideNames: {
        enable: "enableHideName",
        replacementType: "hideNameReplacementType",
        replacementName: "hideNameReplacement"
    },
    panSelect: {
        shouldPan: "shouldPan",
        shouldSelect: "shouldSelect"
    }
}

export const SETTING_KEYS = {
    aboutApp: {
        menu: "aboutApp"
    },
    concentrator: {
        enable: "enableConcentrator",
        conditionName: "concentratorConditionName",
        outputChat: "concentratorOutputToChat",
        autoConcentrate: "autoConcentrate",
        autoEndConcentration: "autoEndConcentration",
        concentrationAttribute: "concentrationAttribute",
        notifyConcentration: "notifyConcentration",
        notifyConcentrationCheck: "notifyConcentrationCheck",
        notifyDouble: "notifyDoubleConcentration",
        notifyEndConcentration: "notifyEndConcentration",
        healthAttribute: "concentratorHealthAttribute", //validate necessity
        prompt: "concentratorPromptPlayer",
        hideNpcConcentration: "hideNPCConcentration"
    },
    cubPuter: {
        menu: "cubPuter",
        config: "cubPuterConfig"
    },
    enhancedConditions: {
        enable: "enableEnhancedConditions",
        coreIcons: "coreStatusIcons",
        coreEffects: "coreStatusEffects",
        system: "activeSystem",
        map: "activeConditionMap",
        defaultMaps: "defaultConditionMaps",
        mapType: "conditionMapType",
        removeDefaultEffects: "removeDefaultEffects",
        outputChat: "conditionsOutputToChat",
        outputCombat: "conditionsOutputDuringCombat",
        suppressPreventativeSaveReminder: "conditionsSuppressPreventativeSaveReminder",
        migrationVersion: "enhancedConditionsMigrationVersion",
        showSortDirectionDialog: "showSortDirectionDialog",
        defaultSpecialStatusEffects: "defaultSpecialStatusEffects",
        specialStatusEffectMapping: "specialStatusEffectMapping"
    },
    giveXP: {
        enable: "enableGiveXP",
        modifier: "giveXpModifier"
    },
    hideNames: {
        enable: "enableHideNPCNames",
        enableHostile: "enableHideHostileNames",
        enableNeutral: "enableHideNeutralNames",
        enableFriendly: "enableHideFriendlyNames",
        hostileNameReplacement: "hostileNameReplacement",
        neutralNameReplacement: "neutralNameReplacement",
        friendlyNameReplacement: "friendlyNameReplacement",
        hideFooter: "hideFooter",
        hideParts: "hideNameParts"
    },
    panSelect: {
        enablePan: "enablePan",
        panGM: "panGM",
        panPlayers: "panPlayers",
        enableSelect: "enableSelect",
        selectGM: "selectGM",
        selectPlayers: "selectPlayers",
        observerDeselect: "observerDeselect"
    },
    rerollInitiative: {
        enable: "enableRerollInitiative",
        rerollTemp: "rerollTempCombatants"
    },
   
    tempCombatants: {
        enable: "enableTempCombatants"
    },
    actorUtility: {
        initiativeFromSheet: "initiativeFromSheet"
    },
    tokenUtility: {
        mightySummoner: "enableMightySummoner",
        mightySummonerFeat: "mightySummonerFeatName",
        mightySummonerPromptGm: "mightySummonerPromptGm",
        autoRollHP: "autoRollHP",
        hideAutoRoll: "hideAutoRollHP",
        effectSize: "effectSize"
    },
    triggler: {
        triggers: "storedTriggers"
    }
}

