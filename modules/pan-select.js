/**
     * Determines if a panning workflow should begin
     * @param {Object} combat
     * @param {Object} update 
     */
    _panHandler(combat, update) {
        if (!hasProperty(update, "turn") || !this.settings.panOnNextTurn || (!game.user.isGM && this.settings.panGMOnly)) {
            return;
        }

        const combatant = combat.combatant;
        const temporary = hasProperty(combatant, "flags." + CUBButler.MODULE_NAME + "." + CUBCombatTracker.prototype.GADGET_NAME + "(temporaryCombatant)");

        if (temporary) {
            return;
        }

        const tracker = combat.entities ? combat.entities.find(tr => tr._id === update._id) : combat;
        const token = hasProperty(update, "turn") ? tracker.turns[update.turn].token : tracker.turns[0].token;

        if (!game.user.isGM && this.settings.panPlayers !== CUBSidekick.getKeyByValue(this.DEFAULT_CONFIG.panPlayers, this.DEFAULT_CONFIG.panPlayers.none)) {
            return this._checkPlayerPan(token);
        }

        if (game.user.isGM && this.settings.panGM !== CUBSidekick.getKeyByValue(this.DEFAULT_CONFIG.panGM, this.DEFAULT_CONFIG.panGM.none)) {
            return this._checkGMPan(token);
        }
    }

    /**
     * Determine if the player should be panned
     * @param {*} token
     */
    _checkPlayerPan(token) {
        const actor = token ? game.actors.get(token.actorId) : null;
        const actorPermission = actor ? actor.data.permission[game.userId] || 0 : null;

        if (actorPermission === null) {
            return;
        }
        // all - pan always, owner - pan when i own, observer - pan when i own OR observe, none - return

        switch (this.DEFAULT_CONFIG.panPlayers[this.settings.panPlayers]) {
            case this.DEFAULT_CONFIG.panPlayers.observer:
                if (actorPermission >= CONST.ENTITY_PERMISSIONS.OBSERVER) {
                    break;
                }

                return;
     
            case this.DEFAULT_CONFIG.panPlayers.owner:
                if (actorPermission >= CONST.ENTITY_PERMISSIONS.OWNER) {
                    break;
                }

                return;

            case this.DEFAULT_CONFIG.panPlayers.all:
                break;

            case this.DEFAULT_CONFIG.panPlayers.none:
            default:
                if (!game.user.isGM) {
                    return;
                }
        }

        return this._panToToken(token);
    }

    /**
     * Determine if the GM should be panned
     * @param {*} token
     */
    _checkGMPan(token) {
        const actor = token ? game.actors.get(token.actorId) : null;

        if (!actor) {
            return;
        }

        switch (this.DEFAULT_CONFIG.panGM[this.settings.panGM]) {
            case this.DEFAULT_CONFIG.panGM.none:
                return;
            
            case this.DEFAULT_CONFIG.panGM.npc:
                if (actor.isPC) {
                    return;
                }
                
                break;
            
            case this.DEFAULT_CONFIG.panGM.all:
                break;

            default:
                return;
        }

        return this._panToToken(token);
    }

    /**
     * Pans user to the token
     * @param {*} token 
     */
    _panToToken(token) {
        const xCoord = token.x;
        const yCoord = token.y;
        return canvas.animatePan({
                x: xCoord,
                y: yCoord
        });
    }

    /**
     * Selects the current token in the turn tracker
     * @param {Object} combat 
     * @param {Object} update 
     */
    async _selectHandler(combat, update) {
        if (!hasProperty(update, "turn") || !this.settings.selectOnNextTurn) {
            return;
        }

        const combatant = combat.combatant;
        const temporary = hasProperty(combatant, "flags." + CUBButler.MODULE_NAME + "." + CUBCombatTracker.prototype.GADGET_NAME + "(temporaryCombatant)");

        if (temporary) {
            return;
        }

        const tracker = combat.entities ? combat.entities.find(tr => tr._id === update._id) : combat;
        const token = hasProperty(update, "turn") ? tracker.turns[update.turn].token : tracker.turns[0].token;

        if (!token) {
            return;
        }

        if (game.user.isGM && this.settings.selectOnNextTurn && this.settings.selectGM !== CUBSidekick.getKeyByValue(this.DEFAULT_CONFIG.panGM, this.DEFAULT_CONFIG.panGM.none)) {
            return this._checkGMSelect(token);
        }

        if (this.settings.observerDeselect) {
            this._checkObserverDeselect(token);
        }

        if (this.settings.selectPlayers) {
            this._checkPlayerSelect(token);
        }
        
        return;
    }

    /**
     * Determine if the current combatant token should be selected for the GM 
     * @param {*} token 
     */
    _checkGMSelect(token) {
        const actor = token ? game.actors.get(token.actorId) : null;

        if (!actor) {
            return;
        }

        switch (this.DEFAULT_CONFIG.panGM[this.settings.selectGM]) {
            case this.DEFAULT_CONFIG.panGM.none:
                return;
            
            case this.DEFAULT_CONFIG.panGM.npc:
                if (actor.isPC) {
                    return;
                }
                
                break;
            
            case this.DEFAULT_CONFIG.panGM.all:
                break;

            default:
                return;
        }

        const canvasToken = canvas.tokens.get(token._id) || null;
        return canvasToken.control();
    }

    /**
     * Determines if Player can select the current combatant token
     * @param {*} token 
     */
    _checkPlayerSelect(token) {
        const actor = token ? game.actors.get(token.actorId) : null;
        const actorPermission = actor ? actor.data.permission[game.userId] || 0 : null;

        if (!actor || actorPermission === null || actorPermission < CONST.ENTITY_PERMISSIONS.OWNER) {
            return;
        }

        const canvasToken = canvas.tokens.get(token._id) || null;
        return canvasToken.control();
    }

    /**
     * Determines if tokens should be deselected when a non-owned Combatant has a turn
     * @param {*} token 
     */
    _checkObserverDeselect(token) {
        const actor = token ? game.actors.get(token.actorId) : null;
        const actorPermission = actor ? actor.data.permission[game.userId] || 0 : null;

        if (actorPermission === null) {
            return;
        }

        if (actorPermission < CONST.ENTITY_PERMISSIONS.OWNER) {
            return canvas.tokens.releaseAll();
        }
    }