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