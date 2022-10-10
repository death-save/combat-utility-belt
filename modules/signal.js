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
import MigrationHelper from "./utils/migration.js";

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
            game.cub = game.cub ?? {};
            ui.cub = ui.cub ?? {};

            // Execute housekeeping
            Sidekick.handlebarsHelpers();
            Sidekick.jQueryHelpers();
            Sidekick.loadTemplates();
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
            game.cub.applyCondition = EnhancedConditions.applyCondition;
            game.cub.addCondition = EnhancedConditions.addCondition;
            game.cub.removeCondition = EnhancedConditions.removeCondition;
            game.cub.removeAllConditions = EnhancedConditions.removeAllConditions;

            game.cub.hideNames.getReplacementName = HideNPCNames.getReplacementName;
            game.cub.hideNames.shouldReplaceName = HideNPCNames.shouldReplaceName;

        });

        Hooks.on("canvasInit", () => {
           
        });

        Hooks.on("ready", () => {
            game.socket.on(`module.${BUTLER.NAME}`, Signal._onSocket);
            EnhancedConditions._onReady();
            Concentrator._onReady();
            MigrationHelper._onReady();          
        });

        /* -------------------------------------------- */
        /*                    Entity                    */
        /* -------------------------------------------- */

        /* ------------------- Actor ------------------ */

        Hooks.on("preUpdateActor", (actor, updateData, options, userId) => {
            Concentrator._onPreUpdateActor(actor, updateData, options, userId);
        });

        Hooks.on("updateActor", (actor, updateData, options, userId) => {
            // Workaround for actor array returned in hook for non triggering clients
            if (actor instanceof Collection) {
                actor = actor.contents.find(a => a.id === update.id);
            }
            Concentrator._onUpdateActor(actor, updateData, options, userId);
            Triggler._onUpdateActor(actor, updateData, options, userId);
            HideNPCNames._onUpdateActor(actor, updateData, options, userId);
        });

        Hooks.on("createActiveEffect", (effect, options, userId) => {
            EnhancedConditions._onCreateActiveEffect(effect, options, userId);
        });

        Hooks.on("deleteActiveEffect", (effect, options, userId) => {
            EnhancedConditions._onDeleteActiveEffect(effect, options, userId);
            Concentrator._onDeleteActiveEffect(effect, options, userId);
        });

        /* ------------------- Token ------------------ */

        Hooks.on("preCreateToken", (tokenDocument, createData, options, userId) => {
        });

        Hooks.on("createToken", (tokenDocument, options, userId) => {
            TokenUtility._onCreateToken(tokenDocument, options, userId);
        });

        Hooks.on("preUpdateToken", (tokenDocument, updateData, options, userId) => {
            Concentrator._onPreUpdateToken(tokenDocument, updateData, options, userId);
            EnhancedConditions._onPreUpdateToken(tokenDocument, updateData, options, userId);
        });

        Hooks.on("updateToken", (tokenDocument, updateData, options, userId) => {
            EnhancedConditions._onUpdateToken(tokenDocument, updateData, options, userId);
            Concentrator._onUpdateToken(tokenDocument, updateData, options, userId);
            Triggler._onUpdateToken(tokenDocument, updateData, options, userId);
            HideNPCNames._onUpdateToken(tokenDocument, updateData, options, userId);
        });

        /* ------------------ Combat ------------------ */

        Hooks.on("preUpdateCombat", (combat, updateData, options, userId) => {
            RerollInitiative._onPreUpdateCombat(combat, updateData, options, userId);
            PanSelect._onPreUpdateCombat(combat, updateData, options, userId);
        });

        Hooks.on("updateCombat", (combat, updateData, options, userId) => {
            RerollInitiative._onUpdateCombat(combat, updateData, options, userId);
            EnhancedConditions._onUpdateCombat(combat, updateData, options, userId);
            PanSelect._onUpdateCombat(combat, updateData, options, userId);
        });

        Hooks.on("deleteCombat", (combat, options, userId) => {
            TrackerUtility._onDeleteCombat(combat, options, userId);
        });
        
        Hooks.on("deleteCombatant", (combatant, options, userId) => {
            TrackerUtility._onDeleteCombatant(combatant, options, userId);
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
            HideNPCNames._onRenderActorSheet(app, html, data);
            Concentrator._onRenderActorSheet(app, html, data);
        });

        /* ------------------- Chat ------------------- */

        Hooks.on("renderChatLog", (app, html, data) => {
            EnhancedConditions._onRenderChatLog(app, html, data);
        });

        Hooks.on("renderChatMessage", (app, html, data) => {
            HideNPCNames._onRenderChatMessage(app, html, data);
            Concentrator._onRenderChatMessage(app, html, data);
            EnhancedConditions._onRenderChatMessage(app, html, data);
        });
        
        Hooks.on("renderDialog", (app, html, data) => {
            switch (app.title) {
                case game.i18n.localize("COMBAT.EndTitle"):
                    GiveXP._onRenderDialog(app, html, data);
                    break;
                
                case game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.ConditionLab.SortDirectionSave.Title`):
                    ConditionLab._onRenderSaveDialog(app, html, data);
                    break;
                
                case game.i18n.localize(`ENHANCED_CONDITIONS.Lab.RestoreDefaultsTitle`):
                    ConditionLab._onRenderRestoreDefaultsDialog(app, html, data);
                    break;

                default:
                    break;
            }
        });
        
        /* -------------- Combat Tracker -------------- */

        Hooks.on("renderCombatTracker", (app, html, data) => {
            HideNPCNames._onRenderCombatTracker(app, html, data);
            TrackerUtility._onRenderCombatTracker(app, html, data);
            TemporaryCombatants._onRenderCombatTracker(app, html, data);
            EnhancedConditions._onRenderCombatTracker(app, html, data);
        });

        /* ---------------- Custom Apps --------------- */

        Hooks.on("renderCUBPuter", (app, html, data) => {
            CUBPuter._onRender(app, html, data);
        });

        Hooks.on("renderConditionLab", (app, html, data) => {
            ConditionLab._onRender(app, html, data);
        });

        Hooks.on("renderCombatCarousel", (app, html, data) => {
            HideNPCNames._onRenderCombatCarousel(app, html, data);
        });

        Hooks.on("vinoPrepareChatDisplayData", (chatDisplayData) => {
            HideNPCNames._onVinoPrepareChatDisplayData(chatDisplayData);
        });
    }

    /**
     * Socket dispatcher
     * @param {*} message 
     */
    static _onSocket(message) {
        if (!message?.gadget) return;

        switch (message.gadget) {
            case BUTLER.GADGETS.concentrator.name:
                return Concentrator._onSocket(message);
        
            default:
                break;
        }
    }
}