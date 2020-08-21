import { Sidekick } from "../sidekick.js";
import { SETTING_KEYS, NAME, PATH, FLAGS, DEFAULT_CONFIG } from "../butler.js";
import { HideNPCNamesActorForm } from "./actor-form.js";

export class HideNPCNames {
    static _onPreCreateChatMessage(message, data, options, user) {
        // use most of the logic from render
        // add a flag to the data payload marking the message as needing hiding
        // include the replacement name
    }

    /**
     * Handle render Actor sheet
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
            new HideNPCNamesActorForm(app.object).render(true);
        });
    }

    /**
     * Hooks on the Combat Tracker render to replace the names
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
        const combatants = app?.combat?.combatants;

        if (!combatants || !combatants?.length) return;

        const combatantTokens = combatants.map(c => c.token);
        const tokens = combatantTokens.map(c => canvas.tokens.placeables.find(t => t.id === c._id));
        const npcs = tokens.filter(t => {
            const actor = t.actor || game.actors.entities.find(a => a.id === t.actorId);
            
            if (actor.isPC === false) return true;
        });

        if (!npcs.length) return;

        // check if name should be hidden
        const hideNPCs = npcs.map(npc => {
            const flag = npc.actor.getFlag(NAME, FLAGS.hideNames.enable);
            if (flag) {
                const replacement = npc.actor.getFlag(NAME, FLAGS.hideNames.replacementName);

                return {
                    id: npc._id,
                    name: npc.name,
                    replacement
                }
            }             
        });

        if (!hideNPCs.length) return;
        
        // for each replacement, find the matching element and replace
        const combatantListElement = html.find("li");
        const hideNPCElements = combatantListElement.filter((i, el) => {
            const token = game.scenes.active.data.tokens.find(t => t._id === el.dataset.tokenId);

            if (!token) return false;

            if (hideNPCs.find(t => t.id === token._id)) return true;
        });

        if (!hideNPCElements.length) return;

        for (const el in hideNPCElements) {
            const hideNPC = hideNPCs.find(n => n.id === el.dataset.tokenId);
            $(el).find(".token-name").text(hideNPC.replacement);
            $(el).find(".token-image").attr("title", hideNPC.replacement);

        }
    }

    /**
     * Replaces instances of hidden name in chat
     * @todo: If a player owns the message speaker - reveal the message
     */
    static _hookOnRenderChatMessage(message, html, data) {
        const enable = Sidekick.getSetting(SETTING_KEYS.hideNames.enable);

        if (!enable) {
            return;
        }

        const messageActorId = message.data.speaker.actor;
        const messageTokenId = message.data.speaker.token;
        const token = canvas.tokens.get(messageTokenId);
        const actor = token ? token.actor : game.actors.get(messageActorId);
        const speakerIsNPC = actor && !actor.isPC;

        if (!speakerIsNPC) {
            return;
        }

        const dispositionEnum = actor.data.token.disposition;
        const disposition = Sidekick.getKeyByValue(CONST.TOKEN_DISPOSITIONS, dispositionEnum);
        const dispositionEnableSetting = Sidekick.getSetting(SETTING_KEYS.hideNames[`enable${disposition.titleCase()}`]);
        const actorEnableFlag = actor.getFlag(NAME, FLAGS.hideNames.enable);
        const enableHide = actorEnableFlag ?? dispositionEnableSetting;

        if (!enableHide) return;

        const replacementSetting = Sidekick.getSetting(SETTING_KEYS.hideNames[`${disposition.toLowerCase()}NameReplacement`]);
        const replacementFlag = actor.getFlag(NAME, FLAGS.hideNames.replacementName) ?? message.getFlag(NAME, FLAGS.hideNames.replacementName);
        const replacementName = replacementFlag ?? replacementSetting;
        const matchString = data.alias.includes(" ") ? Sidekick.getTerms(data.alias.trim().split(" ")).map(e => Sidekick.escapeRegExp(e)).join("|") : Sidekick.escapeRegExp(data.alias);
        const regex = matchString + "(?=\\s|[\\W]|s|'s|$)";
        const pattern = new RegExp(regex, "gim");

        const senderName = html.find("header").children().first();
        const icon = `<span> <i class="fas fa-mask" title="${replacementName}"></i></span>`;
        console.log("actor:",actor,"original name:",data.alias,"actor flag:",replacementFlag,"actor flag2:",actor.data.flags,"replacement name:",replacementName)
        if (!game.user.isGM && !actor.owner) {
            Sidekick.replaceOnDocument(pattern, replacementName, {target: html[0]});
        } else {
            senderName.append(icon);
        }

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