import { cub } from "../../combat-utility-belt.js";
import * as BUTLER from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { EnhancedConditions } from "./enhanced-conditions.js";

/**
 * Form application for managing mapping of Conditions to Icons and JournalEntries
 */
export class ConditionLab extends FormApplication {
    constructor(object, options={}) {
        super(object, options);
        this.data = object;
        this.system = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.system);
        this.map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        this.maps = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.maps);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "cub-condition-lab",
            title: BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionLab.title,
            template: `${BUTLER.PATH}/templates/condition-lab.html`,
            classes: ["sheet"],
            width: 500,
            height: "auto",
            resizable: true
        });
    }

    /**
     * 
     */
    async prepareData() {
        const systems = Sidekick.getSystemChoices();
        
        const system = this.system || Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.system) || game.system.id;
        let conditionMap = this.map || Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        const entries = game.journal.entities.sort((a, b) => a.sort - b.sort).map(e => {
                return [e.id, e.name]
        });

        if (!conditionMap || (conditionMap instanceof Object && Object.entries(conditionMap).length === 0)) {
            conditionMap = this.map = EnhancedConditions.getDefaultMap(system);
        }

        const data = {
            systems,
            system,
            conditionMap,
            entries
        }

        return data;
    }

    /**
     * Gets data for the template render
     */
    getData() {
        return this.data || this.prepareData();
    }

    /**
     * Take the new map and write it back to settings, overwriting existing
     * @param {Object} event 
     * @param {Object} formData 
     */
    _updateObject(event, formData) {
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
        for (let e in formData) {
            if (e.match(conditionRegex)) {
                conditions.push(formData[e]);
            } else if (e.match(iconRegex)) {
                icons.push(formData[e]);
            } else if (e.match(journalRegex)) {
                entries.push(formData[e]);
            }
        }

        for (let i = 0; i <= conditions.length - 1; i++) {
            newMap.push({
                name: conditions[i],
                icon: icons[i],
                journalEntry: entries[i]}
            );
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
            const selection = $(ev.target).find("option:selected");
            const newSystem = selection.val();
            const systemSetting = this.system = await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.system, newSystem);

            let newMap = this.map = await EnhancedConditions.getDefaultMap(newSystem) || {};
            const mapSetting = await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, newMap);

            this.render(true);
        });

        addRowButton.click(async ev => {
            ev.preventDefault();
            const map = this.map;

            //const mapSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
            // need to add an index here...
            const existingNewConditions = map.filter(m => m.name.includes("newCondition"));
            const newConditionIndex = existingNewConditions.length ? Math.max(existingNewConditions.forEach(m => m.name.match(`\\d+`).matches[0])) + 1 : 1;
            const newMap = map.concat({
                name: `newCondition${newConditionIndex}`,
                icon: "",
                journalId: ""
            });

            this.map = await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, newMap);
            this.render(true);
        });

        removeRowButton.click(async ev => {
            ev.preventDefault();
            const map = this.map;

            //const mapSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
            const splitName = ev.currentTarget.name.split("-");
            const row = splitName[splitName.length - 1];
            const newMap = duplicate(map);

            newMap.splice(row, 1);

            this.map = await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, newMap);

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
            ev.preventDefault();

            const system = this.system;
            const defaultMaps = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.maps);
            
            //console.log("restore defaults clicked", ev);
            this.map = await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, defaultMaps[system]);
            this.render(true);
        });
    }


}