/* -------------------------------------------- */
/*                    Imports                   */
/* -------------------------------------------- */
import * as BUTLER from "./butler.js";
import { Sidekick } from "./sidekick.js";
import { registerSettings } from "./settings.js";
import { createCUBPuterButton, CUBPuter } from "./cub-puter.js";

/* ------------------ Gadgets ----------------- */

import { Concentrator } from "./concentrator.js";
import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";
import { GiveXP } from "./give-xp.js";
import { HideNPCNames } from "./hide-names/hide-npc-names.js";
import { PanSelect } from "./pan-select.js";
import { RerollInitiative } from "./reroll-initiative.js";
import { TemporaryCombatants } from "./temporary-combatants/temporary-combatants.js"

/* ------------------- Utils ------------------ */

import { TokenUtility } from "./utils/token.js";
import { ActorUtility } from "./utils/actor.js";
import { TrackerUtility } from "./utils/combat-tracker.js";
import { ConditionLab } from "./enhanced-conditions/condition-lab.js";
import { Triggler } from "./triggler/triggler.js";

/* -------------------------------------------- */
/*                     Class                    */
/* -------------------------------------------- */

/**
 * Initiates module classes (and shines a light on the dark night sky)
 */
export class Signal {
    /**
     * Registers hooks
     */
    static lightUp() {

        /* -------------------------------------------- */
        /*                    System                    */
        /* -------------------------------------------- */

        /* ------------------- Init/Ready ------------------- */

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
                TokenUtility.patchCore();
            }

            // Expose API methods
            game.cub.getCondition = EnhancedConditions.getCondition;
            game.cub.getConditions = EnhancedConditions.getConditions;
            game.cub.getConditionEffects = EnhancedConditions.getConditionEffects;
            game.cub.hasCondition = EnhancedConditions.hasCondition;
            game.cub.addCondition = EnhancedConditions.addCondition;
            game.cub.removeCondition = EnhancedConditions.removeCondition;
            game.cub.removeAllConditions = EnhancedConditions.removeAllConditions;

        });

        Hooks.on("canvasInit", () => {
           
        });

        Hooks.on("ready", () => {
            EnhancedConditions._onReady();            
        });

        /* -------------------------------------------- */
        /*                    Entity                    */
        /* -------------------------------------------- */

        /* ------------------- Actor ------------------ */

        Hooks.on("preUpdateActor", (actor, update, options, userId) => {
            Concentrator._onPreUpdateActor(actor, update, options, userId);
        });

        Hooks.on("updateActor", (actor, update, options, userId) => {
            // Workaround for actor array returned in hook for non triggering clients
            if (actor instanceof Collection) {
                actor = actor.entities.find(a => a._id === update._id);
            }
            Concentrator._onUpdateActor(actor, update, options, userId);
            Triggler._onUpdateActor(actor, update, options, userId);
        });

        Hooks.on("createActiveEffect", (actor, createData, options, userId) => {
            EnhancedConditions._onCreateActiveEffect(actor, createData, options, userId);
        });

        Hooks.on("deleteActiveEffect", (actor, deleteData, options, userId) => {
            EnhancedConditions._onDeleteActiveEffect(actor, deleteData, options, userId);
        });

        /* ------------------- Token ------------------ */

        Hooks.on("preCreateToken", (scene, tokenData, options, userId) => {
            return TokenUtility._onPreCreateToken(scene, tokenData, options, userId);
        });

        Hooks.on("preUpdateToken", (scene, tokenData, updateData, options, userId) => {
            Concentrator._onPreUpdateToken(scene, tokenData, updateData, options, userId);
            EnhancedConditions._onPreUpdateToken(scene, tokenData, updateData, options, userId);
        });

        Hooks.on("updateToken", (scene, token, updateData, options, userId) => {
            EnhancedConditions._onUpdateToken(scene, token, updateData, options, userId);
            Concentrator._onUpdateToken(scene, token, updateData, options, userId);
            Triggler._onUpdateToken(scene, token, updateData, options, userId);
        });

        /* ------------------ Combat ------------------ */

        Hooks.on("preUpdateCombat", (combat, update, options) => {
            
        });

        Hooks.on("updateCombat", (combat, update, options, userId) => {
            RerollInitiative._onUpdateCombat(combat, update, options, userId);
            EnhancedConditions._onUpdateCombat(combat, update, options, userId);
            TrackerUtility._hookOnUpdateCombat(combat, update);
        });

        Hooks.on("deleteCombat", (combat, options, userId) => {
            TrackerUtility._onDeleteCombat(combat, options, userId);
        });
        
        Hooks.on("preDeleteCombatant", (combat, combatant, options, userId) => {
            TrackerUtility._onDeleteCombatant(combat, combatant, options, userId);
        });

        /* -------------------------------------------- */
        /*                    Render                    */
        /* -------------------------------------------- */

        /* ------------------- Misc ------------------- */

        Hooks.on("renderSettings", (app, html) => {
            Sidekick.createCUBDiv(html);
            createCUBPuterButton(html);
            EnhancedConditions._createLabButton(html);
            EnhancedConditions._toggleLabButtonVisibility(Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable));
            Triggler._createTrigglerButton(html);
        });

        Hooks.on("renderImagePopout", (app, html, data) => {
            HideNPCNames._onRenderImagePopout(app, html, data);
        });

        Hooks.on("renderMacroConfig", (app, html, data) => {
            Triggler._onRenderMacroConfig(app, html, data);
        });

        /* ------------------- Actor ------------------ */


        Hooks.on("renderActorSheet", (app, html, data) => {
            ActorUtility._onRenderActorSheet(app, html, data);
            HideNPCNames._onRenderActorSheet(app, html, data);
        });

        /* ------------------- Chat ------------------- */

        Hooks.on("renderChatMessage", (app, html, data) => {
            HideNPCNames._hookOnRenderChatMessage(app, html, data);
            Concentrator._onRenderChatMessage(app, html, data);
            EnhancedConditions._onRenderChatMessage(app, html, data);
        });
        
        Hooks.on("renderDialog", (app, html, data) => {
            if (app.title === "End Combat Encounter?") {
                GiveXP._onRenderDialog(app, html, data);
            }
        });
        
        /* -------------- Combat Tracker -------------- */

        Hooks.on("renderCombatTracker", (app, html, data) => {
            HideNPCNames._hookOnRenderCombatTracker(app, html, data);
            TrackerUtility._onRenderCombatTracker(app, html, data);
            TemporaryCombatants._onRenderCombatTracker(app, html, data);
        });
        
        Hooks.on("renderCombatTrackerConfig", (app, html, data) => {
            // Possible future feature
            //game.cub.combatTracker._onRenderCombatTrackerConfig(app, html, data);
        });

        /* ---------------- Custom Apps --------------- */

        Hooks.on("renderCUBPuter", (app, html, data) => {
            CUBPuter._onRender(app, html, data);
        });

        Hooks.on("renderCombatCarousel", (app, html, data) => {
            HideNPCNames._onRenderCombatCarousel(app, html, data);
        });

        Hooks.on("vinoPrepareChatDisplayData", (chatDisplayData) => {
            HideNPCNames._hookOnVinoPrepareChatDisplayData(chatDisplayData);
        });
    }
}