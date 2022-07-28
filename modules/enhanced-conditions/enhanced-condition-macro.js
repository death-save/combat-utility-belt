import { DEFAULT_CONFIG, SETTING_KEYS } from "../butler.js";
import { Sidekick } from "../sidekick.js";

/**
 * Enhanced Condition Macro Config Application
 */
export default class EnhancedConditionMacroConfig extends FormApplication {
    constructor(object, options) {
        super(object, options);

        this.object = this.object ?? {};
        this.object.macros = this.object.macros ?? [];

        this.initialObject = foundry.utils.duplicate(this.object);
    }

    /**
     * defaultOptions
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: DEFAULT_CONFIG.enhancedConditions.macroConfig.id,
            title: DEFAULT_CONFIG.enhancedConditions.macroConfig.title,
            template: DEFAULT_CONFIG.enhancedConditions.templates.macroConfig,
            classes: ["sheet"],
            closeOnSubmit: false
        });
    }

    /**
     * Gets data for template rendering
     * @returns {Object} data
     */
    getData() {
        const conditionMacros = this.object.macros;
        const applyMacroId = conditionMacros.find(m => m.type === "apply")?.id;
        const removeMacroId = conditionMacros.find(m => m.type === "remove")?.id;

        const macroChoices = game.macros?.contents?.map(m => {
            return {id: m.id, name: m.name}
        });

        const data = {
            condition: this.object,
            applyMacroId,
            removeMacroId,
            macroChoices,
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
            const tempMacro = {id: formData[field], type: type};
            this.object.macros.push(tempMacro);
        }

        const map = game.cub.conditions;
        const newMap = foundry.utils.duplicate(map);

        let conditionIndex = newMap.findIndex(c => c.id === this.object.id);
        newMap[conditionIndex] = this.object;
        Sidekick.setSetting(SETTING_KEYS.enhancedConditions.map, newMap);
        this.render();
    }
}