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
            resizable: true,
            closeOnSubmit: false
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
        const triggerType = this.data.triggerType || "simple";
        const isSimpleTrigger = triggerType == "simple";
        const isAdvancedTrigger = triggerType == "advanced";
        const category = this.data.category || null;
        const attribute = this.data.attribute || null;
        const property1 = this.data.property1 || null;
        const operator = this.data.operator || null;
        const value = this.data.value || null;
        const property2 = this.data.property2 || null;
        const advancedName = this.data.advancedName || null;
        const advancedActorProperty = this.data.advancedActorProperty || null;
        const advancedActorProperty2 = this.data.advancedActorProperty2 || null;
        const advancedTokenProperty = this.data.advancedTokenProperty || null;
        const advancedTokenProperty2 = this.data.advancedTokenProperty2 || null;
        const advancedOperator = this.data.advancedOperator || null;
        const advancedValue = this.data.advancedValue || null;
        const pcOnly = this.data.pcOnly || null;
        const npcOnly = this.data.npcOnly || null;
        const notZero = this.data.notZero || null;
        const actorModel = game.system.model?.Actor;
        const mergedModel = actorModel ? Object.keys(actorModel).reduce((a, t, i) => {
            return foundry.utils.mergeObject(a, actorModel[t]);
        }, {}) : null;
        const categories = mergedModel ? Object.keys(mergedModel) : null;
        const attributes = category ? Object.keys(mergedModel[category]) : null;
        const properties = category && attribute ? Object.keys(mergedModel[category][attribute]) : null;
        const operators = DEFAULT_CONFIG.triggler.operators;

        const triggerSelected = id && triggers ? true : false;

        if (!categories) {
            ui.notifications.warn("Simple Trigger not supported. Try Advanced Trigger");
            //return false;
        }

        return {
            id,
            triggerSelected,
            triggers,
            isSimpleTrigger,
            isAdvancedTrigger,
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
            advancedName,
            advancedActorProperty,
            advancedActorProperty2,
            advancedTokenProperty,
            advancedTokenProperty2,
            advancedOperator,
            advancedValue,
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
        const triggerTypeRadio = html.find("input[name='triggerType']");
        const cancelButton = html.find("button[name='cancel']");
        
        triggerSelect.on("change", event => {
            this.data = {};
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
            this.data = {};
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

        triggerTypeRadio.on("change", event => {
            this.data.triggerType = event.currentTarget.value;
            this.render();
        });

        cancelButton.on("click", event => {
            this.close();
        });
    }

    /**
     * Update the Trigger object
     * @param {*} event 
     * @param {*} formData 
     */
    async _updateObject(event, formData) {
        if (!formData.category && (!formData.advancedActorProperty && !formData.advancedTokenProperty)) {
            return;
        }

        const triggerType = formData?.triggerType;

        if (triggerType === "advanced" && !formData.advancedName.length) {
            ui.notifications.warn(game.i18n.localize("CUB.TRIGGLER.App.AdvancedTrigger.Name.Warning"));
            return false;
        }

        const triggers = Sidekick.getSetting(SETTING_KEYS.triggler.triggers);
        const existingIds = triggers ? triggers.map(t => t.id) : null;
        const text = triggerType === "simple" ? this._constructString(formData) : formData.advancedName;

        if (!text) return false;

        const id = this.data.id;
        const newData = duplicate(formData);
        delete newData.triggers;

        const updatedTriggers = duplicate(triggers);
        const existingTrigger = triggers.find(t => t.id === id);
        const isNew = existingTrigger ? (triggerType === "simple" || existingTrigger.advancedName !== text) : true;


        if (!isNew) {
            const updatedTrigger = mergeObject(existingTrigger, newData);
            updatedTrigger.text = text;
            updatedTriggers[triggers.indexOf(existingTrigger)] = updatedTrigger;
            this.data = updatedTrigger;
        }

        if (isNew) {
            const newTrigger = {
                id: Sidekick.createId(existingIds),
                ...newData,
                text
            }
            updatedTriggers.push(newTrigger);
            this.data = newTrigger;
        }

        const setting = await Sidekick.setSetting(SETTING_KEYS.triggler.triggers, updatedTriggers);
        if (!!setting) ui.notifications.info(game.i18n.localize("CUB.TRIGGLER.App.SaveSuccessful"));

        this.render();

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
     * Construct a string based on trigger parts
     * @param {*} parts 
     */
    _constructString(parts) {
        const triggerType = parts.triggerType;
        const operatorText = DEFAULT_CONFIG.triggler.operators[parts.operator];
        const advancedOperatorText = DEFAULT_CONFIG.triggler.operators[parts.advancedOperator];
        let string = null;

        switch (triggerType) {
            case "simple":
                string = `${parts.category}.${parts.attribute}.${parts.property1} ${operatorText} ${parts.value}${parts.property2 ? ` ${parts.category}.${parts.attribute}.${parts.property2}` : ""}${parts.pcOnly ? ` (PCs Only)` : ""}${parts.npcOnly ? ` (NPCs Only)` : ""}${parts.notZero ? ` (Not 0)` : ""}`;
                break;
            
            case "advanced":
                string = `${parts.advancedProperty} ${advancedOperatorText} ${parts.advancedValue}${parts.advancedProperty2 ? ` ${parts.advancedProperty2}` : ""}${parts.pcOnly ? ` (PCs Only)` : ""}${parts.npcOnly ? ` (NPCs Only)` : ""}${parts.notZero ? ` (Not 0)` : ""}`
                break;
            
            default:
                break;
        }

        return string;
    }
}