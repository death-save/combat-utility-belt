import * as BUTLER from "./butler.js";
import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";
import { Sidekick } from "./sidekick.js";
import { TokenUtility } from "./utils/token.js";
import { Concentrator } from "./concentrator.js";
import { CUBPuter } from "./cub-puter.js";
import AboutApp from "./about.mjs";

export function registerSettings() {

    /* -------------------------------------------- */
    /*                     About                    */
    /* -------------------------------------------- */

    Sidekick.registerMenu(BUTLER.SETTING_KEYS.aboutApp.menu, {
        name: "SETTINGS.AboutApp.ButtonN",
        label: BUTLER.DEFAULT_CONFIG.aboutApp.title,
        hint: "SETTINGS.AboutApp.ButtonH",
        icon: "fas fa-question",
        type: AboutApp,
        restricted: false
    });

    /* -------------------------------------------- */
    /*                   CUBPuter                   */
    /* -------------------------------------------- */

    Sidekick.registerMenu(BUTLER.SETTING_KEYS.cubPuter.menu, {
        name: "SETTINGS.CUBPuter.ButtonN",
        label: BUTLER.DEFAULT_CONFIG.cubPuter.title,
        hint: "SETTINGS.CUBPuter.ButtonH",
        icon: "fas fa-desktop",
        type: CUBPuter,
        restricted: true
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.cubPuter.config, {
        name: "SETTINGS.CUBPuter.ConfigN",
        hint: "SETTINGS.CUBPuter.ConfigH",
        default: BUTLER.DEFAULT_CONFIG.cubPuter.config,
        scope: "world",
        type: Object,
        onChange: s => {}
    });

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
        onChange: s => {
            if (s) {
                const enhancedConditionsEnabled = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

                enhancedConditionsEnabled ? Concentrator._createCondition() : Concentrator._promptEnableEnhancedConditions();
            }   
        }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.conditionName, {
        name: "SETTINGS.Concentrator.ConditionNameN",
        hint: "SETTINGS.Concentrator.ConditionNameH",
        default: BUTLER.DEFAULT_CONFIG.concentrator.conditionName,
        scope: "world",
        type: String,
        config: false,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.concentrationAttribute, {
        name: "SETTINGS.Concentrator.ConcentrationAttributeN",
        hint: "SETTINGS.Concentrator.ConcentrationAttributeH",
        default: BUTLER.KNOWN_GAME_SYSTEMS[game.system.id] ? BUTLER.KNOWN_GAME_SYSTEMS[game.system.id].concentrationAttribute : BUTLER.KNOWN_GAME_SYSTEMS.other.concentrationAttribute,
        scope: "world",
        type: String,
        config: false,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.healthAttribute, {
        name: "SETTINGS.Concentrator.HealthAttributeN",
        hint: "SETTINGS.Concentrator.HealthAttributeH",
        default: BUTLER.KNOWN_GAME_SYSTEMS[game.system.id] ? BUTLER.KNOWN_GAME_SYSTEMS[game.system.id].healthAttribute : BUTLER.KNOWN_GAME_SYSTEMS.other.healthAttribute,
        scope: "world",
        type: String,
        config: false,
        onChange: s => {}
    });


    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.prompt, {
        name: "SETTINGS.Concentrator.PromptRollN",
        hint: "SETTINGS.Concentrator.PromptRollH",
        default: BUTLER.DEFAULT_CONFIG.concentrator.promptRoll,
        scope: "world",
        type: Boolean,
        config: false,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.autoConcentrate, {
        name: "SETTINGS.Concentrator.AutoConcentrateN",
        hint: "SETTINGS.Concentrator.AutoConcentrateH",
        default: BUTLER.DEFAULT_CONFIG.concentrator.autoConcentrate,
        scope: "world",
        type: Boolean,
        config: false,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.autoEndConcentration, {
        name: `${BUTLER.NAME}.SETTINGS.CONCENTRATOR.AutoEndConcentrationN`,
        hint: `${BUTLER.NAME}.SETTINGS.CONCENTRATOR.AutoEndConcentrationH`,
        default: BUTLER.DEFAULT_CONFIG.concentrator.autoEndConcentration,
        scope: "world",
        type: Boolean,
        config: false,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.notifyConcentration, {
        name: `${BUTLER.NAME}.SETTINGS.CONCENTRATOR.NotifyConcentrationN`,
        hint: `${BUTLER.NAME}.SETTINGS.CONCENTRATOR.NotifyConcentrationH`,
        default: Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.concentrator.notifyConcentration, BUTLER.DEFAULT_CONFIG.concentrator.notifyConcentration.none),
        scope: "world",
        type: String,
        choices: BUTLER.DEFAULT_CONFIG.concentrator.notifyConcentration,
        config: false,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.notifyConcentrationCheck, {
        name: `${BUTLER.NAME}.SETTINGS.CONCENTRATOR.NotifyConcentrationCheckN`,
        hint: `${BUTLER.NAME}.SETTINGS.CONCENTRATOR.NotifyConcentrationCheckH`,
        default: Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.concentrator.notifyConcentrationCheck, BUTLER.DEFAULT_CONFIG.concentrator.notifyConcentrationCheck.none),
        scope: "world",
        type: String,
        choices: BUTLER.DEFAULT_CONFIG.concentrator.notifyConcentrationCheck,
        config: false,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.notifyDouble, {
        name: "SETTINGS.Concentrator.NotifyDoubleN",
        hint: "SETTINGS.Concentrator.NotifyDoubleH",
        default: Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.concentrator.notifyDouble, BUTLER.DEFAULT_CONFIG.concentrator.notifyDouble.none),
        scope: "world",
        type: String,
        choices: BUTLER.DEFAULT_CONFIG.concentrator.notifyDouble,
        config: false,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.notifyEndConcentration, {
        name: `${BUTLER.NAME}.SETTINGS.CONCENTRATOR.NotifyEndN`,
        hint: `${BUTLER.NAME}.SETTINGS.CONCENTRATOR.NotifyEndN`,
        default: Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.concentrator.notifyEndConcentration, BUTLER.DEFAULT_CONFIG.concentrator.notifyEndConcentration.none),
        scope: "world",
        type: String,
        choices: BUTLER.DEFAULT_CONFIG.concentrator.notifyEndConcentration,
        config: false,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.concentrator.hideNpcConcentration, {
        name: `${BUTLER.NAME}.SETTINGS.CONCENTRATOR.HideNPCConcentrationN`,
        hint: `${BUTLER.NAME}.SETTINGS.CONCENTRATOR.HideNPCConcentrationH`,
        scope: "world",
        type: Boolean,
        default: false,
        config: false,
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
        onChange: async (s) => {
            if (s) {
                await EnhancedConditions._onReady();
                if (!game.cub.enhancedConditions.supported) {
                    ui.notifications.warn(game.i18n.localize(`ENHANCED_CONDITIONS.GameSystemNotSupported`));
                    await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable, false);
                    if (ui.cub.cubPuter) ui.cub.cubPuter.render();
                }
            }

            EnhancedConditions._toggleLabButtonVisibility(s && game.cub.enhancedConditions.supported);
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

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreEffects, {
        name: "SETTINGS.EnhancedConditions.CoreEffectsN",
        hint: "SETTINGS.EnhancedConditions.CoreEffectsH",
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
        apiOnly: true,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType, {
        name: "SETTINGS.EnhancedConditions.MapTypeN",
        hint: "SETTINGS.EnhancedConditions.MapTypeH",
        scope: "world",
        type: String,
        //default: BUTLER.KNOWN_GAME_SYSTEMS[game.system.id] !== null ? "default" : "other",
        default: "",
        choices: BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes,
        config: false,
        apiOnly: true,
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
        default: [],
        onChange: async conditionMap => {
            await EnhancedConditions._updateStatusEffects(conditionMap);

            // Save the active condition map to a convenience property
            if (game.cub) {
                game.cub.conditions = conditionMap;
            }
        }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat, {
        name: "SETTINGS.EnhancedConditions.OutputChatN",
        hint: "SETTINGS.EnhancedConditions.OutputChatH",
        scope: "world",
        type: Boolean,
        config: false,
        default: BUTLER.DEFAULT_CONFIG.enhancedConditions.outputChat,
        onChange: s => {
            if (s === true) {
                const dialog = Dialog.confirm({
                    title: game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.OutputChatConfirm.Title`),
                    content: game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.OutputChatConfirm.Content`),
                    yes: () => {
                        const newMap = deepClone(game.cub.conditions);
                        if (!newMap.length) return;
                        newMap.forEach(c => c.options.outputChat = true);
                        Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, newMap);
                    },
                    no: () => {}
                });
            }
        }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputCombat, {
        name: "SETTINGS.EnhancedConditions.OutputCombatN",
        hint: "SETTINGS.EnhancedConditions.OutputCombatH",
        scope: "world",
        type: Boolean,
        config: false,
        default: BUTLER.DEFAULT_CONFIG.enhancedConditions.outputCombat,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.removeDefaultEffects, {
        name: "SETTINGS.EnhancedConditions.RemoveDefaultEffectsN",
        hint: "SETTINGS.EnhancedConditions.RemoveDefaultEffectsH",
        scope: "world",
        type: Boolean,
        config: false,
        default: BUTLER.DEFAULT_CONFIG.enhancedConditions.removeDefaultEffects,
        onChange: s => {
            EnhancedConditions._updateStatusEffects();
        }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.suppressPreventativeSaveReminder, {
        name: "SETTINGS.EnhancedConditions.SuppressPreventativeSaveReminderN",
        hint: "SETTINGS.EnhancedConditions.SuppressPreventativeSaveReminderH",
        scope: "world",
        type: Boolean,
        config: false,
        default: false,
        onChange: s => {}
    });
    
    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.migrationVersion, {
        name:  `${BUTLER.NAME}.SETTINGS.ENHANCED_CONDITIONS.MigrationVersionN`,
        hint: `${BUTLER.NAME}.SETTINGS.ENHANCED_CONDITIONS.MigrationVersionH`,
        scope: "world",
        type: String,
        config: false,
        apiOnly: true,
        default: BUTLER.DEFAULT_CONFIG.enhancedConditions.migrationVersion,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.showSortDirectionDialog, {
        name: `${BUTLER.NAME}.SETTINGS.ENHANCED_CONDITIONS.ShowSortDirectionDialogN`,
        hint: `${BUTLER.NAME}.SETTINGS.ENHANCED_CONDITIONS.ShowSortDirectionDialogH`,
        scope: "world",
        type: Boolean,
        config: false,
        default: true,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultSpecialStatusEffects, {
        name: `${BUTLER.NAME}.SETTINGS.ENHANCED_CONDITIONS.DefaultSpecialStatusEffectsN`,
        hint: `${BUTLER.NAME}.SETTINGS.ENHANCED_CONDITIONS.DefaultSpecialStatusEffectsH`,
        scope: "world",
        type: Object,
        default: {},
        config: false,
        onChange: () => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.specialStatusEffectMapping, {
        name: `${BUTLER.NAME}.SETTINGS.ENHANCED_CONDITIONS.SpecialStatusEffectMappingN`,
        hint: `${BUTLER.NAME}.SETTINGS.ENHANCED_CONDITIONS.SpecialStatusEffectMappingH`,
        scope: "world",
        type: Object,
        default: {},
        config: false,
        onChange: () => {}
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

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.giveXP.modifier, {
        name: "SETTINGS.GiveXP.ModifierN",
        hint: "SETTINGS.GiveXP.ModifierH",
        default: BUTLER.DEFAULT_CONFIG.giveXP.modifier,
        scope: "world",
        type: Number,
        config: false,
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

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.hideNames.hideParts, {
        name: "SETTINGS.HideNames.HidePartsN",
        hint: "SETTINGS.HideNames.HidePartsH",
        scope: "world",
        type: Boolean,
        default: BUTLER.DEFAULT_CONFIG.hideNames.hideNameParts,
        config: false,
        onChange: s => {
            ui.combat.render();
            ui.chat.render();
        }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.hideNames.enableHostile, {
        name: "SETTINGS.HideNames.EnableHostileN",
        hint: "SETTINGS.HideNames.EnableHostileH",
        scope: "world",
        type: Boolean,
        default: BUTLER.DEFAULT_CONFIG.hideNames.enableHostile,
        config: false,
        onChange: s => {
            ui.combat.render();
            ui.chat.render();
        }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.hideNames.enableNeutral, {
        name: "SETTINGS.HideNames.EnableNeutralN",
        hint: "SETTINGS.HideNames.EnableNeutralH",
        scope: "world",
        type: Boolean,
        default: BUTLER.DEFAULT_CONFIG.hideNames.enableNeutral,
        config: false,
        onChange: s => {
            ui.combat.render();
            ui.chat.render();
        }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.hideNames.enableFriendly, {
        name: "SETTINGS.HideNames.EnableFriendlyN",
        hint: "SETTINGS.HideNames.EnableFriendlyH",
        scope: "world",
        type: Boolean,
        default: BUTLER.DEFAULT_CONFIG.hideNames.enableNeutral,
        config: false,
        onChange: s => {
            ui.combat.render();
            ui.chat.render();
        }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.hideNames.hostileNameReplacement, {
        name: "SETTINGS.HideNames.HostileReplacementN",
        hint: "SETTINGS.HideNames.HostileReplacementH",
        scope: "world",
        type: String,
        default: BUTLER.DEFAULT_CONFIG.hideNames.hostileNameReplacement,
        config: false,
        onChange: s => {
            const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.hideNames.enableHostile);

            if (enable) {
                ui.combat.render();
                ui.chat.render();
            }
        }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.hideNames.neutralNameReplacement, {
        name: "SETTINGS.HideNames.NeutralReplacementN",
        hint: "SETTINGS.HideNames.NeutralReplacementH",
        scope: "world",
        type: String,
        default: BUTLER.DEFAULT_CONFIG.hideNames.neutralNameReplacement,
        config: false,
        onChange: s => {
            const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.hideNames.enableNeutral);

            if (enable) {
                ui.combat.render();
                ui.chat.render();
            }
        }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.hideNames.friendlyNameReplacement, {
        name: "SETTINGS.HideNames.FriendlyReplacementN",
        hint: "SETTINGS.HideNames.FriendlyReplacementH",
        scope: "world",
        type: String,
        default: BUTLER.DEFAULT_CONFIG.hideNames.friendlyNameReplacement,
        config: false,
        onChange: s => {
            const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.hideNames.enableFriendly);

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
        config: false,
        onChange: s => {
            ui.chat.render();
        }
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
        config: false,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.panSelect.panPlayers, {
        name: "SETTINGS.PanSelect.PanPlayersN",
        hint: "SETTINGS.PanSelect.PanPlayersH",
        default: Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.panSelect.panPlayers, BUTLER.DEFAULT_CONFIG.panSelect.panPlayers.none),
        scope: "world",
        type: String,
        choices: BUTLER.DEFAULT_CONFIG.panSelect.panPlayers,
        config: false,
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
        config: false,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.panSelect.selectPlayers, {
        name: "SETTINGS.PanSelect.SelectPlayersN",
        hint: "SETTINGS.PanSelect.SelectPlayersH",
        default: BUTLER.DEFAULT_CONFIG.panSelect.selectPlayers,
        scope: "world",
        type: Boolean,
        config: false,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.panSelect.observerDeselect, {
        name: "SETTINGS.PanSelect.ObserverDeselectN",
        hint: "SETTINGS.PanSelect.ObserverDeselectH",
        default: BUTLER.DEFAULT_CONFIG.panSelect.observerDeselect,
        scope: "world",
        type: Boolean,
        config: false,
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
        config: false,
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
        config: false,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.tokenUtility.hideAutoRoll, {
        name: "SETTINGS.TokenUtility.HideAutoRollN",
        hint: "SETTINGS.TokenUtility.HideAutoRollH",
        default: BUTLER.DEFAULT_CONFIG.tokenUtility.hideAutoRoll,
        scope: "world",
        type: Boolean,
        config: false,
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
            TokenUtility.patchCore();
            canvas.draw();
        }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.tokenUtility.mightySummoner, {
        name: "SETTINGS.MightySummoner.EnableN",
        hint: "SETTINGS.MightySummoner.EnableH",
        default: BUTLER.DEFAULT_CONFIG.mightySummoner.enable,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.tokenUtility.mightySummonerFeat, {
        name: "SETTINGS.MightySummoner.FeatNameN",
        hint: "SETTINGS.MightySummoner.FeatNameH",
        default: BUTLER.DEFAULT_CONFIG.mightySummoner.featName,
        scope: "world",
        type: String,
        config: false,
        onChange: s => {}
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.tokenUtility.mightySummonerPromptGm, {
        name: `${BUTLER.NAME}.SETTINGS.MIGHTY_SUMMONER.PromptGMN`,
        hint: `${BUTLER.NAME}.SETTINGS.MIGHTY_SUMMONER.PromptGMH`,
        default: BUTLER.DEFAULT_CONFIG.mightySummoner.promptGm,
        scope: "world",
        type: Boolean,
        config: false,
        onChange: s => {}
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