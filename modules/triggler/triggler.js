import { Sidekick } from "../sidekick";
import { SETTING_KEYS, DEFAULT_CONFIG } from "../butler";
import { EnhancedConditions } from "../enhanced-conditions/enhanced-conditions";

export class Triggler {
    _onUpdateToken(scene, sceneId, update, options, userId) {
        if (!game.userId === userId) {
            return;
        }

        if (!hasProperty(update, "actorData.data")) {
            return;
        }

        const triggers = Sidekick.getSetting(SETTING_KEYS.triggler.triggers);
        const conditionMap = Sidekick.getSetting(SETTING_KEYS.enhancedConditions.map);

        for (let trigger of triggers) {
            // example : actorData.data.attributes.hp.value
            const matchString = `actorData.data.${trigger.category}.${trigger.attribute}.${trigger.property}`;
            if (!hasProperty(update, matchString)) {
                continue;
            }
            
            // do something
            const updateValue = getProperty(update, matchString);
            // example: =
            const operator = trigger.operator;
            // example: 50
            const triggerValue = trigger.value;
            
            switch (operator) {
                case DEFAULT_CONFIG.triggler.operators.eq:
                    if (updateValue === triggerValue) {
                        // execute the trigger's condition mappings
                        const matchedConditions = conditionMap.filter(m => m.trigger === trigger.id);
                        matchedConditions.forEach(m => EnhancedConditions.applyCondition(update.id, m.name))
                    }
                    break;

                case DEFAULT_CONFIG.triggler.operators.gt:
                    if (updateValue > triggerValue) {
                        //do something
                    }
                    break;

                case DEFAULT_CONFIG.triggler.operators.gteq:
                    if (updateValue >= triggerValue) {
                        //do something
                    }
                    break;

                case DEFAULT_CONFIG.triggler.operators.lt:
                    if (updateValue < triggerValue) {
                        //do something
                    }
                    break;

                case DEFAULT_CONFIG.triggler.operators.lteq:
                    if (updateValue <= triggerValue) {
                        //do something
                    }
                    break;
                
                case DEFAULT_CONFIG.triggler.operators.ne:
                    if (updateValue !== triggerValue) {
                        //do something
                    }
                    break;
            
                default:
                    break;
            }
        }
        

        // assess the update for keys that match triggers
        // start at actorData.data
    }
}