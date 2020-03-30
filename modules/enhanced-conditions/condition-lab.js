import { cub } from "../../combat-utility-belt.js";
import * as BUTLER from "../butler.js";
import { Sidekick } from "../sidekick.js";

/**
 * Form application for managing mapping of Conditions to Icons and JournalEntries
 */
export class ConditionLab extends FormApplication {
    constructor(object, options={}) {
        super(object, options);
        this.data = game.cub.enhancedConditions;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "cub-condition-lab",
            title: BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionLab.title,
            template: `${BUTLER.PATH}/templates/cub-conditions.html`,
            classes: ["sheet"],
            width: 500,
            height: "auto",
            resizable: true
        });
    }

    getData() {
        const entries = game.journal.entities.sort((a, b) => a.sort - b.sort).map(e => {
            return [e.id, e.name]
        });

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
        let conditions = [];
        let icons = [];
        let entries = [];
        let newMap = [];

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

        Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, newMap);

        //not sure what to do about this yet, probably nothing
        console.assert(conditions.length === icons.length, "There are unmapped conditions");
    }

    /**
     * 
     * @param {*} html 
     */
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
            await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.system, newSystem);

            //if there's no mapping for the newsystem, create one
            if (!this.data.settings.maps[newSystem]) {
                const newMap = [];

                await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, newMap);
            }

            //rerender the form to get the correct condition mapping template
            this.render(true);
        });

        addRowButton.click(async ev => {
            ev.preventDefault();
            game.cub.enhancedConditions.settings.maps[this.data.system].push(["", ""]);
            this.render(true);
        });

        removeRowButton.click(async ev => {
            const activeMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
            //console.log(ev);
            const splitName = ev.currentTarget.name.split("-");
            const row = splitName[splitName.length - 1];

            //console.log("row", row);
            ev.preventDefault();
            activeMap.splice(row, 1);
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
            const system = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.system);
            const defaultMaps = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.maps);
            ev.preventDefault();
            //console.log("restore defaults clicked", ev);
            Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, defaultMaps[system]);
            this.render(true);
        });
    }


}