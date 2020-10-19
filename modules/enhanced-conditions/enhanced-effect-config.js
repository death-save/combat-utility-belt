import { SETTING_KEYS } from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { EnhancedConditions } from "./enhanced-conditions.js";

export default class EnhancedEffectConfig extends ActiveEffectConfig {

    /**
     * Override default update object behaviour
     * @param {*} formData 
     * @override
     */
    async _updateObject(event, formData) {
        formData = expandObject(formData);
        formData.changes = formData.changes ? Object.values(formData.changes) : [];

        for ( let c of formData.changes ) {
            if ( Number.isNumeric(c.value) ) c.value = parseFloat(c.value);
        }
        console.log(formData);

        // find the matching condition row
        const map = Sidekick.getSetting(SETTING_KEYS.enhancedConditions.map);

        if (!map) return;

        const condition = map.find(c => c.id === this.object.id);

        if (!condition) return;

        // update the effect data
        const newMap = duplicate(map);
        const update = duplicate(condition);
        update.activeEffect = formData;
        newMap[map.indexOf(condition)] = update;
        const preparedMap = EnhancedConditions._prepareMap(newMap);
        
        Sidekick.setSetting(SETTING_KEYS.enhancedConditions.map, preparedMap);
    }
}