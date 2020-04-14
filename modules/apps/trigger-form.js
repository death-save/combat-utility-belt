import { DEFAULT_CONFIG, PATH, SETTING_KEYS } from "../butler.js";
import { Sidekick } from "../sidekick.js";

export class TriggerForm extends FormApplication {
    constructor(object, options) {
        super(object, options);
        this.data = object || {};
    }

    /**
     * 
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "cub-trigger-form",
            title: DEFAULT_CONFIG.enhancedConditions.conditionLab.title,
            template: `${PATH}/templates/trigger-form.html`,
            classes: ["sheet"],
            width: "auto",
            height: "auto",
            resizable: true
        });
    }

    /**
     * 
     */
    getData() {
        const id = this.data.id;
        const data = id ? Sidekick.getSetting(SETTING_KEYS.trigger.triggers) : null;
        
        if (data) {
            const trigger = data.find(t => t.id === id);
            mergeObject(this.data, trigger);
        }

        // rework this section -- use the this.data first, then the data payload
        const category = this.data.category || null;
        const attribute = this.data.attribute || null;
        const property = this.data.property || null;
        const operator = this.data.operator || null;
        const value = this.data.value || null;
        const option = this.data.option || null;

        const categories = Object.keys(game.system.template.Actor.templates.common);
        const attributes = category ? Object.keys(game.system.template.Actor.templates.common[category]) : null;
        const properties = category && attribute ? Object.keys(game.system.template.Actor.templates.common[category][attribute]) : null;
        const operators = DEFAULT_CONFIG.trigger.operators;
        const options = DEFAULT_CONFIG.trigger.options;


        return {
            category,
            categories,
            attribute,
            attributes,
            property,
            properties,
            operator,
            operators,
            value,
            option,
            options
        }
    }

    /**
     * 
     */
    activateListeners(html) {
        super.activateListeners(html);

        const categorySelect = html.find("select[name='category']");
        const attributeSelect = html.find("select[name='attribute']");
        const propertySelect = html.find("select[name='property']");
        const operatorSelect = html.find("select[name='operator']");
        const optionSelect = html.find("select[name='option']");

        categorySelect.on("change", event => {
            this.data.category = event.target.value;

            this.render(true);
        });

        attributeSelect.on("change", event => {
            this.data.attribute = event.target.value;

            this.render(true);
        });
    }

    /**
     * 
     */
    _updateObject(event, formData) {
        const conditionLab = Object.values(ui.windows).find(v => v.id === DEFAULT_CONFIG.enhancedConditions.conditionLab.id);
        let id = this.data.id;
        const row = this.data.row;
        const triggers = Sidekick.getSetting(SETTING_KEYS.trigger.triggers);
        const existingIds = triggers ? triggers.map(t => t.id) : null;
        const text = this._constructString(formData);

        if (!id) {
            id = randomID(16);
        }

        if (existingIds.length) {
            while (existingIds.includes(id)) {
                id = randomID(16);
            }
        }

        const update = duplicate(triggers);
        const newTrigger = {
            id,
            ...formData,
            text
        }
        const updateLength = update.push(newTrigger);

        Sidekick.setSetting(SETTING_KEYS.trigger.triggers, update);

        conditionLab.map[row].trigger = newTrigger;

        conditionLab.render(true);
    }

    /**
     * 
     * @param {*} parts 
     */
    _constructString(parts) {
        const operatorText = DEFAULT_CONFIG.trigger.operators[parts.operator];
        const optionText = DEFAULT_CONFIG.trigger.options[parts.option];
        const string = `${parts.category}.${parts.attribute}.${parts.property} ${operatorText} ${parts.value} ${optionText}`;
        return string;
    }
}