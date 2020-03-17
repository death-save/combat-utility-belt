/**
 * 
 */
class CUBCombatTrackerConfig extends CombatTrackerConfig {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/combat-utility-belt/templates/combat-config.html",
            height: 500
        });
    }

    getData() {
        return mergeObject(super.getData, {
            cubSettings: CUBSidekick.getGadgetSetting(CUB.combatTracker.GADGET_NAME + "(" + CUB.combatTracker.SETTINGS_DESCRIPTORS.TrackerConfigSettingsN + ")")
        });
    }

    _updateObject(event, formData) {
        super._updateObject(event, formData);

        const icon1 = formData.icon1;
        const resource2 = formData.resource2;
        const icon2 = formData.icon2;

        CUBSidekick.setGadgetSetting(CUB.combatTracker.GADGET_NAME + "(" + CUB.combatTracker.SETTINGS_DESCRIPTORS.TrackerConfigSettingsN + ")", {
            icon1: icon1,
            resource2: resource2,
            icon2: icon2
        });
    }
}