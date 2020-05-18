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
        this.maps = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMaps);
        this.draggedIndex = -1;
    }

    /**
     * Get options for the form
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionLab.id,
            title: BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionLab.title,
            template: `${BUTLER.PATH}/templates/condition-lab.html`,
            classes: ["sheet"],
            width: 950,
            height: 725,
            resizable: true,
            closeOnSubmit: false
        });
    }

    /**
     * 
     */
    async prepareData() {
        const defaultMaps = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMaps);
        const mappedSystems = Object.keys(defaultMaps) || [];
        const mapTypeChoices = BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes;

        // If there's no default map for this system don't provide the "default" choice
        if (!mappedSystems.includes(game.system.id)) {
            delete mapTypeChoices.default;
        }

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

        const itemCompendiaChoices = itemCompendia.map(p => {
            return {
                id: p.collection, 
                name: p.metadata.label
            }
        });

        const journalCompendiaChoices = journalCompendia.map(p => {
            return {
                id: p.collection,
                name: p.metadata.label
            }
        });

        const journalCompendiaEntries = [];
        const itemCompendiaEntries = [];

        for (let c of journalCompendia) {
            const index = await c.getIndex();
            const entries = index.map(e => {
                return {
                    id: `@Compendium[${c.collection}.${e._id}]`,
                    collection: c.collection,
                    name: e.name
                }
            });
            journalCompendiaEntries.push(...entries);
        }

        for (let c of itemCompendia) {
            const index = await c.getIndex();
            const entries = index.map(e => {
                return {
                    id: `@Compendium[${c.collection}.${e._id}]`,
                    collection: c.collection,
                    name: e.name
                }
            })
            itemCompendiaEntries.push(...entries);
        }

        const triggers = Sidekick.getSetting(BUTLER.SETTING_KEYS.triggler.triggers).map(t => {
            return [t.id, t.text]
        });

        const isDefault = mapType === Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.default);

        conditionMap.forEach((entry, index, map) => {
            const referenceType = entry.referenceType || "journalEntry";
            const collectionRegex = new RegExp(/\[(.*\..*)(?=\..*])/);
            
            const compendium = entry.compendium || null;

            if (!compendium && (referenceType === "compendium.journalEntry" || referenceType === "compendium.item")) {
                map[index].compendium = entry.referenceId.match(collectionRegex) ? entry.referenceId.match(collectionRegex)[0].substring(1) : null;
            }
            
            map[index].referenceTypeIcon = BUTLER.DEFAULT_CONFIG.enhancedConditions.referenceTypes.find(r => r.id === referenceType).icon;
            
            switch (referenceType) {
                case "journalEntry":
                    map[index].isJournalReference = true;
                    break;
                
                case "item":
                    map[index].isItemReference = true;
                    break;

                case "compendium.journalEntry":
                    map[index].isCompendiumReference = true;
                    map[index].isJournalCompendium = true;
                    map[index].compendiumEntries = journalCompendiaEntries.filter(e => e.collection === entry.compendium);
                    break;

                case "compendium.item":
                    map[index].isCompendiumReference = true;
                    map[index].isItemCompendium = true;
                    map[index].compendiumEntries = itemCompendiaEntries.filter(e => e.collection === entry.compendium);
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
            journalCompendiaChoices,
            itemCompendiaChoices,
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
     * Captures the current state of the form and returns a formData object
     * @returns {FormData} formData
     */
    _captureForm() {
        // Get a reference to the form via jquery
        const form = this.element.find("form").first()[0];

        // Use the FormApplication#_getFormData method to parse the form
        const FD = this._getFormData(form);

        // Build and return useable formData object
        const formData = Sidekick.buildFormData(FD);
        return formData;
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
        let compendia = [];
        let applyTriggers = [];
        let removeTriggers = [];
        let optionsOverlay = [];
        let optionsRemove = [];
        let optionsDefeated = [];
        let newMap = [];
        const rows = [];


        //need to tighten these up to check for the existence of digits after the word
        const conditionRegex = new RegExp("condition", "i");
        const iconRegex = new RegExp("icon", "i");
        const referenceTypeRegex = new RegExp("reference-type", "i");
        const referenceRegex = new RegExp("reference", "i");
        const compendiumRegex = new RegExp("compendium", "i");
        const applyTriggerRegex = new RegExp("apply-trigger", "i");
        const removeTriggerRegex = new RegExp("remove-trigger", "i");
        const optionsOverlayRegex = new RegExp("options-overlay", "i");
        const optionsRemoveRegex = new RegExp("options-remove-others", "i");
        const optionsDefeatedRegex = new RegExp("options-mark-defeated", "i");
        const rowRegex = new RegExp(/\d+$/);

        //write it back to the relevant condition map
        //@todo: maybe switch to a switch
        for (let e in formData) {
            const rowMatch = e.match(rowRegex);
            const row = rowMatch ? rowMatch[0] : null;

            if (!row) {
                continue;
            }

            rows.push(row);

            if (e.match(conditionRegex)) {
                conditions[row] = formData[e];
            } else if (e.match(iconRegex)) {
                icons[row] = formData[e];
            } else if (e.match(referenceTypeRegex)) {
                referenceTypes[row] = formData[e];
            } else if (e.match(compendiumRegex)) {
                compendia[row] = formData[e];
            } else if (e.match(referenceRegex)) {
                references[row] = formData[e]; 
            } else if (e.match(applyTriggerRegex)) {
                applyTriggers[row] = formData[e];
            } else if (e.match(removeTriggerRegex)) {
                removeTriggers[row] = formData[e];
            } else if (e.match(optionsOverlayRegex)) {
                optionsOverlay[row] = formData[e];
            } else if (e.match(optionsRemoveRegex)) {
                optionsRemove[row] = formData[e];
            } else if (e.match(optionsDefeatedRegex)) {
                optionsDefeated[row] = formData[e];
            }
        }

        const uniqueRows = [...new Set(rows)];

        for (let i = 0; i <= uniqueRows.length - 1; i++) {
            newMap.push({
                name: conditions[i],
                icon: icons[i],
                referenceType: referenceTypes[i],
                compendium: compendia[i],
                referenceId: references[i],
                applyTrigger: applyTriggers[i],
                removeTrigger: removeTriggers[i],
                options: {
                    overlay: optionsOverlay[i],
                    removeOthers: optionsRemove[i],
                    markDefeated: optionsDefeated[i]
                }
            });
        }

        return newMap;
    }

    /**
     * Restore defaults for a mapping
     */
    async _restoreDefaults() {
        const system = this.system;
        let defaultMaps = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMaps);
        const defaultMapType = Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.default);
        const otherMapType = Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.other);

        if (this.mapType === defaultMapType) {
            defaultMaps = await EnhancedConditions.loadDefaultMaps();
        }

        const defaultMap = defaultMaps[system] || [];
        // If the mapType is other then the map should be empty, otherwise it's the default map for the system
        this.map = this.mapType === otherMapType ? [] : await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, defaultMap);
        this.render(true);
    }

    /**
     * Take the new map and write it back to settings, overwriting existing
     * @param {Object} event 
     * @param {Object} formData 
     */
    async _updateObject(event, formData) {
        const mapType = formData["map-type"];
        let newMap = this._processFormData(formData);
        const defaultMapType = Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.default);
        
        if (mapType === defaultMapType) {
            const defaultMap = EnhancedConditions.getDefaultMap(this.system);
            newMap = mergeObject(newMap, defaultMap);
        }
        this.mapType = mapType;
        this.map = newMap;

        Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType, mapType, true);
        Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, newMap, true);

        ui.notifications.info("Condition Lab mapping saved!");
    }

    /**
     * Exports the current map to JSON
     */
    _exportToJSON() {
        const map = duplicate(this.map);
        const data = {
            system: game.system.id,
            map
        }

        // Trigger file save procedure
        const filename = `cub-${game.system.id}-condition-map.json`;
        saveDataToFile(JSON.stringify(data, null, 2), "text/json", filename);
    }
    

    /**
     * Initiates an import via a dialog
     * Borrowed from foundry.js Entity class
     */
    async _importFromJSONDialog() {
        new Dialog({
            title: `Import Condition Map`,
            content: await renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.importDialog, {}),
            buttons: {
                import: {
                    icon: '<i class="fas fa-file-import"></i>',
                    label: "Import",
                    callback: html => {
                        this._processImport(html);
                    }
                },
                no: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel"
                }
            },
            default: "import"
        }).render(true);
    }

    /**
     * Process a Condition Map Import
     * @param {*} html 
     */
    async _processImport(html) {
        const form = html.find("form")[0];

        if ( !form.data.files.length ) {
            return ui.notifications.error("You did not upload a data file!");
        }

        const jsonFile = await readTextFromFile(form.data.files[0]);
        const json = JSON.parse(jsonFile);
        const map = EnhancedConditions.mapFromJson(json);

        if (!map) {
            return;
        }

        this.mapType = Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.other);
        this.map = map;
        this.render();
    }

    /**
     * Override the header buttons method
     */
    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        
        buttons.unshift(
            {
                label: "Import",
                class: "import",
                icon: "fas fa-file-import",
                onclick: async ev => {
                    this._importFromJSONDialog();
                }
            },
            {
                label: "Export",
                class: "export",
                icon: "fas fa-file-export",
                onclick: async ev => {
                    this._exportToJSON();
                }
            }
        );

        return buttons
    }

    /**
     * Activate app listeners
     * @param {*} html 
     */
    activateListeners(html) {
        const inputs = html.find("input");
        const mapTypeSelector = html.find("select[class='map-type']");
        const triggerAnchor = html.find("a[class='trigger']");
        const addRowAnchor = html.find("a[name='add-row']");
        const removeRowAnchor = html.find("a[class='remove-row']");
        const iconPath = html.find("input[class='icon-path']");
        const restoreDefaultsButton = html.find("button[class='restore-defaults']");
        const resetFormButton = html.find("button[name='reset']");
        const referenceTypeSelector = html.find("select[name^='reference-type']");
        const compendiumSelector = html.find("select[name^='compendium']");
        const saveCloseButton = html.find("button[name='save-close']");

        mapTypeSelector.on("change", event => this._onChangeMapType(event));
        triggerAnchor.on("click", event => this._onOpenTrigglerForm(event));            
        addRowAnchor.on("click", async event => this._onAddRow(event));
        removeRowAnchor.on("click", async event => this._onRemoveRow(event));
        restoreDefaultsButton.on("click", async event => this._onRestoreDefaults(event));
        resetFormButton.on("click", event => this._onResetForm(event));
        saveCloseButton.on("click", event => this._onSaveClose(event));
        referenceTypeSelector.on("change", event => this._onChangeReferenceType(event));
        iconPath.on("change", event => this._onChangeIconPath(event));
        compendiumSelector.on("change", event => this._onChangeCompendium(event));

        super.activateListeners(html);     
    }

    /* -------------------------------------------- */
    /*                Event Handlers                */
    /* -------------------------------------------- */

    /**
     * Change Map Type event handler
     * @param {*} event 
     */
    async _onChangeMapType(event) {
        event.preventDefault();
        const selection = $(event.target).find("option:selected");
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

        const update = {map: newMap, mapType: newType};

        this.map = newMap;

        //await this.submit(update);
        this.render();
    }

    /**
     * Handle icon path change
     * @param {*} event 
     */
    _onChangeIconPath(event) {
        event.preventDefault();

        const formData = this._captureForm();
        this.map = this._processFormData(formData);
        
        const row = event.target.name.match(/\d+$/)[0];

        //target the icon
        const icon = $(this.form).find("img[name='icon-" + row);
        icon.attr("src", event.target.value);
    }
    
    /**
     * Handle Reference type change
     * @param {*} event 
     */
    _onChangeReferenceType(event) {
        const formData = this._captureForm()
        
        this.map = this._processFormData(formData);
        this.render();
    }

    /**
     * Handle Compendium change
     * @param {*} event 
     */
    _onChangeCompendium(event) {
        const formData = this._captureForm()
        
        this.map = this._processFormData(formData);
        this.render();
    }

    /**
     * Open Triggler form event handler
     * @param {*} event 
     */
    _onOpenTrigglerForm(event) {
        event.preventDefault();
        const anchor = event.currentTarget;
        const select = anchor.parentElement.nextElementSibling;
        const id = select.value;
        const conditionLabRow = select.name.match(/\d+$/)[0];

        const data = {
            id,
            conditionLabRow
        }
        //this.map = this._processFormData(this._getFormData(this.form));
        new TrigglerForm(data, {parent: this}).render(true);
    }

    /**
     * Add Row event handler
     * @param {*} event 
     */
    _onAddRow(event) {
        event.preventDefault();

        const existingNewConditions = this.map.filter(m => m.name.includes("newCondition"));
        const newConditionIndex = existingNewConditions.length ? Math.max(...existingNewConditions.map(m => m.name.match(/\d+/g)[0])) + 1 : 1;
        const formData = this._captureForm();
        const fdMap = this._processFormData(formData);
        const defaultMapType = Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.default);
        const customMapType = Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.custom);

        if (this.mapType === defaultMapType) {
            const defaultMap = EnhancedConditions.getDefaultMap(this.system);
            this.map = mergeObject(fdMap, defaultMap);
        } else {
            this.map = fdMap;
        }
        
        const newMap = duplicate(this.map);
        
        newMap.push({
            name: `newCondition${newConditionIndex}`,
            icon: "icons/svg/d20-black.svg",
            referenceId: "",
            referenceType: "journalEntry",
            trigger: ""
        });
        
        const newMapType = this.mapType === defaultMapType ? customMapType : this.mapType; 

        this.mapType = newMapType;
        this.map = newMap;
        
        this.render();
    }   

    /**
     * 
     * @param {*} event 
     */
    _onRemoveRow(event) {
        event.preventDefault();

        const formData = this._captureForm();
        this.map = this._processFormData(formData);

        //const mapSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        const row = event.currentTarget.name.match(/\d+$/)[0];

        const dialog = new Dialog({
            title: "Confirm Row Deletion",
            content: "Are you sure you want to delete this row?",
            buttons: {
                yes: {
                    icon: `<i class="fa fa-check"></i>`,
                    label: " Yes",
                    callback: async event => {
                        const newMap = duplicate(this.map);
                        newMap.splice(row, 1);
                        this.map = newMap;
                        this.render();
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
    }

    /**
     * 
     * @param {*} event 
     */
    _onRestoreDefaults(event) {
        event.preventDefault();
        const content = `<p>Are you sure you want to restore this mapping to defaults?</p><strong>If you save, this change will be permanent.</strong>`;

        const confirmationDialog = new Dialog({
            title: "Restore Defaults?",
            content,
            buttons: {
                yes: {
                    icon: `<i class="fas fa-check"></i>`,
                    label: "Yes",
                    callback: () => this._restoreDefaults()
                },
                no: {
                    icon: `<i class="fas fa-times"></i>`,
                    label: "No",
                    callback: () => {}
                }
            },
            default: "no",
            close: () => {}
        });

        confirmationDialog.render(true);
    }

    /**
     * Reset form handler
     * @param {*} event 
     */
    _onResetForm(event) {
        const dialog = new Dialog({
            title: "Reset Form?",
            content: `<p>Are you sure you want to reset the form?</p><p><strong>You will lose any unsaved changes.</strong></p>`,
            buttons: {
                yes: {
                    icon: `<i class="fa fa-check"></i>`,
                    label: " Yes",
                    callback: event => {
                        this.map = this.initialMap;
                        this.render();
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
    }

    /**
     * Save and Close handler
     * @param {*} event 
     */
    _onSaveClose(event) {
        this.submit().then(result => {
            this.close();
        }).catch(reject => {
            ui.notifications.warn("Condition Lab failed to Save and Close");
        });
        
    }

    /**
     * 
     * @param {*} event 
     * @param {*} index 
     */
    onDragStart(event, index) {
        game.cub.conditionLab.draggedIndex = index;
        // do something?
    }

    /**
     * 
     * @param {*} event 
     * @param {*} object 
     */
    onDragEnd(event, object) {
        //implement this
        this.draggedIndex = object.draggedIdx;
    }

    /**
     * 
     * @param {*} event 
     * @param {*} draggedIndex 
     * @param {*} nextItem 
     * @param {*} container 
     */
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