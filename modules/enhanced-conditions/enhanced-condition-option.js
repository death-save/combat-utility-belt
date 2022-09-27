import { DEFAULT_CONFIG, NAME, SETTING_KEYS } from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { EnhancedConditions } from "./enhanced-conditions.js";

/**
 * Enhanced Condition Trigger Config Application
 */
export default class EnhancedConditionOptionConfig extends FormApplication {
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
            id: DEFAULT_CONFIG.enhancedConditions.optionConfig.id,
            title: DEFAULT_CONFIG.enhancedConditions.optionConfig.title,
            template: DEFAULT_CONFIG.enhancedConditions.templates.optionConfig,
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
        const optionData = this.object.options;

        const data = {
            condition: this.object,
            optionData
        };

        return data;
    }

    /**
     * Application listeners
     * @param {jQuery} html 
     */
    activateListeners(html) {
        const checkboxes = html.find("input[type='checkbox']");

        for (const checkbox of checkboxes) {
            checkbox.addEventListener("change", (event) => this._onCheckboxChange(event));
        }
    }

    /**
     * Checkbox change event handler
     * @param {*} event 
     * @returns 
     */
    _onCheckboxChange(event) {
        if (!event.target?.checked) return;
        const targetName = event.target?.name;
        const propertyName = Sidekick.toCamelCase(targetName, "-");
        const specialStatusEffectsProps = Object.values(DEFAULT_CONFIG.enhancedConditions.specialStatusEffects).map((k) =>
            k.optionProperty
        );

        if (!propertyName || !specialStatusEffectsProps) return;
        
        if (specialStatusEffectsProps.includes(propertyName)) {
            event.detail = (event.detail && event.detail instanceof Object) ? event.detail : {};
            event.detail.statusName = targetName;
            event.detail.statusLabel = event.target.nextElementSibling?.innerText;
            event.detail.conditionId = this.object.id;
            return EnhancedConditionOptionConfig._onSpecialStatusEffectToggle(event);
        }
    }

    /**
     * Special Status Effect toggle handler
     * @param {*} event 
     */
    static async _onSpecialStatusEffectToggle(event) {
        // is another condition already using this special status effect?
        const existingCondition = game.cub.conditions.find(c => {
            const optionValue = foundry.utils.getProperty(c, `options.${Sidekick.toCamelCase(event.detail.statusName, "-")}`);
            return c.id !== event.detail.conditionId && optionValue == true;
        });
        if (existingCondition) {
            event.preventDefault();
            // raise a dialog asking for override
            const title = game.i18n.localize(`${NAME}.ENHANCED_CONDITIONS.OptionConfig.SpecialStatusEffectOverride.Title`);
            const content = game.i18n.format(`${NAME}.ENHANCED_CONDITIONS.OptionConfig.SpecialStatusEffectOverride.Content`, {existingCondition: existingCondition.name, statusEffect: event.detail.statusLabel ?? event.detail.statusName});
            const yes = () => {};
            const no = () => {
                return event.target.checked = false;
            };
            const defaultYes = false;
            return Dialog.confirm({title, content, yes, no, defaultYes},{});
        }

        return event;
    }

    /**
     * Update Object on Form Submission
     * @param {*} event 
     * @param {*} formData 
     */
    async _updateObject(event, formData) {
        this.object.options = {};

        for (const field in formData) {
            const propertyName = Sidekick.toCamelCase(field, "-");
            this.object.options[propertyName] = formData[field];
        }

        const map = game.cub.conditions;
        const newMap = foundry.utils.duplicate(map);

        let conditionIndex = newMap.findIndex(c => c.id === this.object.id);
        newMap[conditionIndex] = this.object;
        await Sidekick.setSetting(SETTING_KEYS.enhancedConditions.map, newMap);
        this.render();
    }
}