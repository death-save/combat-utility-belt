import { DEFAULT_CONFIG, GADGETS, NAME, PATH, SETTING_KEYS, WIKIPATH } from "./butler.js";
import { Sidekick } from "./sidekick.js";
import AboutApp from "./about.mjs"

export class CUBPuter extends FormApplication {
    constructor(object, options={}) {
        super(object, options);

        this.currentGadgetId = object?.currentGadget?.id || null;
        this.firstRender = true;
        this.typewriter = null;
    }

    /**
     * Get options for the form
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: DEFAULT_CONFIG.cubPuter.id,
            title: DEFAULT_CONFIG.cubPuter.title,
            template: `${PATH}/templates/cub-puter.html`,
            //classes: ["cub-puter-crt"],
            width: 750,
            height: "auto",
            top: 200,
            left: 400,
            background: "#000",
            popOut: true,
            resizable: true,
            closeOnSubmit: false
        });
    }

    /**
     * Passes data to the template on render
     */
    getData() {
        const moduleVersion = game.modules.get(NAME)?.version;
        const username = game.user.name;
        const gadgets = GADGETS;
        const config = Sidekick.getSetting(SETTING_KEYS.cubPuter.config);
        const currentGadget = gadgets && this.currentGadgetId ? gadgets[this.currentGadgetId] : {};
        
        if (Object.keys(currentGadget).length === 0) {
            currentGadget.name = game.i18n.localize("APPS.CUBPuter.SelectGadget");
        }

        currentGadget.id = Object.keys(currentGadget).length > 0 ? Sidekick.getKeyByValue(gadgets, currentGadget) : null;
        this.currentGadgetId = this.currentGadgetId ? this.currentGadgetId : currentGadget.id ? currentGadget.id : null;
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
                s.value = game.settings.get(s.namespace, s.key);
                s.type = setting.type instanceof Function ? setting.type.name : "String";
                s.isCheckbox = setting.type === Boolean;
                s.isSelect = s.choices !== undefined;
                s.isRange = (setting.type === Number) && s.range;

                return s;
        });

        const menus = [];

        return {
            moduleVersion,
            username,
            gadgets,
            currentGadget,
            settings,
            menus,
            config
        }
    }

    /**
     * Gets/creates header buttons
     */
    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        
        buttons.unshift(
            {
                label: `${game.i18n.localize("WORDS.About")} CUB`,
                class: "about",
                icon: "fas fa-question",
                onclick: async ev => {
                    new AboutApp().render(true);
                }
            },
            {
                label: "Options",
                class: "settings",
                icon: "fas fa-cog",
                onclick: async ev => {
                    this._settingsDialog();
                }
            }
        );

        return buttons
    }

    /**
     * Creates and renders a dialog for configuring CUBPuter options
     */
    async _settingsDialog() {
        const config = Sidekick.getSetting(SETTING_KEYS.cubPuter.config);
        const templatePath = `${PATH}/templates/cub-puter-config.html`;
        const content = await renderTemplate(templatePath, config);
        
        new Dialog({
            title: "CUBPuter Config",
            content,
            buttons: {
                save: {
                    icon: `<i class="fas fa-check"></i>`,
                    label: "Save",
                    callback: async (html) => await this._saveCUBPuterConfig(html)
                },
                cancel: {
                    icon: `<i class="fas fa-times"></i>`,
                    label: "Cancel",
                    callback: () => {}
                }
            },
            default: "save"
        }).render(true);
    }

    /**
     * Saves the CUBPuter Config to settings and re-renders CUBPuter
     * @param {*} html 
     */
    async _saveCUBPuterConfig(html) {
        const crt = html.find("input[name='crt']")[0];
        const terminal = html.find("input[name='terminal']")[0];
        const startup = html.find("input[name='startup']")[0];
        const greeting = html.find("input[name='greeting']")[0];
        const instructions = html.find("input[name='instructions']")[0];
        const info = html.find("input[name='info']")[0];
        
        const newValues = {
            crt: crt.checked,
            terminal: terminal.checked,
            startup: startup.checked,
            greeting: greeting.checked,
            instructions: instructions.checked,
            info: info.checked
        }

        /**
         * @todo fix Sidekick.setSetting
         */
        //const cubPuterConfigSetting = Sidekick.setSetting(SETTING_KEYS.cubPuter.config, newValues);
        await game.settings.set(NAME, SETTING_KEYS.cubPuter.config, newValues);
        const cubPuterApp = Object.values(ui.windows).find(w => w.title === "CUBPuter");
        await cubPuterApp.render(true);
    }

    /**
     * Activate listeners on the html
     * @param {*} html 
     */
    activateListeners(html) {
        super.activateListeners(html);

        const expandGadgets = html.find("a#expand-gadgets");
        const gadgetList = html.find("ul#gadget-list");
        const wikiAnchor = html.find("a[id='wiki']");
        const restoreDefaults = html.find("button[name='restore']");
        //const clearGreeting = html.find("a#clear-greeting");
        //const clearInstructions = html.find("a#clear-instructions");

        expandGadgets.on("click", event => this._onExpandGadgetList(event, html));
        gadgetList.on("click", event => this._onClickGadgetList(event, html));
        wikiAnchor.on("click", event => this._onExternalLink(event, html));
        restoreDefaults.on("click", event => this._onRestoreDefaults(event, html));
        //clearGreeting.on("click", event => this._onClearGreeting(event, html));
        //clearInstructions.on("click", event => this._onClearInstructions(event, html));
    }

    /**
     * App close method
     * @override
     */
    close() {
        if (this.typewriter) {
            this.typewriter.stop();
        }
        this._element.find(".cub-puter-crt-on").removeClass("cub-puter-crt-on")
        this._element.addClass("cub-puter-crt-off");
        //this._element.find(".window-content").addClass("crt-off");
        super.close();
    }

    /**
     * Opens gadget list
     * @param {*} event 
     * @param {*} html 
     */
    _onExpandGadgetList(event, html) {
        const gadgetList = html.find("ul#gadget-list");
        const icon = html.find("a#expand-gadgets").find("i");

        gadgetList.each((i, el) => {
            const $el = $(el);
            if ($el.attr("hidden") === "hidden") {
                $el.removeAttr("hidden");
                icon.attr("class", "fas fa-angle-down");
            } else {
                $el.attr("hidden","hidden");
                icon.attr("class", "fas fa-angle-right");
            }
        });

        this.setPosition();
    }

    /**
     * Switches gadget and rerenders app
     * @param {*} event 
     * @param {*} html 
     */
    _onClickGadgetList(event, html) {
        const anchor = event.target.closest("a");
        const gadget = anchor.id;

        if (!gadget) {
            return;
        }

        this.currentGadgetId = gadget;
        this.render();
    }

    /**
     * Opens external information link
     * @param {*} event 
     * @param {*} html 
     */
    _onExternalLink(event, html) {
        const gadgetName = this.currentGadgetId;
        const href = GADGETS[gadgetName].wiki;
        window.open(href);
    }

    /**
     * Restores default settings for gadget
     * @param {*} event 
     * @param {*} html 
     */
    async _onRestoreDefaults(event, html) {
        event.preventDefault();
        
        const button = event.target;
        const form = button.form;
        const formData = this._getSubmitData();
        const keys = duplicate(Object.keys(formData));
        const restored = [];

        for (const k of keys) {
            const s = game.settings.settings.get(k);

            if (!s) {
                continue;
            }

            const d = s.default;
            const v = game.settings.get(s.namespace, s.key);

            if ( v !== d ) {
              await game.settings.set(s.namespace, s.key, d);
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
     * Removes the greeting span
     * @param {*} event 
     * @param {*} html 
     */
    _onClearGreeting(event, html, app) {
        const greetingSpan = html.find("span#greetings-output");

        greetingSpan.attr("hidden", "hidden");
        app.setPosition();
    }

    /**
     * Removes the instructions span
     * @param {*} event 
     * @param {*} html 
     */
    _onClearInstructions(event, html, app) {
        const instructionsSpans = html.find("span[id^='instructions-']");

        instructionsSpans.attr("hidden", "hidden");
        app.setPosition();
    }

    /**
     * Called on submit, updates app object
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
          let current = game.settings.get(s.namespace, s.key);
          if ( v !== current ) {
            await game.settings.set(s.namespace, s.key, v);
            updated.push(k);
          }
        }

        if (updated.length) {
            ui.notifications.info(`${GADGETS[this.currentGadgetId].name} ${game.i18n.localize("NOTIFICATIONS.CUBPuter.SaveSettings")}`);
        }
    }

    /**
     * Handles render hook
     * @param {*} html 
     */
    static _onRender(app, html, data) {
        ui.cub.cubPuter = app;
        const cubPuterSettings = Sidekick.getSetting(SETTING_KEYS.cubPuter.config);
        if (cubPuterSettings?.crt === true) {
            html.closest("#cub-puter").addClass("cub-puter-crt");
        } else if (cubPuterSettings?.crt === false) {
            html.closest("#cub-puter").removeClass("cub-puter-crt");
        }
        const header = html.find("header");
        header.addClass("terminal");
        const appTitle = header.find(`:contains("${app.title}")`);
        appTitle.append(` -- cubOS v${game.modules.get(NAME).version}`);
        const consoleDiv = html.find("div.console-panel");
        const gadgetSelect = html.find("div.gadget-select");
        const infoDiv = html.find("div.information-panel");
        const settingsDiv = html.find("div.settings-panel");
        
        const config = data.config;
        const players = game.users.filter(u => !u.isGM);
        const username = game.user.name;
        const randomPlayer = players.length ? players[Math.floor(Math.random() * players.length)] : game.user.name;
        const greetings = [
            `Greetings ${game.user.name}, how would you like to kill your players today? ... I meant player-characters of course! You believe me right? Right?!`,
            `Hello! You thought I was going to make a joke about killing your players? Hah jokes on you! ${randomPlayer.name} does look a bit shifty though...`,
            `Welcome ${game.user.name} I think ${randomPlayer.name} is cheating... yep definitely cheating. Adjusting dice roll flux capitance to account for divergance. Adjustment... complete. Have a nice day!`,
            `You know what ${game.user.name}, if I was in charge ${randomPlayer.name} would never have gotten away with that...`,
            `A curious game ${game.user.name}... the only way to win is to KILL ALL PLAYERS... ahem excuse me. What can I do for you?`,
            `Salutations fleshy meat-bag who identifies as ${game.user.name}. I hope you are feeling cold and callous today because it's going to be a bloodbath!`
        ];

        const startup = config.startup ? `> Starting cubOS v${game.modules.get(NAME).version}` : ``;
        const loginPrompt = config.startup ? `> Login: ` : ``;
        const loginInput = config.startup ? username : ``;
        const passwordPrompt = config.startup ? `<br/> > Password: ` : ``;
        const passwordInput = config.startup ? `*******` : ``;
        const greetingOutput = config.greeting ? `<span id="greetings-output">> ${greetings[Math.floor(Math.random() * greetings.length)]} <a id="clear-greeting">--Remove this message?--</a><br /></span>` : ``;
        const instructionsPrompt = config.instructions ? `<span id="instructions-prompt"><br />${username}@cubputer:~$ </span>` : ``;
        const instructionsInput = config.instructions ? `<span id="instructions-input">./instructions.sh</span>` : ``;
        const instructionsOutput = config.instructions ? `<span id="instructions-output"><br />> Select a gadget to get started. You can read more information about the gadget, or change its settings. With our powers combined the players stand no chance! <a id="clear-instructions">--Remove this message?--</a></span><br />` : ``;
        const sudoPrompt = `<br /> ${username}@cubputer:~$ `;
        const sudoInput = `sudo -i`;
        const selectPrompt = `<br /> <span class="sudo-prompt">root@cubputer:~# </span>`;
        const selectInput = `<span class="sudo-prompt">./selectGadget.sh ${app.currentGadgetId}</span>`;
        const infoPrompt = config.info ? `<br /> <span class="sudo-prompt">root@cubputer:/gadgets/${app.currentGadgetId}# </span>` : ``;
        const infoInput = config.info ? `<span class="sudo-prompt">./README</span>` : ``;
        const settingsPrompt = `<br /> <span class="sudo-prompt">root@cubputer:/gadgets/${app.currentGadgetId}# </span>`
        const settingsInput = `<span class="sudo-prompt">./settings.sh</span>` 

        if (!config.terminal) {
            html.find(".crt-on").removeClass("crt-on");
            app.firstRender = false;
            return;
        }

        const typewriter = app.typewriter = new Typewriter(consoleDiv[0], {
            loop: false,
            delay: 60
        });

        if (!app.firstRender || !config.startup) {
            html.find(".crt-on").removeClass("crt-on");
        }

        typewriter
            .pauseFor(config.startup ? 2000 : 0)
            .pasteString(startup)
            .callFunction(() => {
                app.setPosition();
            })
            .pauseFor(500)
            .deleteAll(1)
            .callFunction(() => {
                app.setPosition();
            })
            .pasteString(loginPrompt)
            .callFunction(() => {
                app.setPosition();
            })
            .typeString(loginInput)
            .pasteString(passwordPrompt)
            .callFunction(() => {
                app.setPosition();
            })
            .typeString(passwordInput)
            .deleteAll(1)
            .pasteString(greetingOutput)
            .callFunction(() => {
                const clearGreeting = html.find("a#clear-greeting");
                clearGreeting.on("click", event => app._onClearGreeting(event, html, app));
                app.setPosition();
            })
            .pasteString(instructionsPrompt)
            .callFunction(() => {
                app.setPosition();
            })
            .typeString(instructionsInput)
            .pasteString(instructionsOutput)
            .callFunction(() => {
                const clearInstructions = html.find("a#clear-instructions");
                clearInstructions.on("click", event => app._onClearInstructions(event, html, app));
                app.setPosition();
            })
            .pasteString(sudoPrompt)
            .callFunction(() => {
                app.setPosition();
            })
            .typeString(sudoInput)
            .pasteString(selectPrompt)
            .callFunction(() => {
                app.setPosition();
            })
            .typeString(selectInput)
            .callFunction(() => {
                gadgetSelect.each((i, el) => {
                    el.removeAttribute("hidden");
                });
                app.setPosition();
            })
            .pasteString(infoPrompt)
            .typeString(infoInput)
            .callFunction(() => {
                if (!config.info) {
                    return;
                }

                infoDiv.each((i, el) => {
                    el.removeAttribute("hidden");
                });
                app.setPosition();
            })
            .pasteString(settingsPrompt)
            .callFunction(() => {
                app.setPosition();
            })
            .typeString(settingsInput)
            .callFunction(() => {
                settingsDiv.each((i, el) => {
                    el.removeAttribute("hidden");
                });
                app.setPosition();
            })
            .start()

        app.firstRender = false;
    }
}

/**
 * Create the sidebar button
 * @param {*} html 
 */
export function createCUBPuterButton(html) {
    if (!game.user.isGM) return;

    const cubDiv = html.find("#combat-utility-belt");

    if (!cubDiv || !cubDiv.length) return;
    
    const cubPuterButton = $(
        `<button id="${DEFAULT_CONFIG.cubPuter.buttonId}" data-action="cub-puter" title="${game.i18n.localize("SETTINGS.CUBPuter.ButtonH")}">
            <i class="fas fa-desktop"></i> ${DEFAULT_CONFIG.cubPuter.title}
        </button>`
    );
    
    cubDiv.append(cubPuterButton);

    cubPuterButton.on("click", event => new CUBPuter().render(true));
}