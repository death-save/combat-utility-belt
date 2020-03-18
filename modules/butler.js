
export const MODULE_NAME = "combat-utility-belt";

export const MODULE_TITLE = "Combat Utility Belt";

/**
 * Stores information about well known game systems. All other systems will resolve to "other"
 */
export const DEFAULT_GAME_SYSTEMS = {
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
     
export const HEALTH_STATES = {
    HEALTHY: "healthy",
    INJURED: "injured",
    DEAD: "dead",
    UNCONSCIOUS: "unconscious"
}

export const DEFAULT_CONFIG = {

}

export const SETTING_KEYS = {
    
}