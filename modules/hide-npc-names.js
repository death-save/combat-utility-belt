import { Sidekick } from "./sidekick.js";
import { SETTING_KEYS } from "./butler.js";

/**
 * Hides NPC names in the combat tracker
 */
export class HideNPCNames {
    /**
     * Hooks on the Combat Tracker render to replace the NPC names
     * @param {Object} app - the Application instance
     * @param {Object} html - jQuery html object
     * @todo refactor required
     */
    static _hookOnRenderCombatTracker(app, html, data) {
        const enable = Sidekick.getSetting(SETTING_KEYS.hideNames.enable);

        if (game.user.isGM || !enable) {
            return;
        }
        
        const combatantListElement = html.find("li");

        const npcElements = combatantListElement.filter((i, el) => {
            const token = game.scenes.active.data.tokens.find(t => t._id === el.dataset.tokenId);
            const actor = game.actors.entities.find(a => a._id === token.actorId);

            if (actor.isPC === false) {
                return true;
            }
        });

        if (npcElements.length === 0) {
            return;
        }

        const replacement = Sidekick.getSetting(SETTING_KEYS.hideNames.replacementString) || " ";

        $(npcElements).find(".token-name").text(replacement);
        $(npcElements).find(".token-image").attr("title", replacement);
    }

    /**
     * Replaces instances of hidden NPC name in chat
     * @todo: If a player owns the message speaker - reveal the message
     */
    static _hookOnRenderChatMessage(message, html, data) {
        const enable = Sidekick.getSetting(SETTING_KEYS.hideNames.enable);

        if (game.user.isGM || !enable) {
            return;
        }

        const messageActorId = message.data.speaker.actor;
        const messageActor = game.actors.get(messageActorId);
        const speakerIsNPC = messageActor && !messageActor.isPC;

        if (!speakerIsNPC) {
            return;
        }

        const replacement = Sidekick.getSetting(SETTING_KEYS.hideNames.replacementString) || " ";
        const matchString = data.alias.includes(" ") ? Sidekick.getTerms(data.alias.trim().split(" ")).map(e => Sidekick.escapeRegExp(e)).join("|") : Sidekick.escapeRegExp(data.alias);
        const regex = matchString + "(?=[\\W]|s|'s)";
            
        html.each((i, el) => {
            el.innerHTML = el.innerHTML.replace(new RegExp(regex, "gim"), replacement);
        });

        const hideFooter = Sidekick.getSetting(SETTING_KEYS.hideNames.hideFooter);

        if (!hideFooter) {
            return;
        }

        const cardFooter = html.find(".card-footer");
        cardFooter.prop("hidden", true);    
    }

    /**
     * Replace names in the image popout
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    static _onRenderImagePopout(app, html, data) {
        const enable = Sidekick.getSetting(SETTING_KEYS.hideNames.enable);

        if (game.user.isGM || app.options.entity.type !== "Actor" || !enable) {
            return;
        }

        const actor = game.actors.get(app.options.entity.id);

        if (actor.isPC) {
            return;
        }

        const windowTitle = html.find(".window-title");
        const replacement = Sidekick.getSetting(SETTING_KEYS.hideNames.replacementString) || " ";

        if (windowTitle.length === 0) {
            return;
        } 

        windowTitle.text(replacement);

        const img = html.find("img");

        if (img.length === 0) {
            return;
        }

        img.attr("title", replacement);
    }
}