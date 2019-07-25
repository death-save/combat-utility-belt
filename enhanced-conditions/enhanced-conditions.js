/**
 * @name "Enhanced Conditions"
 * @author "Evan Clarke (errational)"
 * @description "Links token status icons to conditions stored in journal entries and displays them in chat. Concept stolen from Robin Kuiper's StatusInfo script for Roll20 (https://github.com/Roll20/roll20-api-scripts/tree/master/StatusInfo)"
 * @todo 
 */

/**
 * set global variables
 */

/**
 * @todo set a path to the status icons -- it could be the existing FVTT path or a custom set -- needs to be settable using config
 */
let CONFIG_ICON_PATH = '/icons/';

 /**
  * @todo set the name of the journal folder? / compendium? that contains the conditions -- needs to be settable using config
  */
let CONFIG_PACK_NAME = 'conditions-5e';

/**
 * @todo set flag for whether conditions are output to chat when selected - default to true?
 */
let CONFIG_OUTPUT_CHAT = Boolean(true);

/**
 * Manually define the mapping for now
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
 * @description "class to perform the main module functions"
 * @todo set condition in reverse (select token then select condition name)
 * @todo set timeframe for condition and track via combat hook
 */
 class EnhancedConditions {
     constructor(){
         //this.preTokenUpdateHook();
         this.postTokenUpdateHook();
     }
     //Holds the tokenActor for use in lookups
     tokenActor = {};

     /**
      * @todo hook on token update when status icon is selected. need to find the right hook!
      */
     
    /*
     preTokenUpdateHook(){
         Hooks.on("preUpdateToken",(id,updateData) => {
             console.log(id,updateData);
             console.log(updateData.effects);
             this.lookupConditionMapping(updateData.effects);
         })
     }
     */
     async lookupTokenActor(id){
        let actor = {};
        if(id){
            actor = await game.actors.entities.find(a => a.id === id);
        }
        console.log("found actor: ",actor)
        return this.tokenActor = actor;
     }

     postTokenUpdateHook(){
         Hooks.on("updateToken", (update,id) => {
            console.log(update,id);
            let effects = update.data.effects;
            let actorId = update.actor.data.id;
            //this.token.user = update.data.user;
            
            this.lookupTokenActor(actorId);
            //this.tokenData = update.data;
            //this.tokenData.id = id;
            
            //if the update was a status icon selection -> run lookupConditionMapping
            this.lookupConditionMapping(effects)
            /* not really necessary to loop through the effects, better to just pass them all over and let the mapper handle it
            for(let effect of update.data.effects){
                if(effect){
                    console.log(effect);
                    this.lookupConditionMapping(effect)
                }
            }
            */
         });
     }
     


     /**
      * @todo check icon <-> condition mapping table? or journal? and if matches, call condition journal entry lookup
      * @todo take a collection of icons in case we use this elsewhere
      */
     async lookupConditionMapping(icons){
         let conditions = [];
         console.log(conditionMapping);

         //iterate through incoming icons and check the conditionMap for the corresponding entry
         for (let icon of icons){
             //console.log(icon);
             if(conditionMapping.hasOwnProperty(icon)){
                //using bracket notation due to special characters in object properties
                let condition = conditionMapping[icon];
                //console.log(condition);
                conditions.push(condition);
             }
             
         }
         console.log(conditions);
         return this.lookupConditionJournalEntries(conditions);
        //return conditions;
     }

      /**
       * @todo lookup condition journal/compendium entry and display in chat. Should use a config setting to determine if chat display is necessary
       */
     async lookupConditionJournalEntries(conditions){
        let journalEntries = [];
        for (var condition of conditions){
            if(condition){
                let re = new RegExp(condition,'i');
                //retrieve the journal entry and hold it in a obj var
                let journalEntry = await game.journal.entities.find(j => j.name.match(re));
                console.log(journalEntry);
                journalEntries.push(journalEntry);
            }
        }
        console.log(journalEntries);
        return this.outputChatMessage(journalEntries);
        //return journalEntries;
        
      }
      /**
       * @todo if flag is set: output condition text to chat -- i think this has to be async
       */
      async outputChatMessage (entries){
        let chatUser = game.userId;
        //let token = this.token;
        let actor = this.tokenActor;
        let tokenSpeaker = {};

        console.log("current token",actor);
        //console.log("actor id",this.tokenData.actorId);
        //console.log("token id",this.tokenData.id);
        
        if(actor){
            tokenSpeaker = ChatMessage.getSpeaker({"actor":actor});
        }
        else {
            tokenSpeaker = ChatMessage.getSpeaker({"token":token});
        }
        
        //let tokenSpeaker =ChatMessage.getSpeaker({actor:actorId,token:tokenId});
        //console.log(this.token.name);
        //let chatMessages = [];
        //iterate through the journal entries and output to chat
        for (let e of entries){
            //let journalLink = "@JournalEntry["+e.name+"]";
            let journalLink = e.name;
            
            await ChatMessage.create({
                speaker:tokenSpeaker,
                content:journalLink,
                user:chatUser});
            
        }
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