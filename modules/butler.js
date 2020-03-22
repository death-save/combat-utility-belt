import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions";

export const NAME = "combat-utility-belt";

export const TITLE = "Combat Utility Belt";

export const SHORTNAME = "cub";

export const PATH = "modules/combat-utility-belt";

export const GADGET_NAMES = {
    enhancedConditions: "enhancedConditions",
    hideNPCNames: "hideNPCNames",
    rerollInitiative: "rerollInitiative",
    concentrator: "concentrator"
}
/**
 * Stores information about well known game systems. All other systems will resolve to "other"
 */
export const DEFAULT_GAME_SYSTEMS = {
    dnd5e: {
        id: "dnd5e",
        name: "Dungeons & Dragons 5th Edition",
        concentrationAttribute: "con",
        healthAttribute: "attributes.hp",
        initiative: "attributes.initiative"
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
    other: {
        id: "other",
        name: "Custom/Other",
        concentrationAttribute: "con",
        healthAttribute: "health",
        initiative: "initiative"
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
            title: "CUB: Condition Lab",
        },
        title: "CUB: Enhanced Conditions"
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
    temporaryCombatants: {
        enable: false
    },
    tokenUtility: {
        mightySummoner: false,
        autoRollHostileHP: false,
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
    },
    trackerUtility: {
        enableGiveXP: false,
    }
}

export const FLAGS = {
    temporaryCombatants: {
        temporaryCombatant: "temporaryCombatant"
    }
}

export const SETTING_KEYS = {
    concentrator: {
        enable: "enable",
        icon: "modules/combat-utility-belt/icons/concentrating.svg",
        outputChat: "outputToChat",
        autoConcentrate: "autoConcentrate",
        concentrationAttribute: "concentrationAttribute",
        notifyDouble: "notifyDouble",
        healthAttribute: "healthAttribute", //validate necessity
        prompt: "promptPlayer"
    },
    enhancedConditions: {
        enable: "enable",
        system: "activeSystem",
        map: "activeConditionMap",
        maps: "conditionMaps",
        removeDefaultEffects: "removeDefaultEffects",
        output: "outputToChat"
    },
    hideNames: {
        enable: "enable",
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
   
    temporaryCombatants: {
        enable: "enable",

    },
    tokenUtility: {
        mightySummoner: "enableMightySummoner",
        autoRollHP: "autoRollHP",
        effectSize: "effectSize"

    },
    trackerUtility: {
        enableGiveXP: "enableGiveXP",
    }   
}

