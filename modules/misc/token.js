class CUBTokenUtility {
    constructor() {
        this.settings = {
            mightySummoner: CUBSidekick.initGadgetSetting(CUBTokenUtility.GADGET_NAME + "(" + CUBTokenUtility.SETTINGS_DESCRIPTORS.MightySummonerN + ")", this.SETTINGS_META.mightySummoner),
            autoRollHostileHp: CUBSidekick.initGadgetSetting(CUBTokenUtility.GADGET_NAME + "(" + CUBTokenUtility.SETTINGS_DESCRIPTORS.AutoRollHostileHpN + ")", this.SETTINGS_META.autoRollHostileHp),
            tokenEffectSize: CUBSidekick.initGadgetSetting(CUBTokenUtility.GADGET_NAME + "(" + CUBTokenUtility.SETTINGS_DESCRIPTORS.TokenEffectSizeN + ")", this.SETTINGS_META.tokenEffectSize)
        };
    }

    static get GADGET_NAME() {
        return "token-utility";
    }

    static get SETTINGS_DESCRIPTORS() {
        return {
            MightySummonerN: "--Mighty Summoner--",
            MightySummonerH: "Automatically check to see if token owner of NEUTRAL actor also owns an actor with the Mighty Summoner feat. Automatically calculates and adds new HP formula and rolls HP for token on canvas drop",
            AutoRollHostileHpN: "--Auto Roll Hostile--",
            AutoRollHostileHpH: "Automatically roll hp for hostile tokens on canvas drop",
            TokenEffectSizeN: "--Token Effect Size--",
            TokenEffectSizeH: "Sets the size for token effects when drawn on the token. Default: Small"
        };
    }

    static get DEFAULT_CONFIG() {
        return {
            mightySummoner: false,
            AutoRollHostileHp: false,
            tokenEffectSize: {
                large: {
                    multiplier: 4,
                    divisor: 2
                },
                medium: {
                    multiplier: 3,
                    divisor: 3
                },
                small: {
                    multiplier: 2,
                    divisor: 5
                }
            },
            tokenEffectSizeChoices: {
                large: "Large",
                medium: "Medium",
                small: "Small"
            }
        };
    }

    get SETTINGS_META() {
        return {
            mightySummoner: {
                name: CUBTokenUtility.SETTINGS_DESCRIPTORS.MightySummonerN,
                hint: CUBTokenUtility.SETTINGS_DESCRIPTORS.MightySummonerH,
                default: CUBTokenUtility.DEFAULT_CONFIG.mightySummoner,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.mightySummoner = s;
                }
            },
            autoRollHostileHp: {
                name: CUBTokenUtility.SETTINGS_DESCRIPTORS.AutoRollHostileHpN,
                hint: CUBTokenUtility.SETTINGS_DESCRIPTORS.AutoRollHostileHpH,
                default: CUBTokenUtility.DEFAULT_CONFIG.autoRollHostileHp,
                scope: "world",
                type: Boolean,
                config: true,
                onChange: s => {
                    this.settings.autoRollHostileHp = s;
                }
            },
            tokenEffectSize: {
                name: CUBTokenUtility.SETTINGS_DESCRIPTORS.TokenEffectSizeN,
                hint: CUBTokenUtility.SETTINGS_DESCRIPTORS.TokenEffectSizeH,
                default: CUBSidekick.getKeyByValue(CUBTokenUtility.DEFAULT_CONFIG.tokenEffectSizeChoices, CUBTokenUtility.DEFAULT_CONFIG.tokenEffectSizeChoices.small),
                scope: "client",
                type: String,
                choices: CUBTokenUtility.DEFAULT_CONFIG.tokenEffectSizeChoices,
                config: true,
                onChange: s => {
                    this.settings.tokenEffectSize = s;
                    Token.prototype.drawEffects = CUBTokenUtility._patchDrawEffects;
                    canvas.draw();
                }
            }
        };
    }

    /**
     * 
     * @param {*} token 
     * @param {*} sceneId 
     */
    _summonerFeats(token, scene) {
        if (!game.user.isGM) {
            return;
        }

        // If the token actor doesn't have the feat, check the other actors owned by the token's owner
        if (token.actor && !this._actorHasFeat(token.actor)) {
            //console.log("Summoner feats "); console.log(token)
            
            const owners = Object.keys(token.actor.data.permission).filter(p => p !== "default" && token.actor.data.permission[p] === CONST.ENTITY_PERMISSIONS.OWNER);

            if (!owners) {
                return;
            }

            let actors;

            owners.forEach(owner => {
                const owned = game.actors.entities.filter(actor => hasProperty(actor, "data.permission." + owner));
                if (actors === undefined) {
                    actors = owned;
                } else {
                    actors.push(owned);
                }
            });

            if (!actors) {
                return;
            }

            const summoners = actors.find(actor => this._actorHasFeat(actor));

            if (!summoners) {
                return;
            }

            new Dialog({
                title: "Feat Summoning",
                content: "<p>Mighty Summoner found. Is this monster being summoned?</p>",
                buttons: {
                    yes: {
                        icon: `<i class="fas fa-check"></i>`,
                        label: "Yes",
                        callback: () => {
                            let actor = token.actor;
                            let formula = actor.data.data.attributes.hp.formula;
                            const match = formula.match(/\d+/)[0];
                            if (match !== undefined) {
                                formula += " + " + (match * 2);
                                actor.data.data.attributes.hp.formula = formula;
                                token.actorData = {
                                    data: {
                                        attributes: {
                                            hp: {
                                                formula: formula,
                                            }
                                        }
                                    }
                                };
                                this._rerollTokenHp(token, scene);
                            }
                        }
                    },
                    no: {
                        icon: `<i class="fas fa-times"></i>`,
                        label: "No"
                    }
                },
                default: "yes"
            }).render(true);
        }
    }

    /**
     * 
     * @param {*} actor 
     */
    _actorHasFeat(actor) {
        return !!actor.items.find(i => i.type === "feat" && i.name.includes("Mighty Summoner"));
    }

    /**
     * 
     * @param {*} token 
     * @param {*} sceneId 
     */
    _rerollTokenHp(token, scene) {
        const formula = token.actor.data.data.attributes.hp.formula;

        let r = new Roll(formula);
        r.roll();
        const hp = r.total;

        const update = {
            _id: token.id,
            actorData: {
                data: {
                    attributes: {
                        hp: {
                            value: hp,
                            max: hp
                        }
                    }
                }
            }
        };

        scene.updateEmbeddedEntity("Token", update);
    }

    /**
     * Hook on token create
     * @param {Object} token 
     * @param {String} sceneId 
     * @param {Object} update 
     * @todo move this to a preCreate hook to avoid a duplicate call to the db
     */
    _hookOnCreateToken(scene, sceneId, tokenData, options, userId) {
        const token = new Token(tokenData);

        if (tokenData.disposition === -1 && this.settings.autoRollHostileHp && token.actor && !token.actor.isPC) {
            this._rerollTokenHp(token, scene);
        } else if (this.settings.mightySummoner) {
            this._summonerFeats(token, scene);
        }
    }

    /**
     * 
     */
    static _patchDrawEffects() {
        let effectSize; 
        
        try {
            effectSize = CUBSidekick.getGadgetSetting(CUBTokenUtility.GADGET_NAME + "(" + CUBTokenUtility.SETTINGS_DESCRIPTORS.TokenEffectSizeN + ")") 
        } catch (e) {
            console.warn(e);
            effectSize = null;
        }


        // Use the default values if no setting found
        const multiplier = effectSize ? CUBTokenUtility.DEFAULT_CONFIG.tokenEffectSize[effectSize].multiplier : 2;
        const divisor = effectSize ? CUBTokenUtility.DEFAULT_CONFIG.tokenEffectSize[effectSize].divisor : 5;

        this.effects.removeChildren().forEach(c => c.destroy());

        // Draw status effects
        if (this.data.effects.length > 0 ) {

            // Determine the grid sizing for each effect icon
            let w = Math.round(canvas.dimensions.size / 2 / 5) * multiplier;

            // Draw a background Graphics object
            let bg = this.effects.addChild(new PIXI.Graphics()).beginFill(0x000000, 0.40).lineStyle(1.0, 0x000000);

            // Draw each effect icon
            this.data.effects.forEach((src, i) => {
                let tex = PIXI.Texture.from(src, { scale: 1.0 });
                let icon = this.effects.addChild(new PIXI.Sprite(tex));
                icon.width = icon.height = w;
                icon.x = Math.floor(i / divisor) * w;
                icon.y = (i % divisor) * w;
                bg.drawRoundedRect(icon.x + 1, icon.y + 1, w - 2, w - 2, 2);
                this.effects.addChild(icon);
            });
        }

        // Draw overlay effect
        if ( this.data.overlayEffect ) {
            let tex = PIXI.Texture.from(this.data.overlayEffect, { scale: 1.0 });
            let icon = new PIXI.Sprite(tex),
                size = Math.min(this.w * 0.6, this.h * 0.6);
            icon.width = icon.height = size;
            icon.position.set((this.w - size) / 2, (this.h - size) / 2);
            icon.alpha = 0.80;
            this.effects.addChild(icon);
        }
    }
}