/* -------------------------------------------- */
/*                    Imports                   */
/* -------------------------------------------- */
import { cub } from "../combat-utility-belt.js"
import * as BUTLER from "./butler.js";
import { Sidekick } from "./sidekick.js";
import { registerSettings } from "./settings.js";

/* ------------------ Gadgets ----------------- */

import { Concentrator } from "./concentrator.js";
import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";
import { GiveXP } from "./give-xp.js";
import { HideNPCNames } from "./hide-npc-names.js";
import { PanSelect } from "./pan-select.js";
import { RerollInitiative } from "./reroll-initiative.js";
import { TemporaryCombatants } from "./temporary-combatants/temporary-combatants.js"

/* ------------------- Utils ------------------ */

import { TokenUtility } from "./utils/token.js";
import { ActorUtility } from "./utils/actor.js";
import { TrackerUtility } from "./utils/combat-tracker.js";
import { DraggableList } from "./utils/draggable-list.js";
import { ConditionLab } from "./enhanced-conditions/condition-lab.js";
import { Triggler } from "./triggler/triggler.js";

/* -------------------------------------------- */
/*                     Class                    */
/* -------------------------------------------- */

/**
 * Initiates module classes (and shines a light on the dark night sky)
 */
export class Signal {
    /* -------------------------------------------- */
    /*                     Hooks                    */
    /* -------------------------------------------- */

    /**
     * Init Hooks
     */
    static hookOnInit() {
        Hooks.on("init", () => {
            // Assign the namespace Object if it already exists or instantiate it as an object if not
            game.cub = game.cub || {};

            // Execute housekeeping
            Sidekick.handlebarsHelpers();
            Sidekick.jQueryHelpers();
            registerSettings();

            // Instantiate gadget classes
            game.cub.concentrator = new Concentrator();
            game.cub.enhancedConditions = new EnhancedConditions();
            game.cub.giveXP = new GiveXP();
            game.cub.hideNames = new HideNPCNames();
            game.cub.panSelect = new PanSelect();
            game.cub.rerollInitiative = new RerollInitiative();
            game.cub.tempCombatants = new TemporaryCombatants();

            // Instantiate utility classes
            game.cub.actorUtility = new ActorUtility();
            game.cub.tokenUtility = new TokenUtility();
            game.cub.trackerUtility = new TrackerUtility();
            
            // Handle any monkeypatching
            const effectSize = Sidekick.getSetting(BUTLER.SETTING_KEYS.tokenUtility.effectSize);
            if (effectSize) {
                Token.prototype.drawEffects = TokenUtility._patchDrawEffects;
            }
        });
    }

    /**
     * Canvas Init Hook
     */
    static hookOnCanvasInit() {
        Hooks.on("canvasInit", () => {
           
        });
    }

    /**
     * Ready Hook
     */
    static hookOnReady() {
        Hooks.on("ready", () => {
            EnhancedConditions._onReady();            
        });
    }

    static hookOnRenderSettings() {
        Hooks.on("renderSettings", (app, html) => {
            Sidekick.createCUBDiv(html);
            EnhancedConditions._createLabButton(html);
            EnhancedConditions._toggleLabButtonVisibility(Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable));
            Triggler._createTrigglerButton(html);
        });
    }

    static hookOnRenderTokenHUD() {
        Hooks.on("renderTokenHUD", (app, html, data) => {
            EnhancedConditions._hookOnRenderTokenHUD(app, html, data);
        });
    }

    static hookOnRenderActorSheet() {
        Hooks.on("renderActorSheet", (app, html, data) => {
            ActorUtility._onRenderActorSheet(app, html, data);
        });
    }

    static hookOnRenderImagePopout() {
        Hooks.on("renderImagePopout", (app, html, data) => {
            HideNPCNames._onRenderImagePopout(app, html, data);
        });
    }

    static hookOnCreateToken() {
        Hooks.on("createToken", (scene, sceneId, tokenData, options, userId) => {
            TokenUtility._hookOnCreateToken(scene, sceneId, tokenData, options, userId);
        });
    }

    static hookOnPreUpdateToken() {
        Hooks.on("preUpdateToken", (scene, sceneId, actorData, currentData) => {
            Concentrator._hookOnPreUpdateToken(scene, sceneId, actorData, currentData);
            //game.cub.enhancedConditions._hookOnPreUpdateToken(scene, sceneId, actorData, currentData);
        });
    }

    static hookOnUpdateToken() {
        Hooks.on("updateToken", (scene, sceneId, update, options, userId) => {
            EnhancedConditions._hookOnUpdateToken(scene, sceneId, update, options, userId);
            Concentrator._hookOnUpdateToken(scene, sceneId, update, options, userId);
            Triggler._onUpdateToken(scene, sceneId, update, options, userId);
        });
    }

    static hookOnPreUpdateActor() {
        Hooks.on("preUpdateActor", (actor, update, options) => {
            Concentrator._hookOnPreUpdateActor(actor, update, options);
        });
    }

    static hookOnUpdateActor() {
        Hooks.on("updateActor", (actor, update, options, userId) => {
            // Workaround for actor array returned in hook for non triggering clients
            if (actor instanceof Collection) {
                actor = actor.entities.find(a => a._id === update._id);
            }
            Concentrator._hookOnUpdateActor(actor, update, options, userId);
        });
    }

    static hookOnPreUpdateCombat() {
        Hooks.on("preUpdateCombat", (combat, update, options) => {
            
        });
    }

    static hookOnUpdateCombat() {
        Hooks.on("updateCombat", (combat, update, options, userId) => {
            RerollInitiative._onUpdateCombat(combat, update, options, userId);
            TrackerUtility._hookOnUpdateCombat(combat, update);
        });
    }

    static hookOnDeleteCombat() {
        Hooks.on("deleteCombat", (combat, combatId, options, userId) => {
            TrackerUtility._hookOnDeleteCombat(combat, combatId, options, userId);
        });
    }

    static hookOnDeleteCombatant() {
        Hooks.on("preDeleteCombatant", (combat, combatId, combatantId, options) => {
            TrackerUtility._hookOnDeleteCombatant(combat, combatId, combatantId, options);
        });
    }

    static hookOnRenderCombatTracker() {
        Hooks.on("renderCombatTracker", (app, html, data) => {
            HideNPCNames._hookOnRenderCombatTracker(app, html, data);
            TrackerUtility._onRenderCombatTracker(app, html, data);
            TemporaryCombatants._onRenderCombatTracker(app, html, data);
        });
    }

    static hookOnRenderCombatTrackerConfig() {
        Hooks.on("renderCombatTrackerConfig", (app, html, data) => {
            // Possible future feature
            //game.cub.combatTracker._onRenderCombatTrackerConfig(app, html, data);
        });
    }

    static hookOnRenderChatMessage() {
        Hooks.on("renderChatMessage", (app, html, data) => {
            HideNPCNames._hookOnRenderChatMessage(app, html, data);
            Concentrator._onRenderChatMessage(app, html, data);
            EnhancedConditions._onRenderChatMessage(app, html, data);
        });
    }

    static hookOnRenderDialog() {
        Hooks.on("renderDialog", (app, html, data) => {
            if (app.title === "End Combat Encounter?") {
                GiveXP._onRenderDialog(app, html, data);
            }
        });
    }

    static hookOnRenderConditionLab() {
        Hooks.on("renderConditionLab", (app, html, data) => {
            //const mappingList = html.find("ol[class='condition-map-list']");
            const mappingList = document.getElementsByClassName("condition-map-list")[0];
            if (mappingList) {
                new DraggableList(mappingList, "li", {
                    boundary: 0, 
                    rowHeight: 60, 
                    onDragStart: ConditionLab.prototype.onDragStart, 
                    onDrop: ConditionLab.prototype.onDrop
                });
            }
        });
    }

    static hookOnRenderMacroConfig () {
        Hooks.on("renderMacroConfig", (app, html, data) => {
            Triggler._onRenderMacroConfig(app, html, data);
        });
    }

    static lightUp() {
        Signal.hookOnInit();
        Signal.hookOnCanvasInit();
        Signal.hookOnReady();
        Signal.hookOnRenderSettings();
        Signal.hookOnRenderTokenHUD();
        Signal.hookOnRenderActorSheet();
        Signal.hookOnRenderImagePopout();
        Signal.hookOnCreateToken();
        Signal.hookOnPreUpdateToken();
        Signal.hookOnUpdateToken();
        Signal.hookOnPreUpdateActor();
        Signal.hookOnUpdateActor();
        Signal.hookOnPreUpdateCombat();
        Signal.hookOnUpdateCombat();
        Signal.hookOnDeleteCombat();
        Signal.hookOnDeleteCombatant();
        Signal.hookOnRenderCombatTracker();
        Signal.hookOnRenderCombatTrackerConfig();
        Signal.hookOnRenderChatMessage();
        Signal.hookOnRenderDialog();
        Signal.hookOnRenderConditionLab();
        Signal.hookOnRenderMacroConfig();
    }
}