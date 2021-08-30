import { SETTING_KEYS } from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { EnhancedConditions } from "./enhanced-conditions.js";
import { NAME, FLAGS } from "../butler.js";

export default class EnhancedEffectConfig extends ActiveEffectConfig {

    /**
     * Get data for template rendering
     * @param {*} options 
     * @inheritdoc
     */
    getData(options) {
        const data = super.getData(options);

        return data;
    }

    /**
     * Override default update object behaviour
     * @param {*} formData 
     * @override
     */
    async _updateObject(event, formData) {
        const conditionIdFlag = getProperty(this.object.data.flags, `${NAME}.${FLAGS.enhancedConditions.conditionId}`);
        if (!conditionIdFlag) return;

        // find the matching condition row
        const map = ui.cub?.conditionLab?.map;

        if (!map && !map.length) return;

        const conditionId = conditionIdFlag.replace(`${NAME}.`, "");
        const condition = map.find(c => c.id === conditionId);

        if (!condition) return;

        // update the effect data
        
        condition.activeEffect = condition.activeEffect ? mergeObject(condition.activeEffect, formData) : formData;

        this.object.data = this.object.data ? mergeObject(this.object.data, formData) : formData;

    
        
        if (this._state == 2) await this.render();
        if (ui.cub.conditionLab) {
            ui.cub.conditionLab.map = ui.cub.conditionLab.updatedMap;
            //ui.cub.conditionLab.unsaved = true;
            ui.cub.conditionLab.render();
        }
    }
}