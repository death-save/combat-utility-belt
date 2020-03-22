import * as BUTLER from "./butler.js";
/**
 * Provides helper methods for use elsewhere in the module (and has your back in a melee)
 */
export class Sidekick {
    static createCUBDiv(html) {

        const cubDiv = $(
            `<div id="combat-utility-belt">
                    <h4>Combat Utility Belt</h4>
                </div>`
        );

        const setupButton = html.find("button[data-action='setup']");
        setupButton.after(cubDiv);

    }

    static getSetting(key) {
        return game.settings.get(BUTLER.SHORTNAME, key);
    }

    static async setSetting(key, value, awaitResult=false) {
        return awaitResult ? 
            await game.settings.set(BUTLER.SHORTNAME, key, value) : 
            game.settings.set(BUTLER.SHORTNAME, key, value);
    }

    static registerSetting(key, metadata) {
        return game.settings.register(BUTLER.SHORTNAME, key, metadata);
    }

    static registerAllSettings(settingsData) {
        return Object.keys(settingsData).forEach((key) => Sidekick.registerSetting(key, settingsData[key]));
    }

    /**
     * Gets the default game system names stored in the constants butler class
     */
    static getSystemChoices() {
        const systemIds = Object.getOwnPropertyNames(BUTLER.DEFAULT_GAME_SYSTEMS);
        const result = systemIds.forEach(i => BUTLER.DEFAULT_GAME_SYSTEMS[i].name);
        return result;
    }

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
     * @param {String} string 
     * @return {String} escapedString
     */
    static escapeRegExp(string) {
        return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
    }


}