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
    static async _createTrigglerButton(html) {
        if (!game.user.isGM) {
            return;
        }

        const cubDiv = html.find("#combat-utility-belt");
        const trigglerButton = await renderTemplate(DEFAULT_CONFIG.triggler.templatePaths.trigglerButton);
        const $button = $(trigglerButton);
        
        cubDiv.append($button);

        $button.on("click", (event) => new TrigglerForm().render(true));
    }

    /**
     * Executes a trigger calling predefined actions
     * @param {*} trigger 
     * @param {*} target 
     */
    static async _executeTrigger(trigger, target) {
        const actor = target instanceof Actor ? target : (target instanceof TokenDocument || target instanceof Token) ? target.actor : null;
        const token = target instanceof TokenDocument ? target : target instanceof Token ? target.document : null;
        const conditionMap = Sidekick.getSetting(SETTING_KEYS.enhancedConditions.map);
        const matchedApplyConditions = conditionMap.filter(m => m.applyTrigger === trigger.id);
        const matchedRemoveConditions = conditionMap.filter(m => m.removeTrigger === trigger.id);
        const matchedMacros = game.macros.contents.filter(m => m.getFlag(NAME, DEFAULT_CONFIG.triggler.flags.macro) === trigger.id);
        const applyConditionNames = matchedApplyConditions.map(c => c.name);
        const removeConditionNames = matchedRemoveConditions.map(c => c.name);

        if (applyConditionNames.length) await EnhancedConditions.addCondition(applyConditionNames, target, {warn: false});
        if (removeConditionNames.length) await EnhancedConditions.removeCondition(removeConditionNames, target, {warn: false});

        for (const macro of matchedMacros) {
            await macro.execute({actor, token});
        }
    }

    /**
     * Processes an entity update and evaluates triggers
     * @param {*} entity 
     * @param {*} update 
     * @param {*} entryPoint1
     * @param {*} entryPoint2
     */
    static async _processUpdate(entity, update, entryPoint1, entryPoint2) {
        if (!entity || !update) return;

        // if (entryPoint1 && !hasProperty(update, entryPoint1)) {
        //     return;
        // }
        
        const triggers = Sidekick.getSetting(SETTING_KEYS.triggler.triggers);
        const entityType = entity instanceof Actor ? "Actor" : (entity instanceof Token || entity instanceof TokenDocument) ? "Token" : null;

        if (!entityType) {
            return;
        }

        /**
         * Avoid issues with Multi-Level Tokens by ignoring clone tokens
         * @see Issue #491
         */
        if(entity.flags 
            && ("multilevel-tokens" in entity.flags) 
            && ("stoken" in entity.flags["multilevel-tokens"])) {
                return;
        }

        const hasPlayerOwner = !!(entity.hasPlayerOwner ?? entity.document?.hasPlayerOwner);

        /**
         * process each trigger in turn, checking for a match in the update payload,
         * if a match is found, then test the values using the appropriate operator,
         * if values match, apply any mapped conditions
         * @todo reduce this down to just mapped triggers at least
         */
        for (let trigger of triggers) {
            const triggerType = trigger.triggerType || "simple";
            const pcOnly = trigger.pcOnly;
            const npcOnly = trigger.npcOnly;
            const notZero = trigger.notZero;

            if ((pcOnly && !hasPlayerOwner) || (npcOnly && hasPlayerOwner)) {
                continue;
            }

            let matchString1,
                matchString2;

            if (triggerType === "simple") {
                // example : actorData.system.attributes.hp.value or actorData.data.status.isShaken
                matchString1 = `${entryPoint1}${entryPoint1 ? `.` : ``}${trigger.category}${trigger.attribute ? `.${trigger.attribute}` : ``}${trigger.property1 ? `.${trigger.property1}` : ``}`;

                // example: actor.system.hp.max -- note this is unlikely to be in the update data
                matchString2 = `${entryPoint2}${entryPoint2 ? `.` : ``}${trigger.category}${trigger.attribute ? `.${trigger.attribute}` : ``}${trigger.property2 ? `.${trigger.property2}` : ``}`;
            }

            if (triggerType === "advanced") {
                // entry point differs based on actor vs token
                matchString1 = entityType === "Actor" ? trigger?.advancedActorProperty : trigger?.advancedTokenProperty;
                matchString2 = entityType === "Actor" ? trigger?.advancedActorProperty2 : trigger?.advancedTokenProperty2;
                trigger.value = trigger.advancedValue;
                trigger.operator = trigger.advancedOperator;
            }
            

            // If the update doesn't have a value that matches the 1st property this trigger should be skipped
            if (!hasProperty(update, matchString1)) {
                continue;
            }
            
            // Get a value from the update that matches the 1st property in the trigger
            const updateValue = getProperty(update, matchString1);

            // If the trigger is not allowed to run when value is zero, skip
            if (updateValue === 0 && notZero) {
                continue;
            }

            // Get a value from the entity that matches the 2nd property in the trigger (if any)
            const property2Value = getProperty(entity, matchString2);

            // We need the type later
            const updateValueType = typeof updateValue;

            // example: "="
            const operator = DEFAULT_CONFIG.triggler.operators[trigger.operator];
            
            // percent requires whole different handling
            const isPercent = trigger.value.endsWith("%");

            // example: "50" -- check if the value can be converted to a number
            const triggerValue = isPercent ? trigger.value.replace("%","") * 1 : Sidekick.coerceType(trigger.value, updateValueType);
            
            const triggers = [];

            /**
             * Switch on the operator checking it against the predefined operator choices
             * If it matches, then compare the values using the operator
             * @todo bulkify refactor this to add matched triggers to an array then execut the array at the end
             */
            switch (operator) {
                case DEFAULT_CONFIG.triggler.operators.eq:
                    if (isPercent) {
                        // example: (50 / 100) = 0.5;
                        const divisor = (triggerValue / 100);
                        // if property 1 update value = 50% of property 2 value
                        if (updateValue === (property2Value * divisor)) {
                            triggers.push({trigger, entity});
                           
                        }
                        break;
                    }
                    if (updateValue === triggerValue) {
                        // execute the trigger's condition mappings
                        triggers.push({trigger, entity});
                    }
                    break;

                case DEFAULT_CONFIG.triggler.operators.gt:
                    if (isPercent) {
                        // example: (50 / 100) = 0.5;
                        const divisor = (triggerValue / 100);
                        // if property 1 update value = 50% of property 2 value
                        if (updateValue > (property2Value * divisor)) {
                            triggers.push({trigger, entity});
                        }
                        break;
                    }
                    if (updateValue > triggerValue) {
                        triggers.push({trigger, entity});
                    }
                    break;

                case DEFAULT_CONFIG.triggler.operators.gteq:
                    if (isPercent) {
                        // example: (50 / 100) = 0.5;
                        const divisor = (triggerValue / 100);
                        // if property 1 update value = 50% of property 2 value
                        if (updateValue >= (property2Value * divisor)) {
                            triggers.push({trigger, entity});
                        }
                        break;
                    }
                    if (updateValue >= triggerValue) {
                        triggers.push({trigger, entity});
                    }
                    break;

                case DEFAULT_CONFIG.triggler.operators.lt:
                    if (isPercent) {
                        // example: (50 / 100) = 0.5;
                        const divisor = (triggerValue / 100);
                        // if property 1 update value = 50% of property 2 value
                        if (updateValue < (property2Value * divisor)) {
                            triggers.push({trigger, entity});
                        }
                        break;
                    }
                    if (updateValue < triggerValue) {
                        triggers.push({trigger, entity});
                    }
                    break;

                case DEFAULT_CONFIG.triggler.operators.lteq:
                    if (isPercent) {
                        // example: (50 / 100) = 0.5;
                        const divisor = (triggerValue / 100);
                        // if property 1 update value = 50% of property 2 value
                        if (updateValue <= (property2Value * divisor)) {
                            triggers.push({trigger, entity});
                        }
                        break;
                    }
                    if (updateValue <= triggerValue) {
                        triggers.push({trigger, entity});
                    }
                    break;
                
                case DEFAULT_CONFIG.triggler.operators.ne:
                    if (isPercent) {
                        // example: (50 / 100) = 0.5;
                        const divisor = (triggerValue / 100);
                        // if property 1 update value = 50% of property 2 value
                        if (updateValue !== (property2Value * divisor)) {
                            triggers.push({trigger, entity});
                        }
                        break;
                    }
                    if (updateValue !== triggerValue) {
                        triggers.push({trigger, entity});
                    }
                    break;
            
                default:
                    break;
            }

            for (const {trigger, entity} of triggers) {
                await Triggler._executeTrigger(trigger, entity);
            }
        }
    }

    /**
     * Update Actor handler
     * @param {*} actor 
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    static _onUpdateActor(actor, update, options, userId) {
        if (game.userId !== userId || actor.isToken) {
            return;
        }

        const dataProp = `system`;
        const dataDataProp = `system`;

        Triggler._processUpdate(actor, update, dataProp, dataDataProp);
    }

    /**
     * Update token handler
     * @param {Token} token
     * @param {*} update 
     * @param {*} options 
     * @param {*} userId 
     */
    static _onUpdateToken(token, update, options, userId) {
        if (game.userId !== userId) {
            return;
        }

        const actorDataProp = `actorData.system`;
        const actorProp = `actor.system`;
        
        Triggler._processUpdate(token, update, actorDataProp, actorProp);
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