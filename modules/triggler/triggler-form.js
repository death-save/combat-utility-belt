import { DEFAULT_CONFIG, PATH, SETTING_KEYS } from "../butler.js";
import { Sidekick } from "../sidekick.js";

export class TrigglerForm extends FormApplication {
    constructor(object, options) {
        super(object, options);
        this.data = object || {};
    }

    /**
     * 
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "cub-triggler-form",
            title: DEFAULT_CONFIG.triggler.form.title,
            template: `${PATH}/templates/triggler-form.html`,
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
        const data = id ? Sidekick.getSetting(SETTING_KEYS.triggler.triggers) : null;
        
        if (data) {
            const trigger = data.find(t => t.id === id);
            mergeObject(this.data, trigger);
        }

        // rework this section -- use the this.data first, then the data payload
        const category = this.data.category || null;
        const attribute = this.data.attribute || null;
        const property1 = this.data.property1 || null;
        const operator = this.data.operator || null;
        const value = this.data.value || null;
        const property2 = this.data.property2 || null;
        const pcOnly = this.data.pcOnly || null;

        const categories = Object.keys(game.system.template.Actor.templates.common);
        const attributes = category ? Object.keys(game.system.template.Actor.templates.common[category]) : null;
        const properties = category && attribute ? Object.keys(game.system.template.Actor.templates.common[category][attribute]) : null;
        const operators = DEFAULT_CONFIG.triggler.operators;
        const options = DEFAULT_CONFIG.triggler.options;


        return {
            category,
            categories,
            attribute,
            attributes,
            property1,
            properties,
            operator,
            operators,
            value,
            property2,
            pcOnly
        }
    }

    /**
     * 
     */
    activateListeners(html) {
        super.activateListeners(html);

        const categorySelect = html.find("select[name='category']");
        const attributeSelect = html.find("select[name='attribute']");
        const property1Select = html.find("select[name='property1']");
        const operatorSelect = html.find("select[name='operator']");
        const optionSelect = html.find("select[name='option']");
        const property2Select = html.find("select[name='property2']");

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
    async _updateObject(event, formData) {
        const conditionLab = Object.values(ui.windows).find(v => v.id === DEFAULT_CONFIG.enhancedConditions.conditionLab.id);
        let id = this.data.id;
        const row = this.data.row;
        const triggers = Sidekick.getSetting(SETTING_KEYS.triggler.triggers);
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

        await Sidekick.setSetting(SETTING_KEYS.triggler.triggers, update);

        conditionLab.map[row].trigger = newTrigger.id;

        conditionLab.render(true);
    }

    /**
     * 
     * @param {*} parts 
     */
    _constructString(parts) {
        const operatorText = DEFAULT_CONFIG.triggler.operators[parts.operator];
        const string = `${parts.category}.${parts.attribute}.${parts.property1} ${operatorText} ${parts.value}${` ${parts.category}.${parts.attribute}.${parts.property2 ? parts.property2 : null}`}`;
        return string;
    }
}