/* -------------------------------------------- */
/*                    Imports                   */
/* -------------------------------------------- */

import { cub } from "../combat-utility-belt.js";
import * as BUTLER from "./butler.js";
import { SETTINGS_METADATA } from "./settings.js";

/* ------------------ Gadgets ----------------- */

import { Concentrator } from "concentrator.js";
import { EnhancedConditions } from "enhanced-conditions/enhanced-conditions.js";
import { HideNPCNames } from "hide-npc-names.js";
import { InjuredAndDead} from "injured-dead.js";
import { RerollInitiative } from "reroll-initiative.js";
import { PanSelect } from "pan-select.js";

/* ------------------- Utils ------------------ */

import { Sidekick } from "sidekick.js"
import { TokenUtility } from "./utils/token.js";
import { ActorUtility } from "./utils/actor.js";
import { TrackerUtility } from "./utils/combat-tracker.js";

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
            // Instantiate gadget classes
            cub.concentrator = new Concentrator();
            cub.enhancedConditions = new EnhancedConditions();
            cub.hideNPCNames = new HideNPCNames();
            cub.injuredAndDead = new InjuredAndDead();
            cub.rerollInitiative = new RerollInitiative();

            // Instantiate utility classes
            cub.actorUtility = new ActorUtility();
            cub.tokenUtility = new TokenUtility();
            cub.trackerUtility = new TrackerUtility();
            
            
            
            

            Sidekick.handlebarsHelpers();
            Sidekick.jQueryHelpers();
            Sidekick.registerAllSettings(SETTINGS_METADATA);

            if (cub.tokenUtility.settings.tokenEffectSize) {
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
            if (cub.trackerUtility.settings.xpModule) {
                Combat.prototype.endCombat = CombatTracker.prototype.endCombat;
            }
        });
    }

    static hookOnRenderSettings() {
        Hooks.on("renderSettings", (app, html) => {
            EnhancedConditions._createSidebarButton(html);
            cub.enhancedConditions._toggleSidebarButtonDisplay(cub.enhancedConditions.settings.enhancedConditions);
        });
    }

    static hookOnRenderTokenHUD() {
        Hooks.on("renderTokenHUD", (app, html, data) => {
            cub.enhancedConditions._hookOnRenderTokenHUD(app, html, data);
        });
    }

    static hookOnRenderActorSheet() {
        Hooks.on("renderActorSheet", (app, html, data) => {
            cub.actorUtility._onRenderActorSheet(app, html, data);
        });
    }

    static hookOnRenderImagePopout() {
        Hooks.on("renderImagePopout", (app, html, data) => {
            cub.hideNPCNames._onRenderImagePopout(app, html, data);
        });
    }

    static hookOnCreateToken() {
        Hooks.on("createToken", (scene, sceneId, tokenData, options, userId) => {
            cub.tokenUtility._hookOnCreateToken(scene, sceneId, tokenData);
        });
    }

    static hookOnPreUpdateToken() {
        Hooks.on("preUpdateToken", (scene, sceneId, actorData, currentData) => {
            cub.concentrator._hookOnPreUpdateToken(scene, sceneId, actorData, currentData);
            //cub.enhancedConditions._hookOnPreUpdateToken(scene, sceneId, actorData, currentData);
        });
    }

    static hookOnUpdateToken() {
        Hooks.on("updateToken", (scene, sceneID, update, options, userId) => {
            cub.enhancedConditions._hookOnUpdateToken(scene, sceneID, update, options, userId);
            cub.injuredAndDead._hookOnUpdateToken(scene, sceneID, update, options, userId);
            cub.concentrator._hookOnUpdateToken(scene, sceneID, update, options, userId);
        });
    }

    static hookOnPreUpdateActor() {
        Hooks.on("preUpdateActor", (actor, update, options) => {
            cub.concentrator._hookOnPreUpdateActor(actor, update, options);
        });
    }

    static hookOnUpdateActor() {
        Hooks.on("updateActor", (actor, update, options) => {
            // Workaround for actor array returned in hook for non triggering clients
            if (actor instanceof Collection) {
                actor = actor.entities.find(a => a._id === update._id);
            }
            cub.concentrator._hookOnUpdateActor(actor, update, options);
            cub.injuredAndDead._hookOnUpdateActor(actor, update);
        });
    }

    static hookOnPreUpdateCombat() {
        Hooks.on("preUpdateCombat", (combat, update, options) => {
            
        });
    }

    static hookOnUpdateCombat() {
        Hooks.on("updateCombat", (combat, update, options, userId) => {
            cub.rerollInitiative._onUpdateCombat(combat, update, options, userId);
            cub.combatTracker._hookOnUpdateCombat(combat, update);
        });
    }

    static hookOnDeleteCombat() {
        Hooks.on("deleteCombat", (combat, combatId, options, userId) => {
            cub.combatTracker._hookOnDeleteCombat(combat, combatId, options, userId);
        });
    }

    static hookOnDeleteCombatant() {
        Hooks.on("preDeleteCombatant", (combat, combatId, combatantId, options) => {
            cub.combatTracker._hookOnDeleteCombatant(combat, combatId, combatantId, options);
        });
    }

    static hookOnRenderCombatTracker() {
        Hooks.on("renderCombatTracker", (app, html, data) => {
            cub.hideNPCNames._hookOnRenderCombatTracker(app, html, data);
            cub.combatTracker._onRenderCombatTracker(app, html, data);
        });
    }

    static hookOnRenderCombatTrackerConfig() {
        Hooks.on("renderCombatTrackerConfig", (app, html, data) => {
            // Possible future feature
            //cub.combatTracker._onRenderCombatTrackerConfig(app, html, data);
        });
    }

    static hookOnRenderChatMessage() {
        Hooks.on("renderChatMessage", (message, html, data) => {
            cub.hideNPCNames._hookOnRenderChatMessage(message, html, data);
            cub.concentrator._onRenderChatMessage(message, html, data);
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
    }
}