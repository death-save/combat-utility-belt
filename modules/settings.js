import * as BUTLER from "./butler.js";
import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";
import { Sidekick } from "./sidekick.js";
import { TokenUtility } from "./utils/token.js";

export function registerSettings() {
    /* -------------------------------------------- */
    /*                 Concentrator                 */
    /* -------------------------------------------- */

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.enable, {
        name: "SETTINGS.Concentrator.EnableN",
        hint: "SETTINGS.Concentrator.EnableH",
        default: BUTLER.DEFAULT_CONFIG.concentrator.enable,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.concentrationAttribute, {
        name: "SETTINGS.Concentrator.ConcentrationAttributeN",
        hint: "SETTINGS.Concentrator.ConcentrationAttributeH",
        default: BUTLER.KNOWN_GAME_SYSTEMS[game.system.id] !== null ? BUTLER.KNOWN_GAME_SYSTEMS[game.system.id].concentrationAttribute : BUTLER.KNOWN_GAME_SYSTEMS.other.concentrationAttribute,
        scope: "world",
        type: String,
        config: true,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.healthAttribute, {
        name: "SETTINGS.Concentrator.HealthAttributeN",
        hint: "SETTINGS.Concentrator.HealthAttributeH",
        default: BUTLER.KNOWN_GAME_SYSTEMS[game.system.id] !== null ? BUTLER.KNOWN_GAME_SYSTEMS[game.system.id].healthAttribute : BUTLER.KNOWN_GAME_SYSTEMS.other.healthAttribute,
        scope: "world",
        type: String,
        config: true,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.outputChat, {
        name: "SETTINGS.Concentrator.OutputToChatN",
        hint: "SETTINGS.Concentrator.OutputToChatH",
        default: BUTLER.DEFAULT_CONFIG.concentrator.outputChat,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.prompt, {
        name: "SETTINGS.Concentrator.PromptRollN",
        hint: "SETTINGS.Concentrator.PromptRollH",
        default: BUTLER.DEFAULT_CONFIG.concentrator.promptRoll,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.autoConcentrate, {
        name: "SETTINGS.Concentrator.AutoConcentrateN",
        hint: "SETTINGS.Concentrator.AutoConcentrateH",
        default: BUTLER.DEFAULT_CONFIG.concentrator.autoConcentrate,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.notifyDouble, {
        name: "SETTINGS.Concentrator.NotifyDoubleN",
        hint: "SETTINGS.Concentrator.NotifyDoubleH",
        default: Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.concentrator.notifyDouble, BUTLER.DEFAULT_CONFIG.concentrator.notifyDouble.none),
        scope: "world",
        type: String,
        choices: BUTLER.DEFAULT_CONFIG.concentrator.notifyDouble,
        config: true,
        onChange: s => {}
    });

    /* -------------------------------------------- */
    /*              EnhancedConditions              */
    /* -------------------------------------------- */

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable, {
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
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreIcons, {
        name: "SETTINGS.EnhancedConditions.CoreIconsN",
        hint: "SETTINGS.EnhancedConditions.CoreIconsH",
        scope: "world",
        type: Object,
        default: [],
        config: false,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.system, {
        name: "SETTINGS.EnhancedConditions.SystemN",
        hint: "SETTINGS.EnhancedConditions.SystemH",
        scope: "world",
        type: String,
        default: !!BUTLER.KNOWN_GAME_SYSTEMS[game.system.id] ? BUTLER.KNOWN_GAME_SYSTEMS[game.system.id].id : BUTLER.KNOWN_GAME_SYSTEMS.other.id,
        choices: Sidekick.getSystemChoices(),
        config: false,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType, {
        name: "SETTINGS.EnhancedConditions.MapTypeN",
        hint: "SETTINGS.EnhancedConditions.MapTypeH",
        scope: "world",
        type: String,
        default: BUTLER.KNOWN_GAME_SYSTEMS[game.system.id] !== null ? "default" : "other",
        choices: BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes,
        config: true,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMaps, {
        name: "SETTINGS.EnhancedConditions.DefaultMapsN",
        hint: "SETTINGS.EnhancedConditions.DefaultMapsH",
        scope: "world",
        type: Object,
        default: {},
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, {
        name: "SETTINGS.EnhancedConditions.ActiveConditionMapN",
        hint: "SETTINGS.EnhancedConditions.ActiveConditionMapH",
        scope: "world",
        type: Object,
        default: {},
        onChange: s => {
            EnhancedConditions._updateStatusIcons(s);
        }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.output, {
        name: "SETTINGS.EnhancedConditions.OutputChatN",
        hint: "SETTINGS.EnhancedConditions.OutputChatH",
        scope: "world",
        type: Boolean,
        config: true,
        default: BUTLER.DEFAULT_CONFIG.enhancedConditions.outputChat,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.removeDefaultEffects, {
        name: "SETTINGS.EnhancedConditions.RemoveDefaultEffectsN",
        hint: "SETTINGS.EnhancedConditions.RemoveDefaultEffectsH",
        scope: "world",
        type: Boolean,
        config: true,
        default: BUTLER.DEFAULT_CONFIG.enhancedConditions.removeDefaultEffects,
        onChange: s => {
            EnhancedConditions._updateStatusIcons();
        }
    });

    /* -------------------------------------------- */
    /*                    GiveXP                    */
    /* -------------------------------------------- */

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.giveXP.enable, {
        name: "SETTINGS.GiveXP.EnableN",
        hint: "SETTINGS.GiveXP.EnableH",
        default: BUTLER.DEFAULT_CONFIG.giveXP.enable,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {}
    });

    /* -------------------------------------------- */
    /*                 HideNPCNames                 */
    /* -------------------------------------------- */

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.hideNames.enable, {
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
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.hideNames.replacementString, {
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
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.hideNames.hideFooter, {
        name: "SETTINGS.HideNames.HideFooterN",
        hint: "SETTINGS.HideNames.HideFooterH",
        scope: "world",
        type: Boolean,
        default: BUTLER.DEFAULT_CONFIG.hideNames.hideFooter,
        config: true,
        onChange: s => {
            ui.chat.render();
        }
    });

    /* -------------------------------------------- */
    /*                MightySummoner                */
    /* -------------------------------------------- */

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.mightySummoner.enable, {
        name: "SETTINGS.MightySummoner.EnableN",
        hint: "SETTINGS.MightySummoner.EnableH",
        default: BUTLER.DEFAULT_CONFIG.mightySummoner.enable,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {}
    });

    /* -------------------------------------------- */
    /*                   PanSelect                  */
    /* -------------------------------------------- */

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.panSelect.enablePan, {
        name: "SETTINGS.PanSelect.EnablePanN",
        hint: "SETTINGS.PanSelect.EnablePanH",
        default: BUTLER.DEFAULT_CONFIG.panSelect.enablePan,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.panSelect.panGM, {
        name: "SETTINGS.PanSelect.PanGMN",
        hint: "SETTINGS.PanSelect.PanGMH",
        default: Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.panSelect.panGM, BUTLER.DEFAULT_CONFIG.panSelect.panGM.none),
        scope: "world",
        type: String,
        choices: BUTLER.DEFAULT_CONFIG.panSelect.panGM,
        config: true,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.panSelect.panPlayers, {
        name: "SETTINGS.PanSelect.PanPlayersN",
        hint: "SETTINGS.PanSelect.PanPlayersH",
        default: Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.panSelect.panPlayers, BUTLER.DEFAULT_CONFIG.panSelect.panPlayers.none),
        scope: "world",
        type: String,
        choices: BUTLER.DEFAULT_CONFIG.panSelect.panPlayers,
        config: true,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.panSelect.enableSelect, {
        name: "SETTINGS.PanSelect.EnableSelectN",
        hint: "SETTINGS.PanSelect.EnableSelectH",
        default: BUTLER.DEFAULT_CONFIG.panSelect.enableSelect,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.panSelect.selectGM, {
        name: "SETTINGS.PanSelect.SelectGMN",
        hint: "SETTINGS.PanSelect.SelectGMH",
        default: Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.panSelect.panGM, BUTLER.DEFAULT_CONFIG.panSelect.panGM.none),
        scope: "world",
        type: String,
        choices: BUTLER.DEFAULT_CONFIG.panSelect.panGM, //uses same options as Pan GM
        config: true,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.panSelect.selectPlayers, {
        name: "SETTINGS.PanSelect.SelectPlayersN",
        hint: "SETTINGS.PanSelect.SelectPlayersH",
        default: BUTLER.DEFAULT_CONFIG.panSelect.selectPlayers,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.panSelect.observerDeselect, {
        name: "SETTINGS.PanSelect.ObserverDeselectN",
        hint: "SETTINGS.PanSelect.ObserverDeselectH",
        default: BUTLER.DEFAULT_CONFIG.panSelect.observerDeselect,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {}
    });

    /* -------------------------------------------- */
    /*               RerollInitiative               */
    /* -------------------------------------------- */

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.rerollInitiative.enable, {
        name: "SETTINGS.RerollInitiative.EnableN",
        hint: "SETTINGS.RerollInitiative.EnableH",
        scope: "world",
        type: Boolean,
        default: BUTLER.DEFAULT_CONFIG.rerollInitiative.enable,
        config: true,
        onChange: s => {}
    });
    
    Sidekick.registerSetting(BUTLER.SETTING_KEYS.rerollInitiative.rerollTemp, {
        name: "SETTINGS.RerollInitiative.RerollTempCombatantsN",
        hint: "SETTINGS.RerollInitiative.RerollTempCombatantsH",
        scope: "world",
        type: Boolean,
        default: BUTLER.DEFAULT_CONFIG.rerollInitiative.rerollTempCombatants,
        config: true,
        onChange: s => {}
    });

    /* -------------------------------------------- */
    /*              TemporaryCombatants             */
    /* -------------------------------------------- */

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.tempCombatants.enable, {
        name: "SETTINGS.TemporaryCombatants.EnableN",
        hint: "SETTINGS.TemporaryCombatants.EnableH",
        default: BUTLER.DEFAULT_CONFIG.tempCombatants.enable,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {
            ui.combat.render();
        }
    });

    /* -------------------------------------------- */
    /*                 TokenUtility                 */
    /* -------------------------------------------- */

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.tokenUtility.autoRollHP, {
        name: "SETTINGS.TokenUtility.AutoRollHostileHpN",
        hint: "SETTINGS.TokenUtility.AutoRollHostileHpH",
        default: BUTLER.DEFAULT_CONFIG.tokenUtility.autoRollHP,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.tokenUtility.effectSize, {
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
    });

    /* -------------------------------------------- */
    /*                    Triggler                  */
    /* -------------------------------------------- */ 

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.triggler.triggers, {
        name: "SETTINGS.Triggler.TriggersN",
        hint: "SETTINGS.Triggler.TriggersH",
        scope: "world",
        type: Object,
        default: [],
        onChange: s => {}
    });

}