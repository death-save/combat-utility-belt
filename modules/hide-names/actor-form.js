import { DEFAULT_CONFIG, PATH, NAME, FLAGS, SETTING_KEYS } from "../butler.js";
import { Sidekick } from "../sidekick.js";

export class HideNPCNamesActorForm extends FormApplication {
    constructor(object, options={}) {
        super(object, options);

        this.actor = object;
    }

    /**
     * Default Options for the form
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: DEFAULT_CONFIG.hideNames.actorForm.id,
            title: game.i18n.localize(`${NAME}.${"HIDE_NAMES.ActorForm.Title"}`),
            template: `${PATH}/templates/actor-hide-name.hbs`,
            classes: ["sheet"],
            width: "auto",
            height: "auto",
            resizable: false,
            closeOnSubmit: true
        });
    }

    /**
     * Get data for the form
     */
    getData() {
        const actor = this.actor;
        const dispositionEnum = actor?.token?.disposition ?? actor?.prototypeToken?.disposition;
        const disposition = Sidekick.getKeyByValue(CONST.TOKEN_DISPOSITIONS, dispositionEnum);
        const dispositionIcon = DEFAULT_CONFIG.hideNames[`${disposition.toLowerCase()}Icon`];
        const enableSetting = Sidekick.getSetting(SETTING_KEYS.hideNames[`enable${disposition.titleCase()}`]);
        const settingName = game.i18n.localize(`SETTINGS.HideNames.Enable${disposition.titleCase()}N`);
        const enableFlag = actor.getFlag(NAME, FLAGS.hideNames.enable);
        const enable = enableFlag ?? enableSetting;
        const replacementSetting = Sidekick.getSetting(SETTING_KEYS.hideNames[disposition.toLowerCase() + `NameReplacement`]);
        const replacementFlag = actor.getFlag(NAME, FLAGS.hideNames.replacementName);
        const replacementName = replacementFlag ?? replacementSetting;
        
        return {
            enable,
            enableSetting,
            settingName,
            disposition,
            dispositionIcon,
            replacementName
        }
    }

    /**
     * Attach listeners for events
     * @param {*} html 
     */
    activateListeners(html) {
        const saveButton = html.find("button[name='save']");

        saveButton.on("click", event => this._onClickSave(event));
    }

    /**
     * Save button click handler
     * @param {*} event 
     */
    _onClickSave(event) {
        this.submit();
    }

    /**
     * Update the object on submit
     * @param {*} formData 
     */
    async _updateObject(event, formData) {
        const actor = this.object;
        const enable = formData[`enable-hide-name`];
        const replacementName = formData[`replacement-name`]; 

        await actor.update({
            [`flags.${NAME}.${FLAGS.hideNames.enable}`] : enable ?? false,
            [`flags.${NAME}.${FLAGS.hideNames.replacementName}`] : replacementName ?? null 
        });
    }
}