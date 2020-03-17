/**
     * Gives XP to the living PCs in the turn tracker based on enemies killed
     * @param {Object} combat -- the combat instance being deleted
     */
    async _giveXP(combat) {
        const defeatedEnemies = combat.turns.filter(object => (!object.actor.isPC && object.defeated && object.token.disposition === -1));
        const players = combat.turns.filter(object => (object.actor.isPC && !object.defeated));
        let experience = 0;
        if (defeatedEnemies.length > 0 && this.addExperience) {
            defeatedEnemies.forEach(enemy => {
                experience += enemy.actor.data.data.details.xp.value;
            });
            if (players.length > 0) {
                const dividedExperience = Math.floor(experience / players.length);
                let experienceMessage = "<b>Experience Awarded!</b> (" + experience + "xp)<p><b>" + dividedExperience + "xp </b> added to:</br>";
                players.forEach(player => {
                    const actor = game.actors.entities.find(actor => actor._id === player.actor.data._id);
                    actor.update({
                        "data.details.xp.value": player.actor.data.data.details.xp.value + dividedExperience
                    });
                    experienceMessage += player.actor.data.name + "</br>";
                });
                experienceMessage += "</p>";
                ChatMessage.create({
                    user: game.user._id,
                    speaker: {
                        alias: "CUB Experience"
                    },
                    content: experienceMessage,
                    type: CONST.CHAT_MESSAGE_TYPES.OTHER
                });
            }
        }
    }

    /**
     * Replace Foundry's encCombat with our own
     */
    async endCombat() {
        return new Promise((resolve, reject) => {
            if (!game.user.isGM) {
                reject("You cannot end an active combat");
            }
            new Dialog({
                title: "End Combat?",
                content: "<p>End this combat encounter and empty the turn tracker?</p>",
                buttons: {
                    yes: {
                        icon: `<i class="fas fa-check"></i>`,
                        label: "End Combat",
                        callback: () => {
                            CUB.combatTracker.addExperience = false;
                            this.delete().then(resolve);
                        }
                    },
                    xp: {
                        icon: `<i class="fas fa-check"></i>`,
                        label: "End with XP",
                        callback: () => {
                            CUB.combatTracker.addExperience = true;
                            this.delete().then(resolve);
                        }
                    },
                    no: {
                        icon: `<i class="fas fa-times"></i>`,
                        label: "Cancel"
                    }
                },
                default: "yes"
            }).render(true);
        });
    }