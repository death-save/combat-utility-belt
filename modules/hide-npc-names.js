/**
 * Hides NPC names in the combat tracker
 */
class CUBHideNPCNames {
    constructor() {
        this.settings = {
            hideNames: CUBSidekick.initGadgetSetting(
                this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.HideNamesN + ")", 
                this.SETTINGS_META.hideNames
            ),
            unknownCreatureString: CUBSidekick.initGadgetSetting(
                this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.UnknownCreatureN + ")",
                this.SETTINGS_META.unknownCreatureString
            ),
            hideFooter: CUBSidekick.initGadgetSetting(
                this.GADGET_NAME + "(" + this.SETTINGS_DESCRIPTORS.HideFooterN + ")",
                this.SETTINGS_META.hideFooter
            )
        };
    }

    get GADGET_NAME() {
        return "hide-npc-names";
    }

    get SETTINGS_DESCRIPTORS() {
        return {
            HideNamesN: "--Hide NPC Names--",
            HideNamesH: "Hides NPC names in the Combat Tracker",
            UnknownCreatureN: "Unknown Creature Name",
            UnknownCreatureH: "Text to display for hidden NPC names",
            HideFooterN: "Hide Chat Card Footer",
            HideFooterH: "When NPC names are hidden, also hide the chat card footer which can contain sensitive information"
        };
    }

    get DEFAULT_CONFIG() {
        return {
            hideNames: false,
            unknownCreatureString: "Unknown Creature",
            hideFooter: false
        };
    }

    get SETTINGS_META() {
        return {
            hideNames: {
                name: this.SETTINGS_DESCRIPTORS.HideNamesN,
                hint: this.SETTINGS_DESCRIPTORS.HideNamesH,
                scope: "world",
                type: Boolean,
                default: this.DEFAULT_CONFIG.hideNames,
                config: true,
                onChange: s => {
                    this.settings.hideNames = s;

                    ui.combat.render();
                    ui.chat.render();
                }
            },
            unknownCreatureString: {
                name: this.SETTINGS_DESCRIPTORS.UnknownCreatureN,
                hint: this.SETTINGS_DESCRIPTORS.UnknownCreatureH,
                scope: "world",
                type: String,
                default: this.DEFAULT_CONFIG.unknownCreatureString,
                config: true,
                onChange: s => {
                    this.settings.unknownCreatureString = s;
                    if (this.settings.hideNames) {
                        ui.combat.render();
                        ui.chat.render();
                    }
                }
            },
            hideFooter: {
                name: this.SETTINGS_DESCRIPTORS.HideFooterN,
                hint: this.SETTINGS_DESCRIPTORS.HideFooterH,
                scope: "world",
                type: Boolean,
                default: this.DEFAULT_CONFIG.hideFooter,
                config: true,
                onChange: s => {
                    this.settings.hideFooter = s;
                    ui.chat.render();
                }
            }
        };
    }

    /**
     * Hooks on the Combat Tracker render to replace the NPC names
     * @param {Object} app - the Application instance
     * @param {Object} html - jQuery html object
     * @todo refactor required
     */
    _hookOnRenderCombatTracker(app, html) {
        if (game.user.isGM || !this.settings.hideNames) {
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

        const replacement = this.settings.unknownCreatureString || " ";

        $(npcElements).find(".token-name").text(replacement);
        $(npcElements).find(".token-image").attr("title", replacement);
    }

    /**
     * Replaces instances of hidden NPC name in chat
     * @todo: If a player owns the message speaker - reveal the message
     */
    _hookOnRenderChatMessage(message, html, data) {
        if (game.user.isGM || !this.settings.hideNames) {
            return;
        }

        const messageActorId = message.data.speaker.actor;
        const messageActor = game.actors.get(messageActorId);
        const speakerIsNPC = messageActor && !messageActor.isPC;

        if (!speakerIsNPC) {
            return;
        }

        const replacement = this.settings.unknownCreatureString || " ";
        const matchString = data.alias.includes(" ") ? CUBSidekick.getTerms(data.alias.trim().split(" ")).map(e => CUBSidekick.escapeRegExp(e)).join("|") : CUBSidekick.escapeRegExp(data.alias);
        const regex = matchString + "(?=[\\W]|s|'s)";
            
        html.each((i, el) => {
            el.innerHTML = el.innerHTML.replace(new RegExp(regex, "gim"), replacement);
        });

        if (!this.settings.hideFooter) {
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
    _onRenderImagePopout(app, html, data) {
        if (game.user.isGM || app.options.entity.type !== "Actor" || !this.settings.hideNames) {
            return;
        }

        const actor = game.actors.get(app.options.entity.id);

        if (actor.isPC) {
            return;
        }

        const windowTitle = html.find(".window-title");
        const replacement = this.settings.unknownCreatureString || " ";

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