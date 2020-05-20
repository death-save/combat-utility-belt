import { DEFAULT_CONFIG, GADGETS, NAME, PATH, SETTING_KEYS, WIKIPATH } from "./butler.js";
import { Sidekick } from "./sidekick.js";

export class CUBPuter extends FormApplication {
    constructor(object, options={}) {
        super(object, options);

        this.currentGadgetId = object?.currentGadget?.id || null;
    }

    /**
     * Get options for the form
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: DEFAULT_CONFIG.cubPuter.id,
            title: DEFAULT_CONFIG.cubPuter.title,
            template: `${PATH}/templates/cub-puter.html`,
            classes: ["sheet"],
            width: 600,
            height: "auto",
            resizable: true,
            closeOnSubmit: false
        });
    }

    /**
     * 
     */
    getData() {
        const gadgets = GADGETS;
        // Use the currently selected gadget or default to the first in the list
        const currentGadget = gadgets && this.currentGadgetId ? gadgets[this.currentGadgetId] : gadgets[Object.keys(gadgets)[0]];
        currentGadget.id = Sidekick.getKeyByValue(gadgets, currentGadget);
        this.currentGadgetId = !this.currentGadgetId && currentGadget.id ? currentGadget.id : null;
        const gadgetSettingKeys = hasProperty(SETTING_KEYS, currentGadget.id) ? Object.values(SETTING_KEYS[currentGadget.id]).map(k => `${NAME}.${k}`) : [];

        const settings = Array.from(game.settings.settings.entries()).filter(entry => {
                const [key, setting] = entry;

                if (gadgetSettingKeys.includes(key)) {
                    const value = game.settings.get(NAME, setting.key);
                    const isObject = value instanceof Object;
                    const apiOnly = setting.apiOnly;

                    if (isObject || apiOnly) {
                        return false;
                    }
                    
                    return true;
                };
            }).map(entry => {
                const [key, setting] = entry;
                // Update setting data
                const s = duplicate(setting);
                s.value = game.settings.get(s.module, s.key);
                s.type = setting.type instanceof Function ? setting.type.name : "String";
                s.isCheckbox = setting.type === Boolean;
                s.isSelect = s.choices !== undefined;
                s.isRange = (setting.type === Number) && s.range;

                return s;
        });

        const menus = [];

        return {
            gadgets,
            currentGadget,
            settings,
            menus
        }
    }

    /**
     * 
     * @param {*} html 
     */
    activateListeners(html) {
        super.activateListeners(html);

        const gadgetSelect = html.find("select[name='gadget']");
        const wikiAnchor = html.find("a[id='wiki']");
        const restoreDefaults = html.find("button[name='restore']");

        gadgetSelect.on("change", event => this._onGadgetSelect(event, html));
        wikiAnchor.on("click", event => this._onExternalLink(event, html));
        restoreDefaults.on("click", event => this._onRestoreDefaults(event, html));
    }

    _onLoad(event, html) {
        const greeting = `Greetings [INSERT NAME HERE], how would you like to kill your players today? ... I meant player-characters of course! You believe me right?`
        var i = 0;
        var txt = 'Lorem ipsum typing effect!'; /* The text */
        var speed = 50; /* The speed/duration of the effect in milliseconds */

        function typeWriter() {
            if (i < txt.length) {
                document.getElementById("demo").innerHTML += txt.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            }
        }
    }

    /**
     * 
     * @param {*} event 
     * @param {*} html 
     */
    _onGadgetSelect(event, html) {
        const newGadget = event.target.value;
        this.currentGadgetId = newGadget;
        this.render();
    }

    /**
     * 
     * @param {*} event 
     * @param {*} html 
     */
    _onExternalLink(event, html) {
        const gadgetName = html.find("select[name='gadget']").first().val();
        const href = GADGETS[gadgetName].wiki;
        window.open(href);
    }

    /**
     * 
     * @param {*} event 
     * @param {*} html 
     */
    async _onRestoreDefaults(event, html) {
        event.preventDefault();
        
        const button = event.target;
        const form = button.form;
        const formData = Sidekick.buildFormData(this._getFormData(form));
        const keys = duplicate(Object.keys(formData));
        const restored = [];

        for (const k of keys) {
            const s = game.settings.settings.get(k);

            if (!s) {
                continue;
            }

            const d = s.default;
            const v = game.settings.get(s.module, s.key);

            if ( v !== d ) {
              await game.settings.set(s.module, s.key, d);
              restored.push(k);
            }
        }

        if (!restored.length) {
            return;
        }

        ui.notifications.info(`${GADGETS[this.currentGadgetId].name} ${game.i18n.localize("NOTIFICATIONS.CUBPuter.RestoreDefaults")}`)
        this.render();
    }

    /**
     * 
     * @param {*} event 
     * @param {*} formData 
     */
    async _updateObject(event, formData) {
        const updated = [];
        for ( let [k, v] of Object.entries(formData) ) {
          let s = game.settings.settings.get(k);
          if (!s) {
              continue;
          }
          let current = game.settings.get(s.module, s.key);
          if ( v !== current ) {
            await game.settings.set(s.module, s.key, v);
            updated.push(k);
          }
        }

        if (updated.length) {
            ui.notifications.info(`${GADGETS[this.currentGadgetId].name} ${game.i18n.localize("NOTIFICATIONS.CUBPuter.SaveSettings")}`);
        }
      }
}

/**
 * Create the sidebar button
 * @param {*} html 
 */
export function createCUBPuterButton(html) {
    const cubDiv = html.find("#combat-utility-belt");

    const cubPuterButton = $(
        `<button id="${DEFAULT_CONFIG.cubPuter.buttonId}" data-action="cub-puter" title="${game.i18n.localize("SETTINGS.CUBPuter.ButtonH")}">
            <i class="fas fa-desktop"></i> ${DEFAULT_CONFIG.cubPuter.title}
        </button>`
    );
    
    cubDiv.append(cubPuterButton);

    cubPuterButton.on("click", event => new CUBPuter().render(true));
}