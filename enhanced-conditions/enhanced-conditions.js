/**
 * @name "Enhanced Conditions"
 * @author "Evan Clarke (errational)"
 * @description "Links token status icons to conditions stored in journal entries and displays them in chat"
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
         this.preTokenUpdateHook();
         //this.postTokenUpdateHook;
     }

     /**
      * @todo hook on token update when status icon is selected. need to find the right hook!
      */
     
     preTokenUpdateHook(){
         Hooks.on("preUpdateToken",(id,updateData) => {
             console.log(id,updateData);
             console.log(updateData.effects);
             this.lookupConditionMapping(updateData.effects);
         })
     }
     
     /*
     postTokenUpdateHook(){
         Hooks.on("updateToken", (update,token) => {
            //if the update was a status icon selection -> run lookupConditionMapping
            for(var effect of update.data.effects){
                if(!isBlank(effect)){

                }
            }
            
         });
     }
     */


     /**
      * @todo check icon <-> condition mapping table? or journal? and if matches, call condition journal entry lookup
      * @todo take a collection of icons in case we use this elsewhere
      */
     async lookupConditionMapping(icons){
         let conditions = [];
         console.log(conditionMapping);

         //iterate through incoming icons and check the conditionMap for the corresponding entry
         for (var icon of icons){
             console.log(icon);
             if(conditionMapping.hasOwnProperty(icon)){
                //using bracket notation due to special characters in object properties
                let condition = conditionMapping[icon];
                console.log(condition);
                conditions.push(condition);
             }
            
            
         }
         console.log(conditions);
         this.lookupConditionEntry(conditions);
        //return conditions;
     }

      /**
       * @todo lookup condition journal/compendium entry and display in chat. Should use a config setting to determine if chat display is necessary
       */
     async lookupConditionEntry(conditions){
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
        return journalEntries;
        
      }
      /**
       * @todo if flag is set: output condition text to chat -- i think this has to be async
       */
      async conditionChatOutput (conditions){
        //iterate through the journal entries and output to chat
        for (let c of conditions){
            
        }
      }
    
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