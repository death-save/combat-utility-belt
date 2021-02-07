import { Sidekick } from "./sidekick.js";
import { SETTING_KEYS, PATH as BUTLERPATH } from "./butler.js";

export class GiveXP {

    /**
     * Render dialog handler
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    static _onRenderDialog(app, html, data) {
        const enable = Sidekick.getSetting(SETTING_KEYS.giveXP.enable);

        if (!game.user.isGM || !enable) {
            return;
        }

        const dialogContent = html.find("div.dialog-content");
        const yesButton = html.find("button[data-button='yes']");
        const xpCheckboxGroup = $(`<div class="form-group"><label class="xp-checkbox">Award XP? <input type="checkbox" name="award-xp"></label></div>`);

        dialogContent.after(xpCheckboxGroup);

        app.setPosition(mergeObject(app.position, {height: app.position.height + 30}));

        // Disable encounter delete - this happens *before* the dialog is closed
        let _combat = null;
        Hooks.once("preDeleteCombat", (combat, update, options, userId) => {
            _combat = combat;
            return false;
        });

        yesButton.on("click", event => {
            const xpCheckbox = xpCheckboxGroup.find("input");

            // Start custom flow if giving XP, otherwise just delete combat
            if (xpCheckbox.is(":checked")) {
                this._giveXP(_combat);
            } else {
                _combat.delete();
            }
        });

    }

    /**
     * Gives XP to the living PCs in the turn tracker based on enemies killed
     * @param {Object} combat -- the combat instance being deleted
     */
    static async _giveXP(combat) {
        const xpModifier = Sidekick.getSetting(SETTING_KEYS.giveXP.modifier);
        const defeatedHostiles = combat.turns.filter(object => object.defeated && object.token.disposition === -1);
        const friendlyCombatants = combat.turns.filter(object => !object.defeated && object.token.disposition === 1);

        const combatData = { combat, xpModifier, defeatedHostiles, friendlyCombatants };
        const content = await renderTemplate(`${BUTLERPATH}/templates/give-xp-dialog.hbs`, combatData);

        new Dialog({
            title: "XP",
            content,
            render: html => this._distributeDialogRender(html),
            buttons: {
                okay: {
                    label: "OK",
                    callback: html => this._distributeXP(html, combat)
                },
                cancel: {
                    label: "Cancel",
                    callback: () => {}
                }
            }
        }).render(true);
    }

    /**
     * Sets up handlers for the XP distribution dialog.
     * @param {*} html -- html for the distribution config dialog
     */
    static _distributeDialogRender(html) {
        // Tab control
        html.find(".tabs").on("click", ".item", function() {
            const selectedTab = $(this).data("tab");
            html.find(".tabs .item.active").removeClass("active");
            $(this).addClass("active");
            html.find("#actor-select-tabs > div").css({ display: "none" });
            html.find(`#actor-select-tabs > div[data-tab="${selectedTab}"]`).css({ display: "" });
        });
        
        // Name hover tooltip for all creatures
        html.find('[data-actor-name]').on("mouseover", function() {
            html.find('#hovered-creature').text($(this).data("actorName"));
        });
        html.find('[data-actor-name]').on("mouseout", function() {
            html.find('#hovered-creature').html("&nbsp;");
        });
        
        // When a creature is selected/deselected or XP modifier is updated, recalc everything
        html.find('#xp-modifier, [data-player-id] input, [data-enemy-id] input').on("input", updateXp);

        // Initial XP calculation
        updateXp();

        function updateXp() {
            const modifier = +html.find('#xp-modifier').val()

            let totalXp = 0;
            html.find("[data-enemy-id]").each((_, el) => {
                // Update XP amount on each enemy's display with modifier
                let enemyXp = Math.floor($(el).data("xpAmount") * modifier);
                $(el).find('.give-xp--actor-xp').text(`+${enemyXp} XP`);

                // If enemy is selected, add XP to total
                if ($(el).find("input").is(":checked")) {
                    totalXp += enemyXp;
                }
            });
            
            // Count players receiving, and work out per-player amount
            const numDivisors = html.find("[data-player-id] input:checked").length;
            const xpPerDivisor = numDivisors !== 0 ? totalXp / numDivisors : 0;
            
            // Update text for each friendly token icon
            html.find("[data-player-id]").each((_, el) => {
                const giveXp = $(el).find("input").is(":checked");
                $(el).find(".give-xp--actor-xp").text(`+${giveXp ? xpPerDivisor : 0} XP`)
            });

            // Update totals at bottom
            html.find('#total-xp').text(totalXp);
            html.find('#friend-receive-count').text(numDivisors);
            html.find('#divisor-xp').text(xpPerDivisor);
        }
    }

    /**
     * Handles OK button on the distribution config dialog and gives XP to selected friendlies
     * @param {*} html -- html for the distribution config dialog
     * @param {*} combat -- the combat instance being deleted
     */
    static async _distributeXP(html, combat) {
        const getSelectedTokens = (type) => html.find(`[data-${type}-id]`).has("input:checked").map((_, el) => game.actors.get($(el).data(`${type}Id`))).get();
        
        const selectedFriendlies = getSelectedTokens("player");
        const selectedHostiles = getSelectedTokens("enemy");
        const xpModifier = +html.find("#xp-modifier").val();

        if (selectedFriendlies.length !== 0 && selectedHostiles.length !== 0) {
            const totalXp = selectedHostiles.reduce((total, actor) => total + actor.data.data.details.xp.value, 0) * xpModifier;
            const perFriendly = Math.floor(totalXp / selectedFriendlies.length);

            let xpMessage = `<p><strong>Experience Awarded!</strong> (${totalXp} XP)</p><p><strong>${perFriendly} XP</strong> given to:</p><ul>`;

            for (const friendly of selectedFriendlies) {
                xpMessage += `<li>${friendly.name}</li>`;
                await this.applyXP(friendly, perFriendly);
            }
            xpMessage += "</ul>";

            this.outputToChat(xpMessage);
        }

        // Now creatures have been updated, actually delete combat
        await combat.delete();
    }

    /**
     * Applies XP to the given actor
     * @param {*} actor 
     */
    static async applyXP(actor, amount) {
        return await actor.update({
            "data.details.xp.value": actor.data.data.details.xp.value + amount
        });
    }
    
    /**
     * Creates a chat message and outputs to chat
     */
    static outputToChat(content) {
        const user = game.userId,
            alias = "CUB Experience",
            type = CONST.CHAT_MESSAGE_TYPES.OTHER;

        ChatMessage.create({
            user,
            speaker: {
                alias
            },
            content,
            type
        });
    }
}