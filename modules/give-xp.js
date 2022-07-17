import { Sidekick } from "./sidekick.js";
import { NAME, FLAGS, SETTING_KEYS, PATH as BUTLERPATH } from "./butler.js";

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

        yesButton.on("click", event => {
            const xpCheckbox = xpCheckboxGroup.find("input");

            // Start custom flow if giving XP, otherwise just delete combat
            if (xpCheckbox.is(":checked")) {
                Hooks.once("preDeleteCombat", (combat, options, userId) => {
                    GiveXP._giveXP(combat);

                    return false;
                });
            }
        });

    }

    /**
     * Gives XP to the living PCs in the turn tracker based on enemies killed
     * @param {Object} combat -- the combat instance being deleted
     */
    static async _giveXP(combat) {
        const xpModifier = Sidekick.getSetting(SETTING_KEYS.giveXP.modifier);
        const hostiles = [];
        const friendlies = [];
        const defaultSelectedFriendlies = [];

        for (const turn of combat.turns) {
            const turnData = {
                actor: turn.actor,
                token: turn.token,
                name: turn.name,
                img: turn.img
            };

            switch (turn.token.disposition) {
                case -1:
                    hostiles.push(turnData);
                    continue;
                
                case 1:
                    friendlies.push(turnData);
                    const deselectByDefault = turn.actor.getFlag(NAME, FLAGS.giveXP.deselectByDefault);

                    if (!deselectByDefault) defaultSelectedFriendlies.push(turnData);
                    continue;

                default:
                    continue;
            }
        }

        const combatData = { combat, xpModifier, hostiles, friendlies, defaultSelectedFriendlies };
        const content = await renderTemplate(`${BUTLERPATH}/templates/give-xp-dialog.hbs`, combatData);

        new Dialog({
            title: "XP",
            content,
            render: html => this._distributeDialogRender(html),
            buttons: {
                okay: {
                    label: "OK",
                    callback: html => this._distributeXP(html, combatData)
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
        html.find('.give-xp--actor-list label').on("mouseover", function() {
            html.find('#hovered-creature').text($(this).data("actorName"));
        });
        html.find('.give-xp--actor-list label').on("mouseout", function() {
            html.find('#hovered-creature').html("&nbsp;");
        });
        
        // When a creature is selected/deselected or XP modifier is updated, recalc everything
        html.find('#xp-modifier, .give-xp--actor-list input').on("input", updateXp);

        // Initial XP calculation
        updateXp();

        function updateXp() {
            const modifier = +html.find('#xp-modifier').val()

            let totalXp = 0;
            html.find("#hostile-actor-list [data-xp-amount]").each((_, el) => {
                // Update XP amount on each enemy's display with modifier
                let enemyXp = Math.floor($(el).data("xpAmount") * modifier);
                $(el).find('.give-xp--actor-xp').text(`+${enemyXp} XP`);

                // If enemy is selected, add XP to total
                if ($(el).find("input").is(":checked")) {
                    totalXp += enemyXp;
                }
            });
            
            // Count players receiving, and work out per-player amount
            const numDivisors = html.find("#friendly-actor-list input:checked").length;
            const xpPerDivisor = numDivisors !== 0 ? Math.floor(totalXp / numDivisors) : 0;
            
            // Update text for each friendly token icon
            html.find("#friendly-actor-list label").each((_, el) => {
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
    static async _distributeXP(html, { combat, friendlies }) {
        const getSelectedTokens = type => html.find(`#${type}-actor-list label`).has("input:checked").map((_, el) => canvas.tokens.get($(el).data("tokenId"))).get();
        const selectedFriendlyTokens = getSelectedTokens("friendly");
        const selectedHostileTokens = getSelectedTokens("hostile");        
        const xpModifier = +html.find("#xp-modifier").val();
        
        if (selectedFriendlyTokens.length !== 0 && selectedHostileTokens.length !== 0) {
            const totalXp = selectedHostileTokens.reduce((total, token) => total + token.actor.system.details.xp.value, 0) * xpModifier;
            const perFriendly = Math.floor(totalXp / selectedFriendlyTokens.length);

            for (const friendly of selectedFriendlyTokens) {
                await this.applyXP(friendly.actor, perFriendly);
            }

            await this.outputToChat(`
                <p><strong>Experience awarded!</strong> (${totalXp} XP)</p>
                <p><strong>${perFriendly} XP</strong> given to:</p>
                <ul>
                    ${selectedFriendlyTokens.map(({actor}) => `<li>${actor.name}</li>`).join("")}
                </ul>
            `);

            let levelUps = selectedFriendlyTokens.filter(({actor}) => actor.system.details.xp.value >= actor.system.details.xp.max);
            if (levelUps.length) {
                await this.outputToChat(`
                    <p><strong>Level ups!</strong></p>
                    <p>The following characters have enough XP to level up:</p>
                    <ul>
                        ${levelUps.map(({actor}) => `<li>${actor.name}</li>`).join("")}
                    </ul>
                `);
            }
        }

        // If there are any deselected friendlies, add a flag to them to not select them by default next time
        // If any selected friendlies DO have the deselect by default flag, clear it
        // E.G. if a summon/companion is deselected, learn to not select it by default next time
        for (const friendly of friendlies) {
            const hasFlag = friendly.actor.getFlag(NAME, FLAGS.giveXP.deselectByDefault);
            const isSelected = selectedFriendlyTokens.find(selected => selected.actor.id === friendly.actor.id);

            if (!hasFlag && !isSelected) {
                await friendly.actor.setFlag(NAME, FLAGS.giveXP.deselectByDefault, true);
            } else if (hasFlag && isSelected) {
                await friendly.actor.unsetFlag(NAME, FLAGS.giveXP.deselectByDefault);
            }
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
            "data.details.xp.value": actor.system.details.xp.value + amount
        });
    }
    
    /**
     * Creates a chat message and outputs to chat
     */
    static async outputToChat(content) {
        const user = game.userId,
            alias = "CUB Experience",
            type = CONST.CHAT_MESSAGE_TYPES.OTHER;

        await ChatMessage.create({
            user,
            speaker: {
                alias
            },
            content,
            type
        });
    }
}