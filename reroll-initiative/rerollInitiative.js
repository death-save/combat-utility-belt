Hooks.on("ready", () => {
    rerollInitiative();
});

function rerollInitiative() {
    console.log("RRI Function executing...")
    //module name
    const MODULE_NAME = "rerollInitiative";

    //default config
    const DEFAULT_CONFIG = {
        reroll: true
    };

    //settings name
    const SETTINGS_NAME = "rriSettings";

    //settings metadata
    const SETTINGS_META = {
        name: "rriSettings",
        scope: "world",
        type: Object,
        default: DEFAULT_CONFIG,
        onChange: s => {
            settings = s;
            console.log("Settings changed to",s);
        }
    }

    //object to hold settings
    let settings = {};

    //register settings
    game.settings.register(MODULE_NAME,SETTINGS_NAME,SETTINGS_META);

    //update settings
    async function updateSettings(setting,value) {
        settings[setting] = value;
        console.log("updating settings:",settings);
        await game.settings.set(MODULE_NAME,SETTINGS_NAME,settings);
    }

    //hook on combat update
    Hooks.on("updateCombat",(async (combat,update) => {
        if(settings.reroll && combat.round && update.round && update.round > combat.round){
            await combat.resetAll();
            combat.rollAll();
        }
    }));

    //hook on combat tracket config render
    Hooks.on("renderCombatTrackerConfig", (app,html) => {
        const LABEL = "Reroll Initiative";
        const NAME = "rriCheckbox"
        const HINT = "Reroll Initiative for all combatants each round"
        function checked() {
            if(settings.reroll) {
                return "checked"
            }
        }

        const submit = html.find('button[type="submit"]');

        submit.before(
            `<hr/>
            <div class="form-group">
                <label>${LABEL}</label>
                <input type="checkbox" name=${NAME} data-dtype="Boolean" ${checked()}>
                <p class=hint>${HINT}</p>
            </div>`
        );

        app.setPosition({height: app.position.height + 60});

        const form = submit.parent();

        form.on("submit", ev => {
            const input = ev.target.elements.NAME;

            if(input) {
                updateSettings(settings[reroll],input.checked);
            } 
        });
        

    });
}