import { DEFAULT_CONFIG, PATH, SETTING_KEYS, NAME } from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { ConditionLab } from "../enhanced-conditions/condition-lab.js";

export class TrigglerForm extends FormApplication {
    constructor(object, options={parent: null}) {
        super(object, options);
        this.data = object || {};
        this.parent = options.parent || null;
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
     * Get data for the triggler form
     */
    getData() {
        const id = this.data.id;
        const triggers = Sidekick.getSetting(SETTING_KEYS.triggler.triggers);
        
        if (id && triggers) {
            const trigger = triggers.find(t => t.id === id);
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
        const npcOnly = this.data.npcOnly || null;
        const notZero = this.data.notZero || null;

        const categories = hasProperty(game, "system.template.Actor.templates.common") ? Object.keys(game.system.template.Actor.templates.common) : null;
        const attributes = category ? Object.keys(game.system.template.Actor.templates.common[category]) : null;
        const properties = category && attribute ? Object.keys(game.system.template.Actor.templates.common[category][attribute]) : null;
        const operators = DEFAULT_CONFIG.triggler.operators;

        const triggerSelected = id && triggers ? true : false;

        if (!categories) {
            ui.notifications.warn("Triggler is not supported in your game system at this time.");
            return false;
        }

        return {
            id,
            triggerSelected,
            triggers,
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
            pcOnly,
            npcOnly,
            notZero
        }
    }

    /**
     * 
     */
    activateListeners(html) {
        super.activateListeners(html);

        const triggerSelect = html.find("select[name='triggers']");
        const deleteTrigger = html.find("a.delete");
        const categorySelect = html.find("select[name='category']");
        const attributeSelect = html.find("select[name='attribute']");
        const property1Select = html.find("select[name='property1']");
        const operatorSelect = html.find("select[name='operator']");
        const optionSelect = html.find("select[name='option']");
        const property2Select = html.find("select[name='property2']");
        
        triggerSelect.on("change", event => {
            this.data.id = event.target.value;
            this.render();
        });

        deleteTrigger.on("click", async event => {
            const triggers = Sidekick.getSetting(SETTING_KEYS.triggler.triggers);
            const triggerIndex = triggers.findIndex(t => t.id === this.data.id);
            if (triggerIndex === undefined) {
                return;
            }
            const updatedTriggers = duplicate(triggers);

            updatedTriggers.splice(triggerIndex, 1);

            await Sidekick.setSetting(SETTING_KEYS.triggler.triggers, updatedTriggers);
            this.data.id = null;
            this.render();
        });

        categorySelect.on("change", event => {
            this.data.category = event.target.value;
            this.data.attribute = null;
            this.data.property1 = null;
            this.data.property2 = null;

            this.render();
        });

        attributeSelect.on("change", event => {
            this.data.attribute = event.target.value;
            this.data.property1 = null;
            this.data.property2 = null;

            this.render();
        });
    }

    /**
     * 
     */
    async _updateObject(event, formData) {
        if (!formData.category) {
            return;
        }

        const triggers = Sidekick.getSetting(SETTING_KEYS.triggler.triggers);
        const existingIds = triggers ? triggers.map(t => t.id) : null;
        const text = this._constructString(formData);
        const id = this.data.id;
        const newData = duplicate(formData);
        delete newData.triggers;
        const updatedTriggers = duplicate(triggers);

        let updatedTrigger = {}
        if (id) {
            const existingTrigger = triggers.find(t => t.id === id);
            if (existingTrigger) {
                updatedTrigger = mergeObject(existingTrigger, newData);
                updatedTrigger.text = text;
                updatedTriggers[triggers.indexOf(existingTrigger)] = updatedTrigger;
            }
            
        }

        let newTrigger = {};
        if (!id) {
            newTrigger = {
                id: Sidekick.createId(existingIds),
                ...newData,
                text
            }
            updatedTriggers.push(newTrigger);
        }

        await Sidekick.setSetting(SETTING_KEYS.triggler.triggers, updatedTriggers);

        // Determine if ConditionLab is open and push the value back
        //const conditionLab = Object.values(ui.windows).find(v => v.id === DEFAULT_CONFIG.enhancedConditions.conditionLab.id);
        

        /* WIP
        const parentApp = this.parent;

        if (!parentApp) {
            return;
        }
        if (parentApp instanceof ConditionLab) {
            const conditionLab = parentApp;
            const row = this.data.conditionLabRow;
            id ? conditionLab.map[row].trigger = updatedTrigger.id : conditionLab.map[row].trigger = newTrigger.id;

            conditionLab.render(true);
        }
        
        if (parentApp instanceof MacroConfig) {
            const macroConfig = parentApp;

            macroConfig.setFlag(NAME, DEFAULT_CONFIG.triggler.flags.macro, id);
            macroConfig.render();
        }
        */
        
    }

    /**
     * 
     * @param {*} parts 
     */
    _constructString(parts) {
        const operatorText = DEFAULT_CONFIG.triggler.operators[parts.operator];
        const string = `${parts.category}.${parts.attribute}.${parts.property1} ${operatorText} ${parts.value}${parts.property2 ? ` ${parts.category}.${parts.attribute}.${parts.property2}` : ""}${parts.pcOnly ? ` (PCs Only)` : ""}${parts.npcOnly ? ` (NPCs Only)` : ""}${parts.notZero ? ` (Not 0)` : ""}`;
        return string;
    }
}