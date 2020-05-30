import { Sidekick } from "../sidekick.js";
import { NAME, SETTING_KEYS, DEFAULT_CONFIG, FLAGS } from "../butler.js";
import { MightySummoner } from "../mighty-summoner.js";

export class TokenUtility {
    /**
     * Hook on token create
     * @param {Object} scene
     * @param {Object} tokenData  
     * @param {Object} options 
     * @param {String} userId 
     * @todo move this to a preCreate hook to avoid a duplicate call to the db
     */
    static _onPreCreateToken(scene, tokenData, options, userId) {
        //const token = canvas.tokens.get(tokenData._id);
        const actor = game.actors.get(tokenData.actorId);
        const autoRollHP = Sidekick.getSetting(SETTING_KEYS.tokenUtility.autoRollHP);
        const mightySummonerSetting = Sidekick.getSetting(SETTING_KEYS.tokenUtility.mightySummoner);
        const mightySummonerFlag = getProperty(tokenData, `flags.${NAME}.${FLAGS.mightySummoner.mightySummoner}`);
        const tempCombatantSetting = Sidekick.getSetting(SETTING_KEYS.tempCombatants.enable);
        const tempCombatantFlag = getProperty(tokenData, `flags.${NAME}.${FLAGS.temporaryCombatants.temporaryCombatant}`);

        // if this token has been handled by the mighty summoner logic then nothing to do
        if (mightySummonerFlag || (tempCombatantSetting && tempCombatantFlag)) {
            return;
        }

        const feat = Sidekick.getSetting(SETTING_KEYS.tokenUtility.mightySummonerFeat);

        if (mightySummonerSetting && MightySummoner._checkForFeat(actor, feat)) {
            MightySummoner._createDialog(tokenData, actor);
            return false;
        }
        
        if (tokenData.disposition !== -1 || !autoRollHP || actor?.isPC) {
            return;
        }

        const formula = null;
        const newHP = TokenUtility.rollHP(actor, formula);
        const hpUpdate = TokenUtility._buildHPData(newHP);
        const newData = mergeObject(tokenData, hpUpdate);
        return newData;
    }

    /**
     * 
     * @param {*} scene 
     * @param {*} tokenData 
     * @param {*} options 
     * @param {*} userId 
     */
    static _onCreateToken(scene, tokenData, options, userId) {
        
    }

    

    /**
     * Rolls an actor's hp formula and returns an update payload with the result
     * @param {*} actor
     */
    static rollHP(actor, newFormula=null) {
        const formula = newFormula || getProperty(actor, "data.data.attributes.hp.formula");

        if (!formula) {
            return null;
        }
    
        const r = new Roll(formula);
        const roll = r.roll();
        roll.toMessage({flavor: `${actor.name} rolls for HP!`});
        const hp = r.total;
    
        return hp;
    }

    /**
     * For a given hp value, build an object with hp value and max set
     * @param {*} hp 
     */
    static _buildHPData(hp) {
        return {
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
    }

    /**
     * Patch the core draw effects so that effects are resizable
     * Errors related to lexical "this" can be ignored due to the fact this method is used as a monkeypatch
     */
    static _patchDrawEffects() {
        let effectSize; 
        
        try {
            effectSize = Sidekick.getSetting(SETTING_KEYS.tokenUtility.effectSize); 
        } catch (e) {
            console.warn(e);
            effectSize = null;
        }


        // Use the default values if no setting found
        const multiplier = effectSize ? DEFAULT_CONFIG.tokenUtility.effectSize[effectSize].multiplier : 2;
        const divisor = effectSize ? DEFAULT_CONFIG.tokenUtility.effectSize[effectSize].divisor : 5;

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