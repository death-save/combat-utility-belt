/**
 * @name Enhanced Conditions
 * @version 0.1
 * @author Evan Clarke (errational)
 * @description "Links token status icons to conditions stored in journal entries and displays them in chat. Concept stolen from Robin Kuiper's StatusInfo script for Roll20 (https://github.com/Roll20/roll20-api-scripts/tree/master/StatusInfo)"
 * @todo 1. clickable links in chat to condition description
 * @todo 2. condition icons in chat
 * @todo 3. config gui
 * @todo 4. conditions added to actor sheet
 */

/**
 * --------------------
 * Set module variables
 * --------------------
 */

/**
 * @description defines the path to the status icons
 * @todo it could be the existing FVTT path or a custom set -- needs to be settable using config
 */
let EC_CONFIG_iconPath = '/icons/';

/**
 * @description Defines whether the conditions are stored in the world's journal or a compendium
 * @todo allow user to define value via config gui
 */
let EC_CONFIG_folderType = 'journal';

 /**
  * @description name of the journal/compendium folder that contains the conditions
  * @todo allow user to define value via config gui
  */
let EC_CONFIG_folderName = 'conditions';

/**
 * @description flag for whether conditions are output to chat when selected
 * @todo allow user to define value via config gui
 */
let EC_CONFIG_outputChat = Boolean(true);

/**
 * @description Mapping of status icons to condition
 * @todo allow user definable mapping via config gui
 */
const conditionMapping = {
    "icons/svg/skull.svg":"",
    "icons/svg/bones.svg":"",
    "icons/svg/sleep.svg":"unconscious",
    "icons/svg/stoned.svg":"",

    "icons/svg/eye.svg":"blinded",
    "icons/svg/net.svg":"restrained",
    "icons/svg/target.svg":"",
    "icons/svg/trap.svg":"",

    "icons/svg/blood.svg":"",
    "icons/svg/regen.svg":"",
    "icons/svg/degen.svg":"",
    "icons/svg/heal.svg":"",

    "icons/svg/radiation.svg":"",
    "icons/svg/biohazard.svg":"",
    "icons/svg/poison.svg":"poisoned",
    "icons/svg/hazard.svg":"",

    "icons/svg/pill.svg":"",
    "icons/svg/terror.svg":'frightened',
    "icons/svg/sun.svg":"",
    "icons/svg/angel.svg":"",

    "icons/svg/fire.svg":"",
    "icons/svg/frozen.svg":"petrified",
    "icons/svg/lightning.svg":"",
    "icons/svg/acid.svg":"",
    
    "icons/svg/fire-shield.svg":"",
    "icons/svg/ice-shield.svg":"",
    "icons/svg/mage-shield.svg":"",
    "icons/svg/holy-shield.svg":""
}





/**
 * @name class EnhancedConditions
 * @description class to perform the main module functions
 * @author Evan Clarke <errational>
 * @todo set condition in reverse (select token then select condition name)
 * @todo set timeframe for condition and track via combat hook
 */
 class EnhancedConditions {
     constructor(){
         this.postTokenUpdateHook();
     }

     /**
      * @name currentToken
      * @type Object {Token}
      * @description holds the token for use elsewhere in the class
      */
     currentToken = {};

     /**
     * @name postTokenUpdateHook
     * @description hooks on token updates. If the update includes effects, calls the lookups
     */
     postTokenUpdateHook(){
         Hooks.on("updateToken", (token,sceneId,update) => {
            console.log(token,sceneId,update);
            let effects = update.effects;
            
            //If the update has effects in it, lookup mapping and set the current token
            if(effects){
                this.currentToken = token;
                return this.lookupConditionMapping(effects);
            }
            return;
         });
     }
     


     /**
      * @name lookupConditionMapping
      * @description check icon <-> condition mapping and call condition journal entry lookup against matches
      * @todo 
      * @parameter {Object} effects
      */
     async lookupConditionMapping(effects){
         let conditions = [];
         //console.log(conditionMapping);

         //iterate through incoming icons and check the conditionMap for the corresponding entry
         for (let e of effects){
             //console.log(icon);
             if(conditionMapping.hasOwnProperty(e)){
                //using bracket notation due to special characters in object properties
                let condition = conditionMapping[e];
                //console.log(condition);
                conditions.push(condition);
             }
             
         }
         console.log(conditions);
         return this.lookupConditionEntries(conditions);
     }

      /**
       * @name lookupConditionEntries
       * @description lookup condition journal/compendium entry and call chat output if option set
       * @todo rebuild to allow switching between journal/compendium lookup
       */
     async lookupConditionEntries(conditions){
        let conditionEntries = [];

        for (var condition of conditions){
            if(condition){
                let re = new RegExp(condition,'i');
                let ce = await game.journal.entities.find(j => j.name.match(re));
                console.log(ce);
                conditionEntries.push(ce);
            }
        }

        console.log(conditionEntries);
        if(EC_CONFIG_outputChat){
            return this.outputChatMessage(conditionEntries);
        }
        return;        
      }

      /**
       * @todo if flag is set: output condition text to chat -- i think this has to be async
       */
      async outputChatMessage (entries){
        let chatUser = game.userId;
        let token = this.currentToken;
        let actor = await this.lookupTokenActor(token.actor.id);
        let tokenSpeaker = {};
        let chatContent = [];

        console.log("current token",token);
        console.log("current actor",actor);
        //console.log("token id",this.tokenData.id);
        
        if(actor){
            console.log("Speaker is an actor:",actor);
            tokenSpeaker = ChatMessage.getSpeaker({"actor":actor});
        }
        else {
            console.log("Speaker is a token:",token);
            tokenSpeaker = ChatMessage.getSpeaker({"token":token});
        }
        
        //iterate through the journal entries and output to chat
        for (let e of entries){
            //let journalLink = "@JournalEntry["+e.name+"]";
            let journalLink = e.name;
            //need to figure out best way to break out entries -- newline is being turned into space
            chatContent.push("\n"+journalLink);

               
        }
        await ChatMessage.create({
            speaker:tokenSpeaker,
            content:chatContent,
            user:chatUser});
      }

      /**
      * @name lookupTokenActor
      * @description looks up the corresponding actor entity for the token
      * @param {String} id 
      * @returns {Actor} actor
      */
     async lookupTokenActor(id){
        let actor = {};
        if(id){
            actor = await game.actors.entities.find(a => a.id === id);
        }
        console.log("found actor: ",actor)
        return actor;
     }

      /**
       * @todo need a function for returning the condition mapping?
       */
    
 }

 /**
  * @name EnhancedConditionsConfig
  * @description "Create/manage configurable settings for the module"
  */
 class EnhancedConditionsConfig {
     constructor(){

     }
     /**
      * @todo create the config window -- attach to combat tab?
      */
     createConfigWindow(){

     }

      /**
       * @todo set config vars based on user input
       */
      setConfigFlag(){

      }

 }

 let ec = new EnhancedConditions;