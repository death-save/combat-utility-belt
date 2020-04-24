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
        return game.settings.get(BUTLER.NAME, key);
    }

    /*
    static async setSetting(key, value, awaitResult=false) {
        return awaitResult ? 
            await game.settings.set(BUTLER.NAME, key, value) : 
            game.settings.set(BUTLER.NAME, key, value);
    }
    */

    static setSetting(key, value, awaitResult=false) {
        if (!awaitResult) {
            return game.settings.set(BUTLER.NAME, key, value);
        }

        game.settings.set(BUTLER.NAME, key, value).then(result => {
            return result;
        }).catch(rejected => {
            throw rejected;
        });
    }

    static registerSetting(key, metadata) {
        return game.settings.register(BUTLER.NAME, key, metadata);
    }

    static registerAllSettings(settingsData) {
        return Object.keys(settingsData).forEach((key) => Sidekick.registerSetting(key, settingsData[key]));
    }

    /**
     * Gets the default game system names stored in the constants butler class
     */
    static getSystemChoices() {
        const systemIds = Object.getOwnPropertyNames(BUTLER.KNOWN_GAME_SYSTEMS);
        const result = {};

        for (let i of systemIds) {
            result[i] = BUTLER.KNOWN_GAME_SYSTEMS[i].name;
        }
        return result;
    }

    /**
     * Use FilePicker to browse then Fetch one or more JSONs and return them
     * @param {*} source
     * @param {*} path 
     */
    static async fetchJsons(source, path) {
        const extensions = [".json"];
        const fp = await FilePicker.browse(source, path, {extensions});

        if (!fp.files.length) {
            return;
        }

        const jsons = [];

        for (let file of fp.files) {
            const jsonFile = await fetch(file);
            const json = await jsonFile.json();

            json instanceof Object ? jsons.push(json) : console.warn("not a valid json:", json);
        }
        
        return jsons;
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
     * Inverts the key and value in a map
     * @todo: rework
     */
    static getInverseMap(map) {
        let newMap = new Map();
        for (let [k, v] of map) {
            newMap.set(v, k);
        }
        return newMap;
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

    /**
     * Attempts to coerce a target value into the exemplar's type
     * @param {*} target 
     * @param {*} type
     * @returns {*} coercedValue 
     */
    static coerceType(value, type) {
        switch (type) {
            case "number":
                return value * 1;
                
            case "string":
                return value.toString();

            case "boolean":
                return value.toString().toLowerCase() === "true" ? true : value.toString().toLowerCase() === "false" ? false : value;

            default:
                return value;
        }
    }

    /**
     * Builds a FD returned from _getFormData into a formData array
     * Borrowed from foundry.js
     * @param {*} FD 
     */
    static buildFormData(FD) {
        const dtypes = FD._dtypes;

        // Construct update data object by casting form data
        let formData = Array.from(FD).reduce((obj, [k, v]) => {
        let dt = dtypes[k];
        if ( dt === "Number" ) obj[k] = v !== "" ? Number(v) : null;
        else if ( dt === "Boolean" ) obj[k] = v === "true";
        else if ( dt === "Radio" ) obj[k] = JSON.parse(v);
        else obj[k] = v;
        return obj;
        }, {});

        return formData;
    }
}