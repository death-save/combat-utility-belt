import { Sidekick } from "../sidekick.js";
import { SETTING_KEYS, NAME, PATH, FLAGS, DEFAULT_CONFIG } from "../butler.js";

/**
 * Hides NPC names in the combat tracker
 */
export class HideNPCNames {
    /**
     * 
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     */
    static _onRenderActorSheet(app, html, data) {
        const disposition = app.object.data.token.disposition;
        const nameField = html.find("input[name='name']");
        
        const enableHostile = Sidekick.getSetting(SETTING_KEYS.hideNames.enableHostile);
        const enableNeutral = Sidekick.getSetting(SETTING_KEYS.hideNames.enableNeutral);
        const enableFriendly = Sidekick.getSetting(SETTING_KEYS.hideNames.enableFriendly);

        const formButtonHtml = `<a style="flex: 0"><i class="fas fa-mask"></i></a>`; 

        if (!nameField) return;

        switch (disposition) {
            case CONST.TOKEN_DISPOSITIONS.HOSTILE:
                if (!enableHostile) return;
                break;
                
            case CONST.TOKEN_DISPOSITIONS.NEUTRAL:
                if (!enableNeutral) return;
                break;

            case CONST.TOKEN_DISPOSITIONS.FRIENDLY:
                if (!enableFriendly) return;
                break;

            default:
                return;
        }

        const button = $(formButtonHtml)
        nameField.parent().after(button);

        button.on("click", event => {
            new HideNamesActorForm(app.object).render(true);
        });
    }

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

        // find the NPC combatants
        const combatants = app.object.combatants;
        const tokens = combatants.map(c => c.token);
        const npcs = tokens.filter(t => {
            const actor = t.actor || game.actors.entities.find(a => a.id === t.actorId);
            if (actor.isPC === false) return true;
        });

        // check if NPC name should be hidden
        
        // get the replacement

        // for each replacement, find the matching element and replace
        const combatantListElement = html.find("li");

        const npcElements = combatantListElement.filter((i, el) => {
            const token = game.scenes.active.data.tokens.find(t => t._id === el.dataset.tokenId);
            
            if (!token) return false;

            const disposition = token.disposition;
            const actor = token.actor || game.actors.entities.find(a => a._id === token.actorId);

            if (!actor) return false;

            const hideNameFlag = HideNPCNames.getActorFlag(actor, disposition);

            if (actor.isPC === false && hideNameFlag) {
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
        const regex = matchString + "(?=\\s|[\\W]|s|'s|$)";
        const pattern = new RegExp(regex, "gim");

        Sidekick.replaceOnDocument(pattern, replacement, {target: html[0]});

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

    static get replacementTypes() {
        return {
            race: "Race",
            type: "Type",
            other: "Other"
        }
    }
}

class HideNamesActorForm extends FormApplication {
    constructor(object, options={}) {
        super(object, options);

        this.actor = object;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: DEFAULT_CONFIG.hideNames.actorForm.id,
            title: DEFAULT_CONFIG.hideNames.actorForm.title,
            template: `${PATH}/templates/actor-hide-name.hbs`
        });
    }

    getData() {
        const actor = this.actor;
        const disposition = actor.data.token.disposition;
        const demeanour = Sidekick.getKeyByValue(CONST.TOKEN_DISPOSITIONS, disposition);
        const enableSetting = Sidekick.getSetting(SETTING_KEYS.hideNames[`enable${demeanour.titleCase()}`]);
        const enableFlag = actor.getFlag(NAME, FLAGS.hideNames.enable);
        const enable = enableFlag ?? enableSetting;
        const replacementType = actor.getFlag(NAME, FLAGS.hideNames.replacementType);
        const replacementName = actor.getFlag(NAME, FLAGS.hideNames.replacementName);
        const replacementTypes = HideNPCNames.replacementTypes;
        const typeOther = replacementType && replacementType === "other";

        return {
            enable,
            replacementType,
            replacementTypes,
            replacementName,
            typeOther
        }
    }
}