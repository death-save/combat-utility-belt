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

        if (!this.settings.tempCombatants) {
            return;
        }

        const combatantList = html.find("#combat-tracker.directory-list");

        const listItemHtml = `<div class="flexrow"><a class="add-temporary"><i class="fa fa-plus"></i> Add Temporary Combatant</a></div>`

        if (!game.combat || !combatantList.length) {
            return;
        }

        combatantList.append(listItemHtml);

        const button = combatantList.find(".add-temporary")

        button.on("click", event => {
            this._onAddTemporaryCombatant(event);
        });

        // Possible future feature
        /*
        const trackerConfigButton = html.find("a.combat-settings");

        trackerConfigButton.off("click");

        trackerConfigButton.on("click", event => {
            event.preventDefault();

            new CUBCombatTrackerConfig().render(true);
        });

        const trackerSettings = CUBSidekick.getGadgetSetting(CUB.combatTracker.GADGET_NAME + "(" + CUB.combatTracker.SETTINGS_DESCRIPTORS.TrackerConfigSettingsN + ")");

        if (trackerSettings.resource2) {

        }
        */
    }

/**
     * Open the Temporary Combatant form
     * @param {*} event 
     */
    _onAddTemporaryCombatant(event) {
        // spawn a form to enter details
        const temporaryCombatantForm = new CUBTemporaryCombatantForm(this).render(true);
    }

    /**
     * Removes any temporary combatants created by this module
     * @param {*} combatants 
     * @param {*} scene 
     */
    _removeTemporaryCombatants(combatants, scene) {
        
        const tokenIds = combatants.map(c => c.tokenId);
        const actorIds = combatants.map(c => c.actor._id);

        if (tokenIds) {
            scene.deleteManyEmbeddedEntities("Token", tokenIds);
        }
        
        if (actorIds) {
            Actor.deleteMany(actorIds);
        }
        
    }

    /**
     * Removes a single temporary combatant created by this module
     * @param {*} combatant 
     * @param {*} scene 
     */
    _removeTemporaryCombatant(combatant, scene) {
        const tokenId = combatant.tokenId;
        const actor = game.actors.get(combatant.actor._id);

        if (tokenId){
            scene.deleteEmbeddedEntity("Token", tokenId);
        }
        
        if (actor){
            actor.delete();
        }
        
    }