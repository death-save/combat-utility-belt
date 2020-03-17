/**
 * Rerolls initiative for all combatants
 * @todo refactor to preUpdate hook
 */
class CUBRerollInitiative {
    constructor() {
        this.settings = {
            reroll: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.RerollN + ")", this.SETTINGS_META.enableReroll),
            rerollTempCombatants: CUBSidekick.initGadgetSetting(this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.RerollTempCombatantsN + ")" , this.SETTINGS_META.includeTempCombatants)
        };
    }

    get GADGET_NAME() {
        return "reroll-initiative";
    }


    get DEFAULT_CONFIG() {
        return {
            reroll: false,
            rerollTempCombatants: false
        };
    }

    get SETTINGS_DESCRIPTORS() {
        return {
            RerollN: "--Reroll Initiative--",
            RerollH: "Reroll initiative for each combatant every round",
            RerollTempCombatantsN: "Reroll Temporary Combatants",
            RerollTempCombatantsH: "Set whether to reroll initiative for Temporary Combatants if they are enabled"
        };

    }

    get SETTINGS_META() {
        return {
            enableReroll: {
                name: this.SETTINGS_DESCRIPTORS.RerollN,
                hint: this.SETTINGS_DESCRIPTORS.RerollH,
                scope: "world",
                type: Boolean,
                default: this.DEFAULT_CONFIG.reroll,
                config: true,
                onChange: s => {
                    this.settings.reroll = s;
                }
            },
            includeTempCombatants: {
                name: this.SETTINGS_DESCRIPTORS.RerollTempCombatantsN,
                hint: this.SETTINGS_DESCRIPTORS.RerollTempCombatantsH,
                scope: "world",
                type: Boolean,
                default: this.DEFAULT_CONFIG.rerollTempCombatants,
                config: true,
                onChange: s => {
                    this.settings.rerollTempCombatants = s;
                }
            }
        };

    }

    async _onUpdateCombat(combat, update, options={}, userId) {
        // Return early if we are NOT a GM OR we are not the player that triggered the update AND that player IS a GM
        if (!game.user.isGM || (game.userId !== userId && game.users.get(userId).isGM)) {
            return
        }

        const roundUpdate = !!getProperty(update, "round");

        // Return if the reroll setting is not enabled or this update does not contains a round
        if (!this.settings.reroll || !roundUpdate) {
            return;
        }

        if (combat instanceof CombatEncounters) {
            combat = game.combats.get(update._id);
        }
        
        // If we are not moving forward through the rounds, return
        if (update.round < 1 || update.round < combat.previous.round) {
            return;
        }

        let combatantIds;

        if (!this.settings.rerollTempCombatants) {
            combatantIds = combat.combatants.filter(c => !hasProperty(c, "flags." + [CUBButler.MODULE_NAME] + "." + [CUB.combatTracker.GADGET_NAME] + "(temporaryCombatant)")).map(c => c._id);
        } else {
            combatantIds = combat.combatants.map(c => c._id);
        }

        await combat.rollInitiative(combatantIds);
        await combat.update({turn: 0});

        /*
        const ids = combat.turns.map(c => c._id);

        // Taken from foundry.js Combat.rollInitiative() -->
        const currentId = combat.combatant._id;

        // Iterate over Combatants, performing an initiative roll for each
        const [updates, messages] = ids.reduce((results, id, i) => {
            let [updates, messages] = results;

            const messageOptions = options.messageOptions || {};
    
            // Get Combatant data
            const c = combat.getCombatant(id);
            if ( !c ) return results;
            const actorData = c.actor ? c.actor.data.data : {};
            const formula = combat.formula || combat._getInitiativeFormula(c);
    
            // Roll initiative
            const roll = new Roll(formula, actorData).roll();
            updates.push({_id: id, initiative: roll.total});
    
            // Construct chat message data
            const rollMode = messageOptions.rollMode || (c.token.hidden || c.hidden) ? "gmroll" : "roll";
            let messageData = mergeObject({
            speaker: {
                scene: canvas.scene._id,
                actor: c.actor ? c.actor._id : null,
                token: c.token._id,
                alias: c.token.name
            },
            flavor: `${c.token.name} rolls for Initiative!`
            }, messageOptions);
            const chatData = roll.toMessage(messageData, {rollMode, create:false});
            if ( i > 0 ) chatData.sound = null;   // Only play 1 sound for the whole set
            messages.push(chatData);
    
            // Return the Roll and the chat data
            return results;
        }, [[], []]);

        if ( !updates.length ) {
            return;
        }

        // Update multiple combatants
        await combat.updateManyEmbeddedEntities("Combatant", updates);

        // Ensure the turn order remains with the same combatant
        update.turn = combat.turns.findIndex(t => t._id === currentId);

        // Create multiple chat messages
        await ChatMessage.createMany(messages);
        // <-- End of borrowed code
        */
    }
}