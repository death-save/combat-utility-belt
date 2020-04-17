import { cub } from "../../combat-utility-belt.js";
import * as BUTLER from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { EnhancedConditions } from "./enhanced-conditions.js";
import { TrigglerForm } from "../triggler/triggler-form.js";

/**
 * Form application for managing mapping of Conditions to Icons and JournalEntries
 */
export class ConditionLab extends FormApplication {
    constructor(object, options={}) {
        super(object, options);
        this.data = game.cub.conditionLab ? game.cub.conditionLab.data : object || null;
        this.system = game.system.id;
        this.mapType = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType);
        this.initialMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        this.map = null;
        this.maps = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.maps);
        this.draggedIndex = -1;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionLab.id,
            title: BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionLab.title,
            template: `${BUTLER.PATH}/templates/condition-lab.html`,
            classes: ["sheet"],
            width: 820,
            height: 750,
            //resizable: true
        });
    }

    /**
     * 
     */
    async prepareData() {
        const mappedSystems = Object.entries(BUTLER.KNOWN_GAME_SYSTEMS).filter(e => e[1].conditionMap === true);
        const mapTypeChoices = BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes;
        const mapType = this.mapType || Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType) || "other";
        const system = this.system || game.system.id;
        let conditionMap = this.map ? this.map : this.map = this.initialMap;
        const referenceTypes = BUTLER.DEFAULT_CONFIG.enhancedConditions.referenceTypes;
        const journalEntries = game.journal.entities.sort((a, b) => a.sort - b.sort).map(e => {
                return {
                    id: `@JournalEntry[${e.id}]`, 
                    name: e.name
                }
        });
        const itemEntries = game.items.entities.sort((a, b) => a.sort - b.sort).map(e => {
            return {
                id: `@Item[${e.id}]`,
                name: e.name
            }
        });
        const itemCompendia = game.packs.filter(p => p.entity === "Item");
        const journalCompendia = game.packs.filter(p => p.entity === "JournalEntry");

        const journalCompendiaEntries = [];
        const itemCompendiaEntries = [];

        for (let c of journalCompendia) {
            console.log(c.collection);
            const index = await c.getIndex();
            const entries = index.map(e => {
                return {
                    id: `@Compendium[${c.collection}.${e._id}]`,
                    name: e.name
                }
            });
            journalCompendiaEntries.push(...entries);
        }

        for (let c of itemCompendia) {
            console.log(c.collection);
            const index = await c.getIndex();
            const entries = index.map(e => {
                return {
                    id: `@Compendium[${c.collection}.${e._id}]`,
                    name: e.name
                }
            })
            itemCompendiaEntries.push(...entries);
        }

        const triggers = Sidekick.getSetting(BUTLER.SETTING_KEYS.triggler.triggers).map(t => {
            return [t.id, t.text]
        });

        const isDefault = mapType === "default";
        conditionMap.forEach((e, i, m) => {
            const referenceType = e.referenceType || "journalEntry";
            m[i].referenceTypeIcon = BUTLER.DEFAULT_CONFIG.enhancedConditions.referenceTypes.find(r => r.id === referenceType).icon;
            switch (referenceType) {
                case "journalEntry":
                    m[i].isJournalReference = true;
                    break;
                
                case "item":
                    m[i].isItemReference = true;
                    break;

                case "compendium.journalEntry":
                    m[i].isCompendiumJournalReference = true;
                    break;

                case "compendium.item":
                    m[i].isCompendiumItemReference = true;
                    break;

                default:
                    break;
            }
        });
        const data = {
            mapTypeChoices,
            mapType,
            conditionMap,
            referenceTypes,
            journalEntries,
            itemEntries,
            journalCompendiaEntries,
            itemCompendiaEntries,
            triggers,
            isDefault
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
     * 
     * @param {*} formData 
     */
    _processFormData(formData) {
        let conditions = [];
        let icons = [];
        let referenceTypes = [];
        let references = [];
        let applyTriggers = [];
        let removeTriggers = [];
        let newMap = [];

        //need to tighten these up to check for the existence of digits after the word
        const conditionRegex = new RegExp("condition", "i");
        const iconRegex = new RegExp("icon", "i");
        const referenceTypeRegex = new RegExp("reference-type", "i");
        const referenceRegex = new RegExp("reference", "i");
        const applyTriggerRegex = new RegExp("apply-trigger", "i");
        const removeTriggerRegex = new RegExp("remove-trigger", "i");


        //write it back to the relevant condition map
        //@todo: maybe switch to a switch
        for (let e in formData) {
            if (e.match(conditionRegex)) {
                conditions.push(formData[e]);
            } else if (e.match(iconRegex)) {
                icons.push(formData[e]);
            } else if (e.match(referenceTypeRegex)) {
                referenceTypes.push(formData[e]);
            } else if (e.match(referenceRegex)) {
                references.push(formData[e]); 
            } else if (e.match(applyTriggerRegex)) {
                applyTriggers.push(formData[e]);
            } else if (e.match(removeTriggerRegex)) {
                removeTriggers.push(formData[e]);
            }
        }

        for (let i = 0; i <= conditions.length - 1; i++) {
            newMap.push({
                name: conditions[i],
                icon: icons[i],
                referenceType: referenceTypes[i],
                referenceId: references[i],
                applyTrigger: applyTriggers[i],
                removeTrigger: removeTriggers[i]
            });
        }

        return newMap;
    }

    /**
     * Take the new map and write it back to settings, overwriting existing
     * @param {Object} event 
     * @param {Object} formData 
     */
    _updateObject(event, formData) {
        const mapType = formData["map-type"];
        const newMap = this._processFormData(formData);

        Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, newMap);
        Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType, mapType);
    }

    /**
     * 
     * @param {*} html 
     */
    activateListeners(html) {
        super.activateListeners(html);
        let newSystem;
        const systemSelector = html.find("select[class='system']");
        const mapTypeSelector = html.find("select[class='map-type']");
        const triggerAnchor = html.find("a[class='trigger']");
        const triggerSelector = html.find("select[class='trigger]'");
        const addRowButton = html.find("button[class='add-row']");
        const addRowAnchor = html.find("a[name='add-row']");
        const removeRowButton = html.find("button[class='remove-row']");
        const removeRowAnchor = html.find("a[class='remove-row']");
        const iconPath = html.find("input[class='icon-path']");
        const restoreDefaultsButton = html.find("button[class='restore-defaults']");
        const resetFormButton = html.find("button[name='reset']");
        const referenceAnchor = html.find("a.reference-type");
        const referenceTypeSelector = html.find("select[name^='reference-type']");

        mapTypeSelector.change(ev => {
            ev.preventDefault();
            const selection = $(ev.target).find("option:selected");
            const newType = this.mapType = selection.val();
            let newMap;

            switch (newType) {
                case "default":
                case "custom":
                    newMap = EnhancedConditions.getDefaultMap(this.system);
                    break;
                
                case "other":
                    newMap = [];
                    break;
            
                default:
                    break;
            }

            this.map = newMap;

            this.render(true);
        });

        systemSelector.change(async ev => {
            const selection = $(ev.target).find("option:selected");
            const newSystem = selection.val();
            const systemSetting = this.system = await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.system, newSystem);

            let newMap = this.map = await EnhancedConditions.getDefaultMap(newSystem) || {};
            const mapSetting = await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, newMap);

            this.render(true);
        });

        triggerAnchor.on("click", event => {
            event.preventDefault();
            const anchor = event.currentTarget;
            const select = anchor.parentElement.nextElementSibling;
            const id = select.value;
            const row = select.name.split("-", 2)[1];

            const data = {
                id,
                row
            }
            //get the row context
            new TrigglerForm(data).render();
        });

        addRowAnchor.click(async ev => {
            ev.preventDefault();
            const map = this.map;

            //const mapSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
            // need to add an index here...
            const existingNewConditions = map.filter(m => m.name.includes("newCondition"));
            const newConditionIndex = existingNewConditions.length ? Math.max(...existingNewConditions.map(m => m.name.match(/\d+/g)[0])) + 1 : 1;
            const newMap = map.concat({
                name: `newCondition${newConditionIndex}`,
                icon: "",
                referenceId: "",
                referenceType: "journalEntry",
                trigger: ""
            });

            this.map = await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, newMap);
            this.render(true);
        });

        referenceTypeSelector.on("change", event => {
            const formData = Sidekick.buildFormData(this._getFormData(this.form));
            const newMap = this._processFormData(formData);

            this.map = newMap;
            this.render(true);
        });

        removeRowAnchor.click(async ev => {
            ev.preventDefault();
            const map = this.map;

            //const mapSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
            const splitName = ev.currentTarget.name.split("-");
            const row = splitName[splitName.length - 1];

            const dialog = new Dialog({
                title: "Confirm Row Deletion",
                content: "Are you sure you want to delete this row?",
                buttons: {
                    yes: {
                        icon: `<i class="fa fa-check"></i>`,
                        label: " Yes",
                        callback: async event => {
                            const newMap = duplicate(map);
                            newMap.splice(row, 1);
                            game.cub.conditionLab.map = newMap;
                            game.cub.conditionLab.render(true);
                        }
                    },
                    no :{
                        icon: `<i class="fa fa-times"></i>`,
                        label: " No",
                        callback: event => {}
                    }
                },
                default: "no"
            });

            dialog.render(true);
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
            let confirm;

            const confirmationDialog = new Dialog({
                title: "Restore Defaults?",
                content: "<p>Are you sure you want to restore this mapping to defaults?</p>",
                buttons: {
                    yes: {
                        icon: `<i class="fas fa-check"></i>`,
                        label: "Yes",
                        callback: () => confirm = true
                    },
                    no: {
                        icon: `<i class="fas fa-times"></i>`,
                        label: "No",
                        callback: () => confirm = false
                    }
                },
                default: "no",
                close: () => {}
            });

            confirmationDialog.render(true);

            if (!confirm) {
                return;
            }

            const system = this.system;
            let defaultMaps = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.maps);

            if (this.mapType === Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.default)) {
                defaultMaps = await EnhancedConditions.loadDefaultMaps();
            }
            
            //console.log("restore defaults clicked", ev);
            this.map = await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, defaultMaps[system]);
            this.render(true);
        });

        referenceAnchor.on("click", event => {
            ev.preventDefault();
            //console.log("change", ev, this);
            const splitName = event.target.name.split("-");
            const row = splitName[splitName.length - 1];

            let icon = $(this.form).find("img[name='icon-" + row);
            icon.attr("src", ev.target.value); 
        });

        /*
        resetFormButton.on("click", event => {
            const dialog = new Dialog({
                title: "Reset Form?",
                content: `<p>Are you sure you want to reset the form?</p><p><strong>You will lose any unsaved changes.</strong></p>`,
                buttons: {
                    yes: {
                        icon: `<i class="fa fa-check"></i>`,
                        label: " Yes",
                        callback: async event => {
                            this.map = this.initialMap;
                            this.render(true);
                        }
                    },
                    no :{
                        icon: `<i class="fa fa-times"></i>`,
                        label: " No",
                        callback: event => {}
                    }
                },
                default: "no"
            });
            
        });
        */
    }

    onDragStart(event, index) {
        game.cub.conditionLab.draggedIndex = index;
        // do something?
    }

    onDragEnd(event, object) {
        //implement this
        this.draggedIndex = object.draggedIdx;
    }

    onDrop(event, draggedIndex, nextItem, container) {
        const oldIndex = game.cub.conditionLab.draggedIndex;
        const newIndex = draggedIndex;
        const draggedItem = game.cub.conditionLab.map[oldIndex];
        const newMap = duplicate(game.cub.conditionLab.map);
        newMap.splice(oldIndex, 1);
        newMap.splice(newIndex, 0, draggedItem);
        game.cub.conditionLab.map = newMap;
        game.cub.conditionLab.render();
    }


}