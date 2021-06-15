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
        //const conditionIdFlag = this.object.getFlag(NAME, FLAGS.enhancedConditions.conditionId);
        const conditionIdFlag = getProperty(this.object.data.flags, `${NAME}.${FLAGS.enhancedConditions.conditionId}`);
        if (!conditionIdFlag) return;

        // find the matching condition row
        const map = Sidekick.getSetting(SETTING_KEYS.enhancedConditions.map);

        if (!map) return;

        const conditionId = conditionIdFlag.replace(`${NAME}.`, "");
        const condition = map.find(c => c.id === conditionId);

        if (!condition) return;

        // update the effect data
        const newMap = duplicate(map);
        const update = duplicate(condition);
        update.activeEffect = formData;
        newMap[map.indexOf(condition)] = update;
        const preparedMap = EnhancedConditions._prepareMap(newMap);

        this.object.data = mergeObject(this.object.data, formData);

        Sidekick.setSetting(SETTING_KEYS.enhancedConditions.map, preparedMap, true);
        ui.notifications.info(game.i18n.localize("ENHANCED_CONDITIONS.Lab.SaveSuccess"));
        
        if (this._state == 2) await this.render();
    }
}