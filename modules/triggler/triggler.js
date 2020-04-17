import { Sidekick } from "../sidekick.js";
import { SETTING_KEYS, DEFAULT_CONFIG, NAME, PATH } from "../butler.js";
import { EnhancedConditions } from "../enhanced-conditions/enhanced-conditions.js";
import { TrigglerForm } from "./triggler-form.js";

/**
 * Handles triggers for other gadgets in the module... or does it?!
 */
export class Triggler {
    /**
     * Creates a button for the Condition Lab
     * @param {Object} html the html element where the button will be created
     */
    static _createTrigglerButton(html) {
        const cubDiv = html.find("#combat-utility-belt");

        const trigglerButton = $(
            `<button id="triggler-form" data-action="triggler">
                    <i class="fas fa-angle-double-right"></i><i class="fas fa-angle-double-left"></i> ${DEFAULT_CONFIG.triggler.form.title}
                </button>`
        );
        
        cubDiv.append(trigglerButton);

        trigglerButton.click(ev => {
            new TrigglerForm().render(true);
        });
    }
    /**
     * Update token handler
     * @param {*} scene 
     * @param {*} sceneId 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    static _onUpdateToken(scene, sceneId, update, options, userId) {
        if (!game.userId === userId) {
            return;
        }

        if (!hasProperty(update, "actorData.data")) {
            return;
        }

        const token = canvas.tokens.get(update._id);
        const triggers = Sidekick.getSetting(SETTING_KEYS.triggler.triggers);
        const conditionMap = Sidekick.getSetting(SETTING_KEYS.enhancedConditions.map);

        /**
         * process each trigger in turn, checking for a match in the update payload,
         * if a match is found, then test the values using the appropriate operator,
         * if values match, apply any mapped conditions
         * @todo reduce this down to just mapped triggers at least
         */
        for (let trigger of triggers) {
            const pcOnly = trigger.pcOnly;

            if (pcOnly && !update.data.actorData.isPC) {
                return;
            }

            // example : actorData.data.attributes.hp.value
            const matchString1 = `actorData.data.${trigger.category}.${trigger.attribute}.${trigger.property1}`;
            const matchString2 = `actor.data.data.${trigger.category}.${trigger.attribute}.${trigger.property2}`;

            if (!hasProperty(update, matchString1)) {
                continue;
            }
            
            const updateValue = getProperty(update, matchString1);
            const property2Value = getProperty(token, matchString2);
            const updateValueType = typeof updateValue;
            // example: "="
            const operator = DEFAULT_CONFIG.triggler.operators[trigger.operator];
            // example: "50" -- check if the value can be converted to a number
            
            // percent requires whole different handling
            const isPercent = trigger.value.endsWith("%");

            const triggerValue = isPercent ? trigger.value.replace("%","") * 1 : Sidekick.coerceType(trigger.value, updateValueType);
            
            switch (operator) {
                case DEFAULT_CONFIG.triggler.operators.eq:
                    if (isPercent) {
                        // example: (50 / 100) = 0.5;
                        const divisor = (triggerValue / 100);
                        // if property 1 update value = 50% of property 2 value
                        if (updateValue === (property2Value * divisor)) {
                            const matchedConditions = conditionMap.filter(m => m.trigger === trigger.id);
                            matchedConditions.forEach(m => EnhancedConditions.applyCondition(token, m.name));
                            break;
                        }
                    }
                    if (updateValue === triggerValue) {
                        // execute the trigger's condition mappings
                        const matchedConditions = conditionMap.filter(m => m.trigger === trigger.id);
                        matchedConditions.forEach(m => EnhancedConditions.applyCondition(token, m.name));
                        break;
                    }
                    break;

                case DEFAULT_CONFIG.triggler.operators.gt:
                    if (isPercent) {
                        // example: (50 / 100) = 0.5;
                        const divisor = (triggerValue / 100);
                        // if property 1 update value = 50% of property 2 value
                        if (updateValue > (property2Value * divisor)) {
                            const matchedConditions = conditionMap.filter(m => m.trigger === trigger.id);
                            matchedConditions.forEach(m => EnhancedConditions.applyCondition(token, m.name));
                            break;
                        }
                    }
                    if (updateValue > triggerValue) {
                        // execute the trigger's condition mappings
                        const matchedConditions = conditionMap.filter(m => m.trigger === trigger.id);
                        matchedConditions.forEach(m => EnhancedConditions.applyCondition(token, m.name));
                    }
                    break;

                case DEFAULT_CONFIG.triggler.operators.gteq:
                    if (isPercent) {
                        // example: (50 / 100) = 0.5;
                        const divisor = (triggerValue / 100);
                        // if property 1 update value = 50% of property 2 value
                        if (updateValue >= (property2Value * divisor)) {
                            const matchedConditions = conditionMap.filter(m => m.trigger === trigger.id);
                            matchedConditions.forEach(m => EnhancedConditions.applyCondition(token, m.name));
                            break;
                        }
                    }
                    if (updateValue >= triggerValue) {
                        // execute the trigger's condition mappings
                        const matchedConditions = conditionMap.filter(m => m.trigger === trigger.id);
                        matchedConditions.forEach(m => EnhancedConditions.applyCondition(token, m.name));
                    }
                    break;

                case DEFAULT_CONFIG.triggler.operators.lt:
                    if (isPercent) {
                        // example: (50 / 100) = 0.5;
                        const divisor = (triggerValue / 100);
                        // if property 1 update value = 50% of property 2 value
                        if (updateValue < (property2Value * divisor)) {
                            const matchedConditions = conditionMap.filter(m => m.trigger === trigger.id);
                            matchedConditions.forEach(m => EnhancedConditions.applyCondition(token, m.name));

                            const matchedMacros = game.macros.entities.filter(m => m.getFlag(NAME, DEFAULT_CONFIG.triggler.flags.macro));
                            matchedMacros.forEach(m => m.execute());
                            break;
                        }
                    }
                    if (updateValue < triggerValue) {
                        // execute the trigger's condition mappings
                        const matchedConditions = conditionMap.filter(m => m.trigger === trigger.id);
                        matchedConditions.forEach(m => EnhancedConditions.applyCondition(token, m.name));
                    }
                    break;

                case DEFAULT_CONFIG.triggler.operators.lteq:
                    if (isPercent) {
                        // example: (50 / 100) = 0.5;
                        const divisor = (triggerValue / 100);
                        // if property 1 update value = 50% of property 2 value
                        if (updateValue <= (property2Value * divisor)) {
                            const matchedConditions = conditionMap.filter(m => m.trigger === trigger.id);
                            matchedConditions.forEach(m => EnhancedConditions.applyCondition(token, m.name));
                            break;
                        }
                    }
                    if (updateValue <= triggerValue) {
                        // execute the trigger's condition mappings
                        const matchedConditions = conditionMap.filter(m => m.trigger === trigger.id);
                        matchedConditions.forEach(m => EnhancedConditions.applyCondition(token, m.name));
                    }
                    break;
                
                case DEFAULT_CONFIG.triggler.operators.ne:
                    if (isPercent) {
                        // example: (50 / 100) = 0.5;
                        const divisor = (triggerValue / 100);
                        // if property 1 update value = 50% of property 2 value
                        if (updateValue !== (property2Value * divisor)) {
                            const matchedConditions = conditionMap.filter(m => m.trigger === trigger.id);
                            matchedConditions.forEach(m => EnhancedConditions.applyCondition(token, m.name));
                            break;
                        }
                    }
                    if (updateValue !== triggerValue) {
                        // execute the trigger's condition mappings
                        const matchedConditions = conditionMap.filter(m => m.trigger === trigger.id);
                        matchedConditions.forEach(m => EnhancedConditions.applyCondition(token, m.name));
                    }
                    break;
            
                default:
                    break;
            }
        }
    }

    /**
     * 
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    static async _onRenderMacroConfig(app, html, data) {
        const typeSelect = html.find("select[name='type']");
        const typeSelectDiv = typeSelect.closest("div");
        const flag = app.object.getFlag(NAME, DEFAULT_CONFIG.triggler.flags.macro);
        const triggers = Sidekick.getSetting(SETTING_KEYS.triggler.triggers);

        const triggerSelectTemplate = DEFAULT_CONFIG.triggler.templatePaths.macroTriggerSelect;
        const triggerData = {
            flag,
            triggers
        }
        const triggerSelect = await renderTemplate(triggerSelectTemplate, triggerData);

        typeSelectDiv.after(triggerSelect);
    }
}