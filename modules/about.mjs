/**
 * AboutApp module
 * @module about
 */

import { NAME, PATH } from "./butler.js";

/**
 * About this module FormApp
 * @extends FormApplication
 */
export default class AboutApp extends FormApplication {
    constructor(options={}) {
        super(options);
    }

    /**
     * Call app default options
     * @override
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "combat-utility-belt-about",
            title: "About Combat Utility Belt",
            template: `${PATH}/templates/about.hbs`,
            popOut: true,
            width: 500,
            height: 505
        });
    }

    /**
     * Supplies data to the template
     */
    async getData() {
        return {
            version: game.modules.get(NAME).data.version,
            patrons: await this.fetchPatrons()
        }
    }

    /**
     * Fetches a list of Patrons to display on the About page
     */
    async fetchPatrons() {
        const jsonPath = `${PATH}/patrons.json`;
        const response = await fetch(jsonPath);
        if (!response.ok) return null;

        const json = await response.json();
        return json;
    }
}