import * as BUTLER from "./butler.js";

export const SETTINGS_METADATA = {
    enhancedConditions: {
        name: this.SETTINGS_DESCRIPTORS.EnhancedConditionsN,
        hint: this.SETTINGS_DESCRIPTORS.EnhancedConditionsH,
        scope: "world",
        type: Boolean,
        default: false,
        config: true,
        onChange: s => {
            this.settings.enhancedConditions = s;
            this._toggleSidebarButtonDisplay(s);
            this._updateStatusIcons();
        }
    },

    system: {
        name: this.SETTINGS_DESCRIPTORS.SystemN,
        hint: this.SETTINGS_DESCRIPTORS.SystemH,
        scope: "world",
        type: String,
        default: (BUTLER.DEFAULT_GAME_SYSTEMS[game.system.id] != null) ? BUTLER.DEFAULT_GAME_SYSTEMS[game.system.id].id : BUTLER.DEFAULT_GAME_SYSTEMS.other.id,
        choices: this.systemChoices,
        config: true,
        onChange: s => {
            this.settings.system = s;
        }
    },

    maps: {
        name: this.SETTINGS_DESCRIPTORS.MapsN,
        hint: this.SETTINGS_DESCRIPTORS.MapsH,
        scope: "world",
        type: Object,
        default: this.DEFAULT_MAPS,
        onChange: s => {
            this.settings.maps = s;
            this._updateStatusIcons(s[this.settings.system]);
        }
    },

    outputChat: {
        name: this.SETTINGS_DESCRIPTORS.OutputChatN,
        hint: this.SETTINGS_DESCRIPTORS.OutputChatH,
        scope: "world",
        type: Boolean,
        config: false,
        default: this.DEFAULT_CONFIG.outputChat,
        onChange: s => {
            this.settings.output = s;
        }
    },

    removeDefaultEffects: {
        name: this.SETTINGS_DESCRIPTORS.RemoveDefaultEffectsN,
        hint: this.SETTINGS_DESCRIPTORS.RemoveDefaultEffectsH,
        scope: "world",
        type: Boolean,
        config: true,
        default: false,
        onChange: s => {
            this.settings.removeDefaultEffects = s;
            this._updateStatusIcons();
        }
    },

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
    },
    panOnNextTurn: {
        name: this.SETTINGS_DESCRIPTORS.PanOnNextTurnN,
        hint: this.SETTINGS_DESCRIPTORS.PanOnNextTurnH,
        default: this.DEFAULT_CONFIG.panOnNextTurn,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {
            this.settings.panOnNextTurn = s;
        }
    },
    panGM: {
        name: this.SETTINGS_DESCRIPTORS.PanGMN,
        hint: this.SETTINGS_DESCRIPTORS.PanGMH,
        default: CUBSidekick.getKeyByValue(this.DEFAULT_CONFIG.panGM, this.DEFAULT_CONFIG.panGM.none),
        scope: "world",
        type: String,
        choices: this.DEFAULT_CONFIG.panGM,
        config: true,
        onChange: s => {
            this.settings.panGM = s;
        }
    },
    panPlayers: {
        name: this.SETTINGS_DESCRIPTORS.PanPlayersN,
        hint: this.SETTINGS_DESCRIPTORS.PanPlayersH,
        default: CUBSidekick.getKeyByValue(this.DEFAULT_CONFIG.panPlayers, this.DEFAULT_CONFIG.panPlayers.none),
        scope: "world",
        type: String,
        choices: this.DEFAULT_CONFIG.panPlayers,
        config: true,
        onChange: s => {
            this.settings.panPlayers = s;
        }
    },
    selectOnNextTurn: {
        name: this.SETTINGS_DESCRIPTORS.SelectOnNextTurnN,
        hint: this.SETTINGS_DESCRIPTORS.SelectOnNextTurnH,
        default: this.DEFAULT_CONFIG.selectOnNextTurn,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {
            this.settings.selectOnNextTurn = s;
        }
    },
    selectGM: {
        name: this.SETTINGS_DESCRIPTORS.SelectGMN,
        hint: this.SETTINGS_DESCRIPTORS.SelectGMH,
        default: CUBSidekick.getKeyByValue(this.DEFAULT_CONFIG.panGM, this.DEFAULT_CONFIG.panGM.none),
        scope: "world",
        type: String,
        choices: this.DEFAULT_CONFIG.panGM, //uses same options as Pan GM
        config: true,
        onChange: s => {
            this.settings.selectGM = s;
        }
    },
    selectPlayers: {
        name: this.SETTINGS_DESCRIPTORS.SelectPlayersN,
        hint: this.SETTINGS_DESCRIPTORS.SelectPlayersH,
        default: this.DEFAULT_CONFIG.selectPlayers,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {
            this.settings.selectPlayers = s;
        }
    },
    observerDeselect: {
        name: this.SETTINGS_DESCRIPTORS.ObserverDeselectN,
        hint: this.SETTINGS_DESCRIPTORS.ObserverDeselectH,
        default: this.DEFAULT_CONFIG.observerDeselect,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {
            this.settings.observerDeselect = s;
        }
    },
    tempCombatants: {
        name: this.SETTINGS_DESCRIPTORS.TempCombatantsN,
        hint: this.SETTINGS_DESCRIPTORS.TempCombatantsH,
        default: this.DEFAULT_CONFIG.tempCombatants,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {
            this.settings.tempCombatants = s;
            ui.combat.render();
        }
    },
    trackerConfigSettings: {
        name: this.SETTINGS_DESCRIPTORS.TrackerConfigSettingsN,
        hint: this.SETTINGS_DESCRIPTORS.TrackerConfigSettingsH,
        default: {},
        scope: "world",
        type: Object,
        config: false,
        onChange: s => {
            this.settings.trackerConfigSettings = s;
            ui.combat.render();
        }
    },
    xpModule: {
        name: this.SETTINGS_DESCRIPTORS.XPModuleN,
        hint: this.SETTINGS_DESCRIPTORS.XPModuleH,
        default: this.DEFAULT_CONFIG.xpModule,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {
            this.settings.xpModule = s;
        }
    },
    concentrating: {
        name: this.SETTINGS_DESCRIPTORS.ConcentratingN,
        hint: this.SETTINGS_DESCRIPTORS.ConcentratingH,
        default: this.DEFAULT_CONFIG.concentrating,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {
            this.settings.concentrating = s;
        }
    },
    concentratingIcon: {
        name: this.SETTINGS_DESCRIPTORS.ConcentratingIconN,
        hint: this.SETTINGS_DESCRIPTORS.ConcentratingIconH,
        default: this.DEFAULT_CONFIG.concentratingIcon,
        scope: "world",
        type: String,
        config: true,
        onChange: s => {
            this.settings.concentratingIcon = s;
        }
    },
    healthAttribute: {
        name: this.SETTINGS_DESCRIPTORS.HealthAttributeN,
        hint: this.SETTINGS_DESCRIPTORS.HealthAttributeH,
        default: (CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id] != null) ? CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id].healthAttribute : CUBButler.DEFAULT_GAME_SYSTEMS.other.healthAttribute,
        scope: "world",
        type: String,
        config: true,
        onChange: s => {
            this.settings.healthAttribute = s;
        }
    },
    displayChat: {
        name: this.SETTINGS_DESCRIPTORS.ConcentratingChatMessageN,
        hint: this.SETTINGS_DESCRIPTORS.ConcentratingChatMessageH,
        default: (CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id] != null) ? CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id].healthAttribute : CUBButler.DEFAULT_GAME_SYSTEMS.other.healthAttribute,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {
            this.settings.displayChat = s;
        }
    },
    rollRequest: {
        name: this.SETTINGS_DESCRIPTORS.ConcentratingRollRequestN,
        hint: this.SETTINGS_DESCRIPTORS.ConcentratingRollRequestH,
        default: (CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id] != null) ? CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id].healthAttribute : CUBButler.DEFAULT_GAME_SYSTEMS.other.healthAttribute,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {
            this.settings.rollRequest = s;
        }
    },
    autoConcentrate: {
        name: this.SETTINGS_DESCRIPTORS.ConcentratingAutoStatusN,
        hint: this.SETTINGS_DESCRIPTORS.ConcentratingAutoStatusH,
        default: false,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {
            this.settings.autoConcentrate = s;
        }
    },
    notifyDoubleConcentration: {
        name: this.SETTINGS_DESCRIPTORS.ConcentratingNotifyDoubleN,
        hint: this.SETTINGS_DESCRIPTORS.ConcentratingNotifyDoubleH,
        default: "None",
        scope: "world",
        type: String,
        choices: ["None", "GM Only", "Everyone"],
        config: true,
        onChange: s => {
            this.settings.notifyDoubleConcentration = s;
        }
    },
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
    },
    injured: {
        name: this.SETTINGS_DESCRIPTORS.InjuredN,
        hint: this.SETTINGS_DESCRIPTORS.InjuredH,
        default: this.DEFAULT_CONFIG.injured,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {
            this.settings.injured = s;
        }
    },
    injuredIcon: {
        name: this.SETTINGS_DESCRIPTORS.InjuredIconN,
        hint: this.SETTINGS_DESCRIPTORS.InjuredIconH,
        default: this.DEFAULT_CONFIG.injuredIcon,
        scope: "world",
        type: String,
        config: true,
        onChange: s => {
            this.settings.injuredIcon = s;
        }
    },
    threshold: {
        name: this.SETTINGS_DESCRIPTORS.ThresholdN,
        hint: this.SETTINGS_DESCRIPTORS.ThresholdH,
        default: this.DEFAULT_CONFIG.threshold,
        scope: "world",
        type: Number,
        config: true,
        onChange: s => {
            this.settings.threshold = s;
        }
    },
    dead: {
        name: this.SETTINGS_DESCRIPTORS.DeadN,
        hint: this.SETTINGS_DESCRIPTORS.DeadH,
        default: this.DEFAULT_CONFIG.dead,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {
            this.settings.dead = s;
        }
    },
    deadIcon: {
        name: this.SETTINGS_DESCRIPTORS.DeadIconN,
        hint: this.SETTINGS_DESCRIPTORS.DeadIconH,
        default: this.DEFAULT_CONFIG.deadIcon,
        scope: "world",
        type: String,
        config: true,
        onChange: s => {
            this.settings.deadIcon = s;
        }
    },
    healthAttribute: {
        name: this.SETTINGS_DESCRIPTORS.HealthAttributeN,
        hint: this.SETTINGS_DESCRIPTORS.HealthAttributeH,
        default: (CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id] != null) ? CUBButler.DEFAULT_GAME_SYSTEMS[game.system.id].healthAttribute : CUBButler.DEFAULT_GAME_SYSTEMS.other.healthAttribute,
        scope: "world",
        type: String,
        config: true,
        onChange: s => {
            this.settings.healthAttribute = s;
        }
    },
    combatTrackDead: {
        name: this.SETTINGS_DESCRIPTORS.CombatTrackDeadN,
        hint: this.SETTINGS_DESCRIPTORS.CombatTrackDeadH,
        default: this.DEFAULT_CONFIG.combatTrackDead,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {
            this.settings.combatTrackDead = s;
        }
    },
    unconscious: {
        name: this.SETTINGS_DESCRIPTORS.UnconsciousN,
        hint: this.SETTINGS_DESCRIPTORS.UnconsciousH,
        default: this.DEFAULT_CONFIG.unconscious,
        scope: "world",
        type: Boolean,
        config: true,
        onChange: s => {
            this.settings.unconscious = s;
        }
    },
    unconsciousActorType: {
        name: this.SETTINGS_DESCRIPTORS.UnconsciousActorTypeN,
        hint: this.SETTINGS_DESCRIPTORS.UnconsciousActorTypeH,
        default: this.DEFAULT_CONFIG.unconsciousActorType,
        scope: "world",
        type: String,
        choices: game.system.entityTypes.Actor,
        config: true,
        onChange: s => {
            this.settings.unconsciousActorType = s;
        }
    },
    unconsciousIcon: {
        name: this.SETTINGS_DESCRIPTORS.UnconsciousIconN,
        hint: this.SETTINGS_DESCRIPTORS.UnconsciousIconH,
        default: this.DEFAULT_CONFIG.unconsciousIcon,
        scope: "world",
        type: String,
        config: true,
        onChange: s => {
            this.settings.unconsciousIcon = s;
        }
    },
    enableReroll: {
        name: this.SETTINGS_DESCRIPTORS.RerollN,
        hint: this.SETTINGS_DESCRIPTORS.RerollH,
        scope: "world",
        type: Boolean,
        default: this.DEFAULT_CONFIG.reroll,
        config: true,
        onChange: s => {
            this.settings.reroll = s;
        }
    },
    includeTempCombatants: {
        name: this.SETTINGS_DESCRIPTORS.RerollTempCombatantsN,
        hint: this.SETTINGS_DESCRIPTORS.RerollTempCombatantsH,
        scope: "world",
        type: Boolean,
        default: this.DEFAULT_CONFIG.rerollTempCombatants,
        config: true,
        onChange: s => {
            this.settings.rerollTempCombatants = s;
        }
    }

    /* future features
    createEntries: {
        name: this.SETTINGS_DESCRIPTORS.CreateEntriesN,
        hint: this.SETTINGS_DESCRIPTORS.CreateEntriesH,
        scope: "world",
        type: Boolean,
        default: this.DEFAULT_CONFIG.createEntries,
        config: true,
        onChange: s => {
            this.settings.createEntries = s;
        }
    },

    folderType: {
        name: this.SETTINGS_DESCRIPTORS.FolderTypeN,
        hint: this.SETTINGS_DESCRIPTORS.FolderTypeH,
        scope: "world",
        type: String,
        default: this.DEFAULT_CONFIG.folderTypes.journal,
        choices: this.DEFAULT_CONFIG.folderTypes,
        config: true,
        onChange: s => {
            this.settings.folderType = s;
        }

    },

    compendium: {
        name: this.SETTINGS_DESCRIPTORS.CompendiumN,
        hint: this.SETTINGS_DESCRIPTORS.CompendiumH,
        scope: "world",
        type: String,
        default: game.packs.find(p => p.metadata.name == "conditions" + game.system.id),
        choices: this.compendiumChoices,
        config: true,
        onChange: s => {
            this.settings.compendium = s;
        }
    }
    */
};