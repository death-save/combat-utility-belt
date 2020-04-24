import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";

export const NAME = "combat-utility-belt";

export const TITLE = "Combat Utility Belt";

export const SHORTNAME = "cub";

export const PATH = "modules/combat-utility-belt";

export const GADGET_NAMES = {
    enhancedConditions: "enhancedConditions",
    hideNames: "hideNames",
    rerollInitiative: "rerollInitiative",
    concentrator: "concentrator"
}
/**
 * Stores information about well known game systems. All other systems will resolve to "other"
 */
export const KNOWN_GAME_SYSTEMS = {
    dnd5e: {
        id: "dnd5e",
        name: "Dungeons & Dragons 5th Edition",
        concentrationAttribute: "con",
        healthAttribute: "attributes.hp",
        initiative: "attributes.initiative",
        conditionMap: true
    },
    pf1: {
        id: "pf1",
        name: "Pathfinder",
        concentrationAttribute: "",
        healthAttribute: "attributes.hp",
        initiative: "attributes.init.total",
        conditionMap: true
    },
    pf2e: {
        id: "pf2e",
        name: "Pathfinder 2nd Edition",
        concentrationAttribute: "",
        healthAttribute: "attributes.hp",
        initiative: "attributes.perception",
        conditionMap: true
    },
    wfrp4e: {
        id: "wfrp4e",
        name: "Warhammer Fantasy Roleplaying Game 4th Edition",
        concentrationAttribute: "",
        healthAttribute: "status.wounds",
        initiative: "characteristics.i",
        conditionMap: false
    },
    archmage: {
        id: "archmage",
        name: "13th Age",
        concentrationAttribute: "",
        healthAttribute: "attributes.hp",
        initiative: "attributes.init.mod",
        conditionMap: false
    },
    other: {
        id: "other",
        name: "Custom/Other",
        concentrationAttribute: "con",
        healthAttribute: "health",
        initiative: "initiative",
        conditionMap: false
    }
} 
     
export const HEALTH_STATES = {
    HEALTHY: "healthy",
    INJURED: "injured",
    DEAD: "dead",
    UNCONSCIOUS: "unconscious"
}

export const DEFAULT_CONFIG = {
    concentrator: {
        enable: false,
        outputChat: false,
        promptRoll: false,
        autoConcentrate: false,
        notifyDouble: {
            none: "None",
            gm: "GM Only",
            all: "Everyone"
        },
        icon: "modules/combat-utility-belt/icons/concentrating.svg",
        alias: "CUB: Concentrator"
    },
    enhancedConditions: {
        iconPath: `${PATH}/icons/`,
        conditionMapsPath: `${PATH}/condition-maps`,
        outputChat: false,
        removeDefaultEffects: false,
        conditionLab: {
            id: "cub-condition-lab",
            title: "Condition Lab",
        },
        title: "CUB: Enhanced Conditions",
        mapTypes: {
            default: "System - Default",
            custom: "System - Custom",
            other: "Other"
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
            chatOutput: `${PATH}/templates/chat-conditions.html`,
            importDialog: `${PATH}/templates/import-conditions.html`
        }
    },
    giveXP: {
        enable: false
    },
    hideNames: {
        enable: false,
        hideFooter: false,
        replacementString: "Unknown Creature"
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
        flags: {
            mightySummoner: "mightySummoner"
        }
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
    tokenUtility: {
        autoRollHP: false,
        effectSize: {
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
        effectSizeChoices: {
            large: "Large",
            medium: "Medium",
            small: "Small"
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
            macroTriggerSelect: `${PATH}/templates/trigger-select.html`
        }
        
    }
}

export const FLAGS = {
    temporaryCombatants: {
        temporaryCombatant: "temporaryCombatant"
    }
}

export const SETTING_KEYS = {
    concentrator: {
        enable: "enableConcentrator",
        icon: "modules/combat-utility-belt/icons/concentrating.svg",
        outputChat: "concentratorOutputToChat",
        autoConcentrate: "autoConcentrate",
        concentrationAttribute: "concentrationAttribute",
        notifyDouble: "notifyDoubleConcentration",
        healthAttribute: "concentratorHealthAttribute", //validate necessity
        prompt: "concentratorPromptPlayer"
    },
    enhancedConditions: {
        enable: "enableEnhancedConditions",
        coreIcons: "coreStatusIcons",
        system: "activeSystem",
        map: "activeConditionMap",
        defaultMaps: "defaultConditionMaps",
        mapType: "conditionMapType",
        removeDefaultEffects: "removeDefaultEffects",
        output: "conditionsOutputToChat"
    },
    giveXP: {
        enable: "enableGiveXP"
    },
    hideNames: {
        enable: "enableHideNames",
        replacementString: "replacementString",
        hideFooter: "hideFooter"
    },
    injuredDead: {
        enableInjured: "enableInjured",
        enableDead: "enableDead",
        enableUnconscious: "enableUnconscious",
        injuredIcon: "injuredIcon",
        deadIcon: "deadIcon",
        unconsciousIcon: "unconsciousIcon",
        threshold: "injuredThreshold",
        healthAttribute: "healthAttribute",
        markDefeated: "markDefeated",
        unconsciousActorType: "unconsciousActorType"
    },
    mightySummoner: {
        enable: "enableMightySummoner"
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
        enable: "enableTempCombatants",

    },
    tokenUtility: {
        mightySummoner: "enableMightySummoner",
        autoRollHP: "autoRollHP",
        effectSize: "effectSize"
    },
    triggler: {
        triggers: "storedTriggers"
    }
}

