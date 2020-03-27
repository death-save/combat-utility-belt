export class TrackerUtility {
    constructor() {
        this.settings = {
            panOnNextTurn: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.PanOnNextTurnN + ")", this.SETTINGS_META.panOnNextTurn),
            panGM: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.PanGMN + ")", this.SETTINGS_META.panGM),
            panPlayers: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.PanPlayersN + ")", this.SETTINGS_META.panPlayers),
            selectOnNextTurn: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.SelectOnNextTurnN + ")", this.SETTINGS_META.selectOnNextTurn),
            selectGM: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.SelectGMN + ")", this.SETTINGS_META.selectGM),
            selectPlayers: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.SelectPlayersN + ")", this.SETTINGS_META.selectPlayers),
            observerDeselect: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.ObserverDeselectN + ")", this.SETTINGS_META.observerDeselect),
            trackerConfigSettings: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.TrackerConfigSettingsN + ")", this.SETTINGS_META.trackerConfigSettings),
            tempCombatants: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.TempCombatantsN + ")", this.SETTINGS_META.tempCombatants),
            xpModule: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.XPModuleN + ")", this.SETTINGS_META.xpModule)
        };

        this.callingUser = "";
    }

    get GADGET_NAME() {
        return "combat-tracker";
    }

    get SETTINGS_DESCRIPTORS() {
        return {
            PanOnNextTurnN: "--Pan to Token--",
            PanOnNextTurnH: "Enables the following token panning functionality",
            PanGMN: "Pan GM",
            PanGMH: "Pans GM. Options: None (do not pan GM), NPC (pan only to non-player character tokens), All (pan to all tokens)",
            PanPlayersN: "Pan Players",
            PanPlayersH: "Pans players. Options: None (do not pan players), Owner (pan only to Owned tokens), Observer (pan to Observed AND Owned tokens), All (pan to all tokens)",
            SelectOnNextTurnN: "--Select Token--",
            SelectOnNextTurnH: "Enables the following token select functionality",
            SelectGMN: "Select GM",
            SelectGMH: "Selects token based on selected option: None (do not select), NPC (select only non-player character tokens), All (select all tokens)",
            SelectPlayersN: "Select Players",
            SelectPlayersH: "Selects Player-owned tokens on their turn in combat",
            ObserverDeselectN: "Deselect Tokens",
            ObserverDeselectH: "Deselect controlled tokens on any non-Owned combatant's turn",
            TempCombatantsN: "--Enable Temporary Combatants--",
            TempCombatantsH: "Allows the creation of temporary/freeform combatants from the Combat Tracker",
            TrackerConfigSettingsN: "Combat Tracker Settings",
            TrackerConfigSettingsH: "Additional settings for the Combat Tracker",
            XPModuleN: "--Enable XP Module--",
            XPModuleH: "REQUIRES REFRESH! Adds an option at the end of combat to automatically distribute xp from the combat to the players"
        };
    }

    get DEFAULT_CONFIG() {
        return {
            
            tempCombatants: false,
            xpModule: false
        };
    }

    get SETTINGS_META() {
        return {
            
        };
    }

    

    

    /**
     * Hook on the combat update,
     * Pans or selects the current token
     */
    _hookOnUpdateCombat(combat, update) {
        let tracker = combat.entities ? combat.entities.find(tr=>tr._id===update._id) : combat;

        if (!game.combat || game.combat.turns.length === 0) {
            return;
        }

        if (this.settings.panOnNextTurn) {
            this._panHandler(tracker, update);
        }

        if (this.settings.selectOnNextTurn) {
            this._selectHandler(tracker, update);
        }
    }

    /**
     * Handler for deleteCombat hook
     * @param {*} combat 
     * @param {*} combatId 
     * @param {*} options 
     * @param {*} userId 
     */
    _hookOnDeleteCombat(combat, combatId, options, userId) {
        if (this.settings.xpModule && game.userId == userId) {
            this._giveXP(combat);
        }

        const tempCombatants = combat.combatants.filter(c => hasProperty(c, "flags." + CUBButler.MODULE_NAME + "." + this.GADGET_NAME + "(temporaryCombatant)"));

        if (this.settings.tempCombatants && tempCombatants.length) {
            this._removeTemporaryCombatants(tempCombatants, combat.scene);
        }  
    }

    /**
     * Handler for deleteCombatant hook
     * @param {*} combat 
     * @param {*} combatId 
     * @param {*} combatantId 
     * @param {*} options 
     */
    _hookOnDeleteCombatant(combat, combatId, combatantId, options) {
        const combatant = combat.combatants.find(c => c._id === combatantId);
        const tokenData = combatant.token.data || null;

        if (hasProperty(tokenData, "flags." + [CUBButler.MODULE_NAME] + "." + [CUB.combatTracker.GADGET_NAME] + "(temporaryCombatant)")) {
            this._removeTemporaryCombatant(combatant, combat.scene);
        }
    }

    /**
     * Handler for combat tracker render
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    async _onRenderCombatTracker(app, html, data) {
        if (!game.user.isGM) {
            return;
        }

        const resourceSpans = html.find(".resource");

        if (resourceSpans.length) {
            this._replaceResourceElement(html);
        }

    /**
     * Replaces the default token resource span with a text input
     * @param {*} html 
     */
    _replaceResourceElement(html) {
        // Find all the resource spans
        const resourceSpans = html.find(".resource");


        // Replace the element
        $(resourceSpans).each(function() {
            $(this).replaceWith('<input type="text" name="resource" value="' + $(this).text() + '">');
        });

        const resourceInputs = html.find('input[name="resource"]');
        resourceInputs.on("change", event => this._onChangeResource(event));
    }

    /**
     * Handler for updates to the token resource
     * @param {*} event 
     */
    async _onChangeResource(event) {
        // Get the tracker settings and extract the resource property
        const trackerSettings = game.settings.get("core", Combat.CONFIG_SETTING);
        const resource = trackerSettings.resource;

        // Find the parent list element
        const li = event.target.closest("li");

        // Get the tokenId from the list element
        const tokenId = li.dataset.tokenId;

        // Find the token and update
        const token = canvas.tokens.get(tokenId);
        await token.actor.update({["data." + resource]: event.target.value});
    }
}