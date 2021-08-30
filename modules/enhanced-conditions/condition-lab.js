import * as BUTLER from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { EnhancedConditions } from "./enhanced-conditions.js";
import { TrigglerForm } from "../triggler/triggler-form.js";
import { DraggableList } from "../utils/draggable-list.js";
import EnhancedEffectConfig from "./enhanced-effect-config.js";

/**
 * Form application for managing mapping of Conditions to Icons and JournalEntries
 */
export class ConditionLab extends FormApplication {
    constructor(object, options={}) {
        super(object, options);
        this.data = (game.cub.conditionLab ? game.cub.conditionLab.data : object) ?? null;
        this.system = game.system.id;
        this.initialMapType = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType);
        this.mapType = null;
        this.initialMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        this.map = null;
        this.maps = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMaps);
    }

    /**
     * Get options for the form
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionLab.id,
            title: BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionLab.title,
            template: BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.conditionLab,
            classes: ["sheet"],
            width: 1025,
            height: 725,
            resizable: true,
            closeOnSubmit: false,
            scrollY: ["ol.condition-lab"],
            dragDrop: [{dropSelector: "input[name^='reference-item']"}]
        });
    }

    /**
     * Get updated map by combining existing in-memory map with current formdata
     */
     get updatedMap() {
        const submitData = this._buildSubmitData();
        const mergedMap = this._processFormData(submitData);
        const updatedMap = EnhancedConditions._prepareMap(mergedMap);
        return updatedMap;
    }

    /**
     * Prepare data for form rendering
     */
    async prepareData() {
        const defaultMaps = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMaps);
        const mappedSystems = Object.keys(defaultMaps) || [];
        const mapTypeChoices = BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes;

        // If there's no default map for this system don't provide the "default" choice
        if (!mappedSystems.includes(game.system.id)) {
            if (this.initialMap) {
                mapTypeChoices.default = "System - Inferred";
            } else {
                delete mapTypeChoices.default;
            }
        }

        const mapType = this.mapType = (this.mapType || this.initialMapType || "other");
        const system = this.system || game.system.id;
        let conditionMap = this.map ? this.map : this.map = duplicate(this.initialMap);
        const triggers = Sidekick.getSetting(BUTLER.SETTING_KEYS.triggler.triggers).map(t => {
            return [t.id, t.text]
        });

        const isDefault = this.mapType === Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.default);
        const outputChatSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat);

        // Transform data for each Condition Mapping entry to ensure it will display correctly
        conditionMap.forEach((entry, index, map) => {
            // Check if the row exists in the saved map
            const existingEntry = this.initialMap.find(e => e.id === entry.id) ?? null;
            entry.isNew = !existingEntry;

            // Set the Output to Chat checkbox
            entry.options = entry.options ?? {};
            entry.options.outputChat = entry?.options?.outputChat;
            entry.enrichedReference = entry.referenceId ? TextEditor.enrichHTML(entry.referenceId) : "";

            // @todo #357 extract this into a function
            const propsToCheck = [
                "name",
                "icon",
                "options",
                "referenceId",
                "applyTrigger",
                "removeTrigger",
                "activeEffect"
            ];
            entry.isChanged = entry.isNew || (index != this.initialMap?.indexOf(existingEntry));

            if (!entry.isChanged) {
                for (const prop of propsToCheck) {
                    if (existingEntry[prop] && !entry[prop]) {
                        entry.isChanged = true;
                        break;
                    } else if (existingEntry && (JSON.stringify(existingEntry[prop]) != JSON.stringify(entry[prop]))) {
                        entry.isChanged = true;
                        break;
                    }
                }
            }
        });

        let unsavedMap = false;
        if (mapType != this.initialMapType || conditionMap?.length != this.initialMap?.length || conditionMap.some(c => c.isNew || c.isChanged)) {
            unsavedMap = true;
        }

        const disableChatOutput = isDefault || !outputChatSetting;
        
        const data = {
            mapTypeChoices,
            mapType,
            conditionMap,
            triggers,
            isDefault,
            disableChatOutput,
            unsavedMap
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
     * Enriches submit data with existing map to ensure continuity
     */
    _buildSubmitData() {
        const data = this.map?.reduce((acc, entry, index) => {
            acc[`id-${index}`] = entry.id;
            return acc;
        }, {}) ?? {};
        return this._getSubmitData(data);
    }

    /**
     * Processes the Form Data and builds a usable Condition Map
     * @param {*} formData 
     */
    _processFormData(formData) {
        let ids = [];
        let conditions = [];
        let icons = [];
        let references = [];
        let applyTriggers = [];
        let removeTriggers = [];
        let optionsOverlay = [];
        let optionsRemove = [];
        let optionsOutputChat = [];
        let optionsDefeated = [];
        let newMap = [];
        const rows = [];
        const existingMap = this.map ?? Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);


        //need to tighten these up to check for the existence of digits after the word
        const conditionRegex = new RegExp("condition", "i");
        const idRegex = new RegExp(/^id/, "i");
        const iconRegex = new RegExp("icon", "i");
        const referenceRegex = new RegExp("reference", "i");
        const applyTriggerRegex = new RegExp("apply-trigger", "i");
        const removeTriggerRegex = new RegExp("remove-trigger", "i");
        const optionsOverlayRegex = new RegExp("options-overlay", "i");
        const optionsRemoveRegex = new RegExp("options-remove-others", "i");
        const optionsOutputChatRegex = new RegExp("options-output-chat", "i");
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

            if (e.match(idRegex)) {
                ids[row] = formData[e];
            } else if (e.match(conditionRegex)) {
                conditions[row] = formData[e];
            } else if (e.match(iconRegex)) {
                icons[row] = formData[e];
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
            } else if (e.match(optionsOutputChatRegex)) {
                optionsOutputChat[row] = formData[e];
            } else if (e.match(optionsDefeatedRegex)) {
                optionsDefeated[row] = formData[e];
            }
        }

        const uniqueRows = [...new Set(rows)];

        for (let i = 0; i < uniqueRows.length; i++) {
            const id = ids[i] ?? null;
            const name = conditions[i];
            const existingCondition = (existingMap && id) ? existingMap.find(c => c.id === id) : null;
            const activeEffect = existingCondition ? existingCondition.activeEffect : null;

            const condition = {
                id,
                name,
                icon: icons[i],
                referenceId: references[i],
                applyTrigger: applyTriggers[i],
                removeTrigger: removeTriggers[i],
                activeEffect,
                options: {
                    overlay: optionsOverlay[i],
                    removeOthers: optionsRemove[i],
                    outputChat: optionsOutputChat[i],
                    markDefeated: optionsDefeated[i]
                }
            };

            newMap.push(condition);
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
            defaultMaps = await EnhancedConditions._loadDefaultMaps();
        }

        //const defaultMap = defaultMaps[system] || [];
        const defaultMap = EnhancedConditions._prepareMap(EnhancedConditions.getDefaultMap(system));
        // If the mapType is other then the map should be empty, otherwise it's the default map for the system
        this.map = this.mapType === otherMapType ? [] : defaultMap;
        //Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, this.map, true);
        this.render(true);
    }

    /**
     * Take the new map and write it back to settings, overwriting existing
     * @param {Object} event 
     * @param {Object} formData 
     */
    async _updateObject(event, formData) {
        const mapType = formData["map-type"];
        let newMap = this.updatedMap;
        const defaultMapType = Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.default);
        
        if (mapType === defaultMapType) {
            const defaultMap = EnhancedConditions.getDefaultMap(this.system);
            newMap = mergeObject(newMap, defaultMap);
        }

        this.mapType = this.initialMapType = mapType;
        const preparedMap = EnhancedConditions._prepareMap(newMap);

        Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType, mapType, true);
        Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, preparedMap, true);

        this.map = this.initialMap = preparedMap;
        this.unsaved = false;

        ui.notifications.info(game.i18n.localize("ENHANCED_CONDITIONS.Lab.SaveSuccess"));
        this.render();
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
            title: game.i18n.localize("ENHANCED_CONDITIONS.Lab.ImportTitle"),
            content: await renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.importDialog, {}),
            buttons: {
                import: {
                    icon: '<i class="fas fa-file-import"></i>',
                    label: game.i18n.localize("WORDS.Import"),
                    callback: html => {
                        this._processImport(html);
                    }
                },
                no: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("WORDS.Cancel")
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
            return ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.Import.NoFile"));
        }

        const jsonFile = await readTextFromFile(form.data.files[0]);
        const json = JSON.parse(jsonFile);
        const map = EnhancedConditions.mapFromJson(json);

        if (!map || !map?.length) {
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
                label: game.i18n.localize("WORDS.Import"),
                class: "import",
                icon: "fas fa-file-import",
                onclick: async ev => {
                    this._importFromJSONDialog();
                }
            },
            {
                label: game.i18n.localize("WORDS.Export"),
                class: "export",
                icon: "fas fa-file-export",
                onclick: async ev => {
                    this._exportToJSON();
                }
            }
        );

        return buttons
    }

    /* -------------------------------------------- */
    /*                 Hook Handlers                */
    /* -------------------------------------------- */

    /**
     * Condition Lab Render handler
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
     static _onRender(app, html, data) {
        ui.cub.conditionLab = app;
    }

    /* -------------------------------------------- */
    /*                Event Handlers                */
    /* -------------------------------------------- */

    /**
     * Activate app listeners
     * @param {*} html 
     */
    activateListeners(html) {
        const inputs = html.find("input");
        const mapTypeSelector = html.find("select[class='map-type']");
        const activeEffectButton = html.find("button.active-effect-config");
        const triggerAnchor = html.find("a[class='trigger']");
        const addRowAnchor = html.find("a[name='add-row']");
        const removeRowAnchor = html.find("a[class='remove-row']");
        const changeOrderAnchor = html.find(".change-order a");
        const restoreDefaultsButton = html.find("button[class='restore-defaults']");
        const resetFormButton = html.find("button[name='reset']");
        const saveCloseButton = html.find("button[name='save-close']");

        inputs.on("change", event => this._onChangeInputs(event));
        mapTypeSelector.on("change", event => this._onChangeMapType(event));
        activeEffectButton.on("click", event => this._onClickActiveEffectConfig(event));
        triggerAnchor.on("click", event => this._onOpenTrigglerForm(event));            
        addRowAnchor.on("click", async event => this._onAddRow(event));
        removeRowAnchor.on("click", async event => this._onRemoveRow(event));
        changeOrderAnchor.on("click", event => this._onChangeSortOrder(event));
        restoreDefaultsButton.on("click", async event => this._onRestoreDefaults(event));
        resetFormButton.on("click", event => this._onResetForm(event));
        saveCloseButton.on("click", event => this._onSaveClose(event));

        super.activateListeners(html);     
    }

    /**
     * Input change handler
     * @param {*} event 
     * @returns 
     */
    async _onChangeInputs(event) {
        const name = event.target.name;
        this.map = this.updatedMap;

        if (name.startsWith("icon-path")) {
            return this._onChangeIconPath(event);
        } else if (name.startsWith("reference-id")) {
            return this._onChangeReferenceId(event);
        } else {
            this.render();
        }
    }

    /**
     * Change Map Type event handler
     * @param {*} event 
     */
    async _onChangeMapType(event) {
        event.preventDefault();
        const selection = $(event.target).find("option:selected");
        const newType = this.mapType = selection.val();

        switch (newType) {
            case "default":
            case "custom":
                const defaultMap = EnhancedConditions.getDefaultMap(this.system);
                this.map = defaultMap?.length ? EnhancedConditions._prepareMap(defaultMap) : []; 
                break;
            
            case "other":
                this.map = [];
                break;
        
            default:
                break;
        }

        this.render();
    }

    /**
     * Handle icon path change
     * @param {*} event 
     */
    _onChangeIconPath(event) {
        event.preventDefault();
        
        const row = event.target.name.match(/\d+$/)[0];

        //target the icon
        const icon = $(this.form).find("img[name='icon-" + row);
        icon.attr("src", event.target.value);
    }

    /**
     * Handle click Active Effect Config button
     * @param {*} event 
     */
    async _onClickActiveEffectConfig(event) {
        const li = event.currentTarget.closest("li");
        const conditionId = li ? li.dataset.conditionId : null;

        if (!conditionId) return;

        const conditions = this.map ?? Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        const condition = conditions.length ? conditions.find(c => c.id === conditionId) : null;

        if (!condition) return;

        const conditionEffect = condition.activeEffect ?? EnhancedConditions.getActiveEffect(condition);
        
        if (!conditionEffect) return;

        if (!hasProperty(conditionEffect, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.conditionId}`)) {
            setProperty(conditionEffect, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.conditionId}`, conditionId);
        }

        // Build a fake effect object for the ActiveEffectConfig sheet
        // @todo #544 make Conditions an ActiveEffect extension?
        const effect = {
            documentName: "ActiveEffect",
            data: conditionEffect,
            testUserPermission: (...args) => { return true},
            parent: {
                entity: "Actor", // backwards compatibility
                documentName: "Actor"
            },
            apps: {},
            isOwner: true
        }

        new EnhancedEffectConfig(effect).render(true);
    }

    /**
     * Reference Link change handler
     * @param {*} event 
     */
    _onChangeReferenceId(event) {
        event.preventDefault();
        
        const input = event.currentTarget ?? event.target;

        // Update the enriched link
        const $linkDiv = $(input.nextElementSibling);
        const $link = $linkDiv.first();   
        const newLink = TextEditor.enrichHTML(input.value);

        if (!$link.length) {
            $linkDiv.append(newLink);
        } else {
            $linkDiv.html(newLink);
        }
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
        const fdMap = this.updatedMap;
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
            trigger: ""
        });
        
        const newMapType = this.mapType === defaultMapType ? customMapType : this.mapType; 

        this.mapType = newMapType;
        this.map = newMap;
        
        this.render();
    }

    /**
     * Handler for remove row event
     * @param {*} event 
     */
    _onRemoveRow(event) {
        event.preventDefault();

        this.map = this.updatedMap;

        const row = event.currentTarget.name.match(/\d+$/)[0];

        const dialog = new Dialog({
            title: game.i18n.localize("ENHANCED_CONDITIONS.Lab.ConfirmDeleteTitle"),
            content: game.i18n.localize("ENHANCED_CONDITIONS.Lab.ConfirmDeleteContent"),
            buttons: {
                yes: {
                    icon: `<i class="fa fa-check"></i>`,
                    label: game.i18n.localize("WORDS._Yes"),
                    callback: async event => {
                        const newMap = duplicate(this.map);
                        newMap.splice(row, 1);
                        this.map = newMap;
                        this.render();
                    }
                },
                no :{
                    icon: `<i class="fa fa-times"></i>`,
                    label: game.i18n.localize("WORDS._No"),
                    callback: event => {}
                }
            },
            default: "no"
        });

        dialog.render(true);
    }

    /**
     * Handle a change sort order click
     * @param {*} event 
     */
    _onChangeSortOrder(event) {
        event.preventDefault();
        
        const anchor = event.currentTarget;
        const liRow = anchor?.closest("li");
        const rowNumber = parseInt(liRow?.dataset.mappingRow);
        const type = anchor?.className;
        const newMap = deepClone(this.map);
        const mappingRow = newMap?.splice(rowNumber, 1) ?? [];
        let newIndex = -1;

        switch (type) {
            case "move-up":
                newIndex = rowNumber - 1;
                break;
            
            case "move-down":
                newIndex = rowNumber + 1;
                break;

            default:
                break;
        }

        if (newIndex <= -1) return;

        newMap.splice(newIndex, 0, ...mappingRow);
        this.map = newMap;
        this.render();
    }

    /**
     * 
     * @param {*} event 
     */
    _onRestoreDefaults(event) {
        event.preventDefault();
        const content = game.i18n.localize("ENHANCED_CONDITIONS.Lab.RestoreDefaultsContent");

        const confirmationDialog = new Dialog({
            title: game.i18n.localize("ENHANCED_CONDITIONS.Lab.RestoreDefaultsTitle"),
            content,
            buttons: {
                yes: {
                    icon: `<i class="fas fa-check"></i>`,
                    label: game.i18n.localize("WORDS.Yes"),
                    callback: () => this._restoreDefaults()
                },
                no: {
                    icon: `<i class="fas fa-times"></i>`,
                    label: game.i18n.localize("WORDS.No"),
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
            title: game.i18n.localize("ENHANCED_CONDITIONS.Lab.ResetFormTitle"),
            content: game.i18n.localize("ENHANCED_CONDITIONS.Lab.ResetFormContent"),
            buttons: {
                yes: {
                    icon: `<i class="fa fa-check"></i>`,
                    label: game.i18n.localize("WORDS._Yes"),
                    callback: event => {
                        this.map = this.initialMap;
                        this.render();
                    }
                },
                no :{
                    icon: `<i class="fa fa-times"></i>`,
                    label: game.i18n.localize("WORDS._No"),
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
            ui.notifications.warn(game.i18n.localize("ENHANCED_CONDITIONS.Lab.SaveFailed"));
        });
        
    }

    async _onDrop(event) {
        event.preventDefault();
	    const data = JSON.parse(event.dataTransfer.getData('text/plain'));
	    if ( !data?.id ) return;
        const targetInput = event.currentTarget;

	    // Case 1 - Document from Compendium Pack
        if ( data.pack ) {
            const pack = game.packs.get(data.pack);
            if (!pack) return;
            const entity = await pack.getDocument(data.id);
            const link = `@Compendium[${data.pack}.${data.id}]{${entity.name}}`;
            targetInput.value = link;
            this._onChangeReferenceId(event);
        }

        // Case 2 - Document from World
        else if ( data.type ) {
            const config = CONFIG[data.type];
            if ( !config ) return false;
            const entity = config.collection.instance.get(data.id);
            if ( !entity ) return false;
            const link = `@${data.type}[${entity._id}]{${entity.name}}`;
            targetInput.value = link;
            this._onChangeReferenceId(event);
        }
    }
}