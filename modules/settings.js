import * as BUTLER from "./butler.js";
import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";
import { Sidekick } from "./sidekick.js";
import { TokenUtility } from "./utils/token.js";

export function SETTINGS_METADATA() {
    return {
        /* -------------------------------------------- */
        /*              EnhancedConditions              */
        /* -------------------------------------------- */

        [BUTLER.SETTING_KEYS.enhancedConditions.enable]: {
            name: "SETTINGS.EnhancedConditions.EnableN",
            hint: "SETTINGS.EnhancedConditions.EnableH",
            scope: "world",
            type: Boolean,
            default: false,
            config: true,
            onChange: s => {
                EnhancedConditions._toggleLabButtonVisibility(s);
                EnhancedConditions._updateStatusIcons();
            }
        },
        [BUTLER.SETTING_KEYS.enhancedConditions.system]: {
            name: "SETTINGS.EnhancedConditions.SystemN",
            hint: "SETTINGS.EnhancedConditions.SystemH",
            scope: "world",
            type: String,
            default: BUTLER.DEFAULT_GAME_SYSTEMS[game.system.id] !== null ? BUTLER.DEFAULT_GAME_SYSTEMS[game.system.id].id : BUTLER.DEFAULT_GAME_SYSTEMS.other.id,
            choices: Sidekick.getSystemChoices(),
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.enhancedConditions.map]: {
            name: "SETTINGS.EnhancedConditions.ActiveConditionMapN",
            hint: "SETTINGS.EnhancedConditions.ActiveConditionMapH",
            scope: "world",
            type: Object,
            default: EnhancedConditions.getDefaultMap(),
            onChange: s => {
                EnhancedConditions._updateStatusIcons(s[this.settings.system]);
            }
        },
        [BUTLER.SETTING_KEYS.enhancedConditions.maps]: {
            name: "SETTINGS.EnhancedConditions.ConditionMapsN",
            hint: "SETTINGS.EnhancedConditions.ConditionMapsH",
            scope: "world",
            type: Object,
            default: EnhancedConditions.getDefaultMaps(BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionMapsPath),
            onChange: s => {
                EnhancedConditions._updateStatusIcons(s[this.settings.system]);
            }
        },
        [BUTLER.SETTING_KEYS.enhancedConditions.output]: {
            name: "SETTINGS.EnhancedConditions.OutputChatN",
            hint: "SETTINGS.EnhancedConditions.OutputChatH",
            scope: "world",
            type: Boolean,
            config: true,
            default: BUTLER.DEFAULT_CONFIG.enhancedConditions.outputChat,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.enhancedConditions.removeDefaultEffects]: {
            name: "SETTINGS.EnhancedConditions.RemoveDefaultEffectsN",
            hint: "SETTINGS.EnhancedConditions.RemoveDefaultEffectsH",
            scope: "world",
            type: Boolean,
            config: true,
            default: BUTLER.DEFAULT_CONFIG.enhancedConditions.removeDefaultEffects,
            onChange: s => {
                EnhancedConditions._updateStatusIcons();
            }
        },

        /* -------------------------------------------- */
        /*                 TokenUtility                 */
        /* -------------------------------------------- */

        [BUTLER.SETTING_KEYS.mightySummoner.enable]: {
            name: "SETTINGS.MightySummoner.MightySummonerN",
            hint: "SETTINGS.MightySummoner.MightySummonerH",
            default: BUTLER.DEFAULT_CONFIG.mightySummoner.enable,
            scope: "world",
            type: Boolean,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.tokenUtility.autoRollHP]: {
            name: "SETTINGS.TokenUtility.AutoRollHostileHpN",
            hint: "SETTINGS.TokenUtility.AutoRollHostileHpH",
            default: BUTLER.DEFAULT_CONFIG.tokenUtility.autoRollHP,
            scope: "world",
            type: Boolean,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.tokenUtility.effectSize]: {
            name: "SETTINGS.TokenUtility.TokenEffectSizeN",
            hint: "SETTINGS.TokenUtility.TokenEffectSizeH",
            default: Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.tokenUtility.effectSizeChoices, BUTLER.DEFAULT_CONFIG.tokenUtility.effectSizeChoices.small),
            scope: "client",
            type: String,
            choices: BUTLER.DEFAULT_CONFIG.tokenUtility.effectSizeChoices,
            config: true,
            onChange: s => {
                Token.prototype.drawEffects = TokenUtility._patchDrawEffects;
                canvas.draw();
            }
        },

        /* -------------------------------------------- */
        /*                   PanSelect                  */
        /* -------------------------------------------- */

        [BUTLER.SETTING_KEYS.panSelect.enablePan]: {
            name: "SETTINGS.PanSelect.EnablePanN",
            hint: "SETTINGS.PanSelect.EnablePanH",
            default: BUTLER.DEFAULT_CONFIG.panSelect.enablePan,
            scope: "world",
            type: Boolean,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.panSelect.panGM]: {
            name: "SETTINGS.PanSelect.PanGMN",
            hint: "SETTINGS.PanSelect.PanGMH",
            default: Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.panSelect.panGM, BUTLER.DEFAULT_CONFIG.panSelect.panGM.none),
            scope: "world",
            type: String,
            choices: BUTLER.DEFAULT_CONFIG.panSelect.panGM,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.panSelect.panPlayers]: {
            name: "SETTINGS.PanSelect.PanPlayersN",
            hint: "SETTINGS.PanSelect.PanPlayersH",
            default: Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.panSelect.panPlayers, BUTLER.DEFAULT_CONFIG.panSelect.panPlayers.none),
            scope: "world",
            type: String,
            choices: BUTLER.DEFAULT_CONFIG.panSelect.panPlayers,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.panSelect.enableSelect]: {
            name: "SETTINGS.PanSelect.EnableSelectN",
            hint: "SETTINGS.PanSelect.EnableSelectH",
            default: BUTLER.DEFAULT_CONFIG.panSelect.enableSelect,
            scope: "world",
            type: Boolean,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.panSelect.selectGM]: {
            name: "SETTINGS.PanSelect.SelectGMN",
            hint: "SETTINGS.PanSelect.SelectGMH",
            default: Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.panSelect.panGM, BUTLER.DEFAULT_CONFIG.panSelect.panGM.none),
            scope: "world",
            type: String,
            choices: BUTLER.DEFAULT_CONFIG.panSelect.panGM, //uses same options as Pan GM
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.panSelect.selectPlayers]: {
            name: "SETTINGS.PanSelect.SelectPlayersN",
            hint: "SETTINGS.PanSelect.SelectPlayersH",
            default: BUTLER.DEFAULT_CONFIG.panSelect.selectPlayers,
            scope: "world",
            type: Boolean,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.panSelect.observerDeselect]: {
            name: "SETTINGS.PanSelect.ObserverDeselectN",
            hint: "SETTINGS.PanSelect.ObserverDeselectH",
            default: BUTLER.DEFAULT_CONFIG.panSelect.observerDeselect,
            scope: "world",
            type: Boolean,
            config: true,
            onChange: s => {}
        },

        /* -------------------------------------------- */
        /*              TemporaryCombatants             */
        /* -------------------------------------------- */

        [BUTLER.SETTING_KEYS.tempCombatants.enable]: {
            name: "SETTINGS.TemporaryCombatants.EnableN",
            hint: "SETTINGS.TemporaryCombatants.EnableH",
            default: BUTLER.DEFAULT_CONFIG.tempCombatants.enable,
            scope: "world",
            type: Boolean,
            config: true,
            onChange: s => {
                ui.combat.render();
            }
        },

        /* -------------------------------------------- */
        /*                    GiveXP                    */
        /* -------------------------------------------- */

        [BUTLER.SETTING_KEYS.giveXP.enable]: {
            name: "SETTINGS.TrackerUtility.XPModuleN",
            hint: "SETTINGS.TrackerUtility.XPModuleH",
            default: BUTLER.DEFAULT_CONFIG.giveXP.enable,
            scope: "world",
            type: Boolean,
            config: true,
            onChange: s => {}
        },

        /* -------------------------------------------- */
        /*                 Concentrator                 */
        /* -------------------------------------------- */

        [BUTLER.SETTING_KEYS.concentrator.enable]: {
            name: "SETTINGS.Concentrator.EnableN",
            hint: "SETTINGS.Concentrator.EnableH",
            default: BUTLER.DEFAULT_CONFIG.concentrator.enable,
            scope: "world",
            type: Boolean,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.concentrator.icon]: {
            name: "SETTINGS.Concentrator.IconN",
            hint: "SETTINGS.Concentrator.IconH",
            default: BUTLER.DEFAULT_CONFIG.concentrator.icon,
            scope: "world",
            type: String,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.concentrator.concentrationAttribute]: {
            name: "SETTINGS.Concentrator.ConcentrationAttributeN",
            hint: "SETTINGS.Concentrator.ConcentrationAttributeH",
            default: BUTLER.DEFAULT_GAME_SYSTEMS[game.system.id] !== null ? BUTLER.DEFAULT_GAME_SYSTEMS[game.system.id].concentrationAttribute : BUTLER.DEFAULT_GAME_SYSTEMS.other.concentrationAttribute,
            scope: "world",
            type: String,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.concentrator.healthAttribute]: {
            name: "SETTINGS.Concentrator.HealthAttributeN",
            hint: "SETTINGS.Concentrator.HealthAttributeH",
            default: BUTLER.DEFAULT_GAME_SYSTEMS[game.system.id] !== null ? BUTLER.DEFAULT_GAME_SYSTEMS[game.system.id].healthAttribute : BUTLER.DEFAULT_GAME_SYSTEMS.other.healthAttribute,
            scope: "world",
            type: String,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.concentrator.outputChat]: {
            name: "SETTINGS.Concentrator.OutputToChatN",
            hint: "SETTINGS.Concentrator.OutputToChatH",
            default: BUTLER.DEFAULT_CONFIG.concentrator.outputChat,
            scope: "world",
            type: Boolean,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.concentrator.prompt]: {
            name: "SETTINGS.Concentrator.PromptRollN",
            hint: "SETTINGS.Concentrator.PromptRollH",
            default: BUTLER.DEFAULT_CONFIG.concentrator.promptRoll,
            scope: "world",
            type: Boolean,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.concentrator.autoConcentrate]: {
            name: "SETTINGS.Concentrator.AutoConcentrateN",
            hint: "SETTINGS.Concentrator.AutoConcentrateH",
            default: BUTLER.DEFAULT_CONFIG.concentrator.autoConcentrate,
            scope: "world",
            type: Boolean,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.concentrator.notifyDouble]: {
            name: "SETTINGS.Concentrator.ConcentratingNotifyDoubleN",
            hint: "SETTINGS.Concentrator.ConcentratingNotifyDoubleH",
            default: Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.concentrator.notifyDouble, BUTLER.DEFAULT_CONFIG.concentrator.notifyDouble.none),
            scope: "world",
            type: String,
            choices: BUTLER.DEFAULT_CONFIG.concentrator.notifyDouble,
            config: true,
            onChange: s => {}
        },

        /* -------------------------------------------- */
        /*                 HideNPCNames                 */
        /* -------------------------------------------- */

        [BUTLER.SETTING_KEYS.hideNames.enable]: {
            name: "SETTINGS.HideNames.EnableN",
            hint: "SETTINGS.HideNames.EnableH",
            scope: "world",
            type: Boolean,
            default: BUTLER.DEFAULT_CONFIG.hideNames.enable,
            config: true,
            onChange: s => {
                ui.combat.render();
                ui.chat.render();
            }
        },
        [BUTLER.SETTING_KEYS.hideNames.replacementString]: {
            name: "SETTINGS.HideNames.ReplacementStringN",
            hint: "SETTINGS.HideNames.ReplacementStringH",
            scope: "world",
            type: String,
            default: BUTLER.DEFAULT_CONFIG.hideNames.replacementString,
            config: true,
            onChange: s => {
                const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.hideNames.enable);

                if (enable) {
                    ui.combat.render();
                    ui.chat.render();
                }
            }
        },
        [BUTLER.SETTING_KEYS.hideNames.hideFooter]: {
            name: "SETTINGS.HideNames.HideFooterN",
            hint: "SETTINGS.HideNames.HideFooterH",
            scope: "world",
            type: Boolean,
            default: BUTLER.DEFAULT_CONFIG.hideNames.hideFooter,
            config: true,
            onChange: s => {
                ui.chat.render();
            }
        },

        /* -------------------------------------------- */
        /*              MarkInjuredDead                 */
        /* -------------------------------------------- */

        [BUTLER.SETTING_KEYS.injuredDead.enableInjured]: {
            name: "SETTINGS.InjuredDead.EnableInjuredN",
            hint: "SETTINGS.InjuredDead.EnableInjuredH",
            default: BUTLER.DEFAULT_CONFIG.injuredDead.enableInjured,
            scope: "world",
            type: Boolean,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.injuredDead.injuredIcon]: {
            name: "SETTINGS.InjuredDead.InjuredIconN",
            hint: "SETTINGS.InjuredDead.InjuredIconH",
            default: BUTLER.DEFAULT_CONFIG.injuredDead.injuredIcon,
            scope: "world",
            type: String,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.injuredDead.threshold]: {
            name: "SETTINGS.InjuredDead.ThresholdN",
            hint: "SETTINGS.InjuredDead.ThresholdH",
            default: BUTLER.DEFAULT_CONFIG.injuredDead.threshold,
            scope: "world",
            type: Number,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.injuredDead.enableDead]: {
            name: "SETTINGS.InjuredDead.EnableDeadN",
            hint: "SETTINGS.InjuredDead.EnableDeadH",
            default: BUTLER.DEFAULT_CONFIG.injuredDead.enableDead,
            scope: "world",
            type: Boolean,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.injuredDead.deadIcon]: {
            name: "SETTINGS.InjuredDead.DeadIconN",
            hint: "SETTINGS.InjuredDead.DeadIconH",
            default: BUTLER.DEFAULT_CONFIG.injuredDead.deadIcon,
            scope: "world",
            type: String,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.injuredDead.healthAttribute]: {
            name: "SETTINGS.InjuredDead.HealthAttributeN",
            hint: "SETTINGS.InjuredDead.HealthAttributeH",
            default: BUTLER.DEFAULT_GAME_SYSTEMS[game.system.id] !== null ? BUTLER.DEFAULT_GAME_SYSTEMS[game.system.id].healthAttribute : BUTLER.DEFAULT_GAME_SYSTEMS.other.healthAttribute,
            scope: "world",
            type: String,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.injuredDead.markDefeated]: {
            name: "SETTINGS.InjuredDead.MarkDefeatedN",
            hint: "SETTINGS.InjuredDead.MarkDefeatedH",
            default: BUTLER.DEFAULT_CONFIG.injuredDead.markDefeated,
            scope: "world",
            type: Boolean,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.injuredDead.enableUnconscious]: {
            name: "SETTINGS.InjuredDead.EnableUnconsciousN",
            hint: "SETTINGS.InjuredDead.EnableUnconsciousH",
            default: BUTLER.DEFAULT_CONFIG.injuredDead.enableUnconscious,
            scope: "world",
            type: Boolean,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.injuredDead.unconsciousActorType]: {
            name: "SETTINGS.InjuredDead.UnconsciousActorTypeN",
            hint: "SETTINGS.InjuredDead.UnconsciousActorTypeH",
            default: BUTLER.DEFAULT_CONFIG.injuredDead.unconsciousActorType,
            scope: "world",
            type: String,
            choices: game.system.entityTypes.Actor || [],
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.injuredDead.unconsciousIcon]: {
            name: "SETTINGS.InjuredDead.UnconsciousIconN",
            hint: "SETTINGS.InjuredDead.UnconsciousIconH",
            default: BUTLER.DEFAULT_CONFIG.injuredDead.unconsciousIcon,
            scope: "world",
            type: String,
            config: true,
            onChange: s => {}
        },

        /* -------------------------------------------- */
        /*               RerollInitiative               */
        /* -------------------------------------------- */

        [BUTLER.SETTING_KEYS.rerollInitiative.enable]: {
            name: "SETTINGS.RerollInitiative.EnableN",
            hint: "SETTINGS.RerollInitiative.EnableH",
            scope: "world",
            type: Boolean,
            default: BUTLER.DEFAULT_CONFIG.rerollInitiative.enable,
            config: true,
            onChange: s => {}
        },
        [BUTLER.SETTING_KEYS.rerollInitiative.rerollTemp]: {
            name: "SETTINGS.RerollInitiative.RerollTempCombatantsN",
            hint: "SETTINGS.RerollInitiative.RerollTempCombatantsH",
            scope: "world",
            type: Boolean,
            default: BUTLER.DEFAULT_CONFIG.rerollInitiative.rerollTempCombatants,
            config: true,
            onChange: s => {}
        }
    }
};