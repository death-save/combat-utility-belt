/**
 * Initiates module classes (and shines a light on the dark night sky)
 */
class CUBSignal {
    static lightUp() {
        CUBSignal.hookOnInit();
        CUBSignal.hookOnCanvasInit();
        CUBSignal.hookOnReady();
        CUBSignal.hookOnRenderSettings();
        CUBSignal.hookOnRenderTokenHUD();
        CUBSignal.hookOnRenderActorSheet();
        CUBSignal.hookOnRenderImagePopout();
        CUBSignal.hookOnCreateToken();
        CUBSignal.hookOnPreUpdateToken();
        CUBSignal.hookOnUpdateToken();
        CUBSignal.hookOnPreUpdateActor();
        CUBSignal.hookOnUpdateActor();
        CUBSignal.hookOnPreUpdateCombat();
        CUBSignal.hookOnUpdateCombat();
        CUBSignal.hookOnDeleteCombat();
        CUBSignal.hookOnDeleteCombatant();
        CUBSignal.hookOnRenderCombatTracker();
        CUBSignal.hookOnRenderCombatTrackerConfig();
        CUBSignal.hookOnRenderChatMessage();
    }


    static hookOnInit() {
        Hooks.on("init", () => {
            CUB.enhancedConditions = new CUBEnhancedConditions();
            CUB.hideNPCNames = new CUBHideNPCNames();
            CUB.combatTracker = new CUBCombatTracker();
            CUB.concentrator = new CUBConcentrator();
            CUB.tokenUtility = new CUBTokenUtility();
            CUBSidekick.handlebarsHelpers();
            CUBSidekick.jQueryHelpers();

            if (CUB.tokenUtility.settings.tokenEffectSize) {
                Token.prototype.drawEffects = CUBTokenUtility._patchDrawEffects;
            }
        });
    }

    static hookOnCanvasInit() {
        Hooks.on("canvasInit", () => {
           
        });
    }

    static hookOnReady() {
        Hooks.on("ready", () => {
            CUB.rerollInitiative = new CUBRerollInitiative();
            CUB.injuredAndDead = new CUBInjuredAndDead();
            CUB.actorUtility = new CUBActorUtility();
            
            
            if (CUB.combatTracker.settings.xpModule) {
                Combat.prototype.endCombat = CUBCombatTracker.prototype.endCombat;
            }
        });
    }

    static hookOnRenderSettings() {
        Hooks.on("renderSettings", (app, html) => {
            CUBEnhancedConditions._createSidebarButton(html);
            CUB.enhancedConditions._toggleSidebarButtonDisplay(CUB.enhancedConditions.settings.enhancedConditions);
        });
    }

    static hookOnRenderTokenHUD() {
        Hooks.on("renderTokenHUD", (app, html, data) => {
            CUB.enhancedConditions._hookOnRenderTokenHUD(app, html, data);
        });
    }

    static hookOnRenderActorSheet() {
        Hooks.on("renderActorSheet", (app, html, data) => {
            CUB.actorUtility._onRenderActorSheet(app, html, data);
        });
    }

    static hookOnRenderImagePopout() {
        Hooks.on("renderImagePopout", (app, html, data) => {
            CUB.hideNPCNames._onRenderImagePopout(app, html, data);
        });
    }

    static hookOnCreateToken() {
        Hooks.on("createToken", (scene, sceneId, tokenData, options, userId) => {
            CUB.tokenUtility._hookOnCreateToken(scene, sceneId, tokenData);
        });
    }

    static hookOnPreUpdateToken() {
        Hooks.on("preUpdateToken", (scene, sceneId, actorData, currentData) => {
            CUB.concentrator._hookOnPreUpdateToken(scene, sceneId, actorData, currentData);
            //CUB.enhancedConditions._hookOnPreUpdateToken(scene, sceneId, actorData, currentData);
        });
    }

    static hookOnUpdateToken() {
        Hooks.on("updateToken", (scene, sceneID, update, options, userId) => {
            CUB.enhancedConditions._hookOnUpdateToken(scene, sceneID, update, options, userId);
            CUB.injuredAndDead._hookOnUpdateToken(scene, sceneID, update, options, userId);
            CUB.concentrator._hookOnUpdateToken(scene, sceneID, update, options, userId);
        });
    }

    static hookOnPreUpdateActor() {
        Hooks.on("preUpdateActor", (actor, update, options) => {
            CUB.concentrator._hookOnPreUpdateActor(actor, update, options);
        });
    }

    static hookOnUpdateActor() {
        Hooks.on("updateActor", (actor, update, options) => {
            // Workaround for actor array returned in hook for non triggering clients
            if (actor instanceof Collection) {
                actor = actor.entities.find(a => a._id === update._id);
            }
            CUB.concentrator._hookOnUpdateActor(actor, update, options);
            CUB.injuredAndDead._hookOnUpdateActor(actor, update);
        });
    }

    static hookOnPreUpdateCombat() {
        Hooks.on("preUpdateCombat", (combat, update, options) => {
            
        });
    }

    static hookOnUpdateCombat() {
        Hooks.on("updateCombat", (combat, update, options, userId) => {
            CUB.rerollInitiative._onUpdateCombat(combat, update, options, userId);
            CUB.combatTracker._hookOnUpdateCombat(combat, update);
        });
    }

    static hookOnDeleteCombat() {
        Hooks.on("deleteCombat", (combat, combatId, options, userId) => {
            CUB.combatTracker._hookOnDeleteCombat(combat, combatId, options, userId);
        });
    }

    static hookOnDeleteCombatant() {
        Hooks.on("preDeleteCombatant", (combat, combatId, combatantId, options) => {
            CUB.combatTracker._hookOnDeleteCombatant(combat, combatId, combatantId, options);
        });
    }

    static hookOnRenderCombatTracker() {
        Hooks.on("renderCombatTracker", (app, html, data) => {
            CUB.hideNPCNames._hookOnRenderCombatTracker(app, html, data);
            CUB.combatTracker._onRenderCombatTracker(app, html, data);
        });
    }

    static hookOnRenderCombatTrackerConfig() {
        Hooks.on("renderCombatTrackerConfig", (app, html, data) => {
            // Possible future feature
            //CUB.combatTracker._onRenderCombatTrackerConfig(app, html, data);
        });
    }

    static hookOnRenderChatMessage() {
        Hooks.on("renderChatMessage", (message, html, data) => {
            CUB.hideNPCNames._hookOnRenderChatMessage(message, html, data);
            CUB.concentrator._onRenderChatMessage(message, html, data);
        });
    }
}