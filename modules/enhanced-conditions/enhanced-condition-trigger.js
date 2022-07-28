import { DEFAULT_CONFIG, SETTING_KEYS } from "../butler.js";
import { Sidekick } from "../sidekick.js";

/**
 * Enhanced Condition Trigger Config Application
 */
export default class EnhancedConditionTriggerConfig extends FormApplication {
    constructor(object, options) {
        super(object, options);

        this.object = this.object ?? {};

        this.initialObject = foundry.utils.duplicate(this.object);
    }

    /**
     * defaultOptions
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: DEFAULT_CONFIG.enhancedConditions.triggerConfig.id,
            title: DEFAULT_CONFIG.enhancedConditions.triggerConfig.title,
            template: DEFAULT_CONFIG.enhancedConditions.templates.triggerConfig,
            classes: ["sheet"],
            closeOnSubmit: false,
            width: 500
        });
    }

    /**
     * Gets data for template rendering
     * @returns {Object} data
     */
    getData() {
        const applyTriggerId = this.object.applyTrigger;
        const removeTriggerId = this.object.removeTrigger;

        const triggerChoices = Sidekick.getSetting(SETTING_KEYS.triggler.triggers) ?? [];

        const data = {
            condition: this.object,
            applyTriggerId,
            removeTriggerId,
            triggerChoices,
        };

        return data;
    }

    /**
     * Update Object on Form Submission
     * @param {*} event 
     * @param {*} formData 
     */
    async _updateObject(event, formData) {
        this.object.macros = [];

        for (const field in formData) {
            const type = field.split("-").slice(-1).pop() ?? "";
            this.object[`${type}Trigger`] = formData[field];
        }

        const map = game.cub.conditions;
        const newMap = foundry.utils.duplicate(map);

        let conditionIndex = newMap.findIndex(c => c.id === this.object.id);
        newMap[conditionIndex] = this.object;
        Sidekick.setSetting(SETTING_KEYS.enhancedConditions.map, newMap);
        this.render();
    }
}