## Classes

<dl>
<dt><a href="#CUBAnimatedDie">CUBAnimatedDie</a></dt>
<dd></dd>
<dt><a href="#Concentrator">Concentrator</a></dt>
<dd><p>Request a roll or display concentration checks when damage is taken.</p>
</dd>
<dt><a href="#PanSelect">PanSelect</a></dt>
<dd></dd>
<dt><a href="#RerollInitiative">RerollInitiative</a></dt>
<dd><p>Rerolls initiative for all combatants</p>
</dd>
<dt><a href="#Sidekick">Sidekick</a></dt>
<dd><p>Provides helper methods for use elsewhere in the module (and has your back in a melee)</p>
</dd>
<dt><a href="#Signal">Signal</a></dt>
<dd><p>Initiates module classes (and shines a light on the dark night sky)</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#KNOWN_GAME_SYSTEMS">KNOWN_GAME_SYSTEMS</a></dt>
<dd><p>Stores information about well known game systems. All other systems will resolve to &quot;other&quot;</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#createCUBPuterButton">createCUBPuterButton(html)</a></dt>
<dd><p>Create the sidebar button</p>
</dd>
</dl>

<a name="CUBAnimatedDie"></a>

## CUBAnimatedDie
**Kind**: global class  

* [CUBAnimatedDie](#CUBAnimatedDie)
    * [.randomFace()](#CUBAnimatedDie+randomFace)
    * [.rollTo(face)](#CUBAnimatedDie+rollTo)
    * [.reset()](#CUBAnimatedDie+reset)
    * [.roll()](#CUBAnimatedDie+roll)

<a name="CUBAnimatedDie+randomFace"></a>

### cubAnimatedDie.randomFace()
Return a random face

**Kind**: instance method of [<code>CUBAnimatedDie</code>](#CUBAnimatedDie)  
<a name="CUBAnimatedDie+rollTo"></a>

### cubAnimatedDie.rollTo(face)
**Kind**: instance method of [<code>CUBAnimatedDie</code>](#CUBAnimatedDie)  

| Param | Type |
| --- | --- |
| face | <code>\*</code> | 

<a name="CUBAnimatedDie+reset"></a>

### cubAnimatedDie.reset()
Reset the die

**Kind**: instance method of [<code>CUBAnimatedDie</code>](#CUBAnimatedDie)  
<a name="CUBAnimatedDie+roll"></a>

### cubAnimatedDie.roll()
Roll the die

**Kind**: instance method of [<code>CUBAnimatedDie</code>](#CUBAnimatedDie)  
<a name="Concentrator"></a>

## Concentrator
Request a roll or display concentration checks when damage is taken.

**Kind**: global class  
**Author**: JacobMcAuley  
**Author**: Evan Clarke  
**Todo**

- [ ] Supply DC


* [Concentrator](#Concentrator)
    * [._wasDamageTaken(newHealth, oldHealth)](#Concentrator._wasDamageTaken) ⇒ <code>Boolean</code>
    * [._isConcentrating(token)](#Concentrator._isConcentrating) ⇒ <code>Boolean</code>
    * [._calculateDamage(newHealth, oldHealth)](#Concentrator._calculateDamage) ⇒ <code>Number</code>
    * [._processDeath(token)](#Concentrator._processDeath)
    * [._promptEnableEnhancedConditions()](#Concentrator._promptEnableEnhancedConditions)
    * [._createCondition()](#Concentrator._createCondition)
    * [._onRenderChatMessage(app, html, data)](#Concentrator._onRenderChatMessage)
    * [._onPreUpdateToken(scene, tokenData, update, options)](#Concentrator._onPreUpdateToken)
    * [._onPreUpdateActor(actor, update, options)](#Concentrator._onPreUpdateActor)
    * [._onUpdateActor(actor, update, options)](#Concentrator._onUpdateActor)
    * [._onUpdateToken(scene, token, update, options, userId)](#Concentrator._onUpdateToken)
    * [._determineDisplayedUsers(options)](#Concentrator._determineDisplayedUsers)
    * [._displayChat(token, damage)](#Concentrator._displayChat)
    * [._displayDeathChat(token)](#Concentrator._displayDeathChat)
    * [._distributePrompts(actorId, users)](#Concentrator._distributePrompts)
    * [._displayPrompt(actorId, userId)](#Concentrator._displayPrompt)
    * [._notifyDoubleConcentration(token)](#Concentrator._notifyDoubleConcentration)

<a name="Concentrator._wasDamageTaken"></a>

### Concentrator.\_wasDamageTaken(newHealth, oldHealth) ⇒ <code>Boolean</code>
Determines if health has been reduced

**Kind**: static method of [<code>Concentrator</code>](#Concentrator)  

| Param | Type |
| --- | --- |
| newHealth | <code>\*</code> | 
| oldHealth | <code>\*</code> | 

<a name="Concentrator._isConcentrating"></a>

### Concentrator.\_isConcentrating(token) ⇒ <code>Boolean</code>
Checks for the presence of the concentration condition effect

**Kind**: static method of [<code>Concentrator</code>](#Concentrator)  

| Param | Type |
| --- | --- |
| token | <code>\*</code> | 

<a name="Concentrator._calculateDamage"></a>

### Concentrator.\_calculateDamage(newHealth, oldHealth) ⇒ <code>Number</code>
Calculates damage taken based on two health values

**Kind**: static method of [<code>Concentrator</code>](#Concentrator)  

| Param | Type |
| --- | --- |
| newHealth | <code>\*</code> | 
| oldHealth | <code>\*</code> | 

<a name="Concentrator._processDeath"></a>

### Concentrator.\_processDeath(token)
Processes the steps necessary when the concentrating token is dead

**Kind**: static method of [<code>Concentrator</code>](#Concentrator)  

| Param | Type |
| --- | --- |
| token | <code>\*</code> | 

<a name="Concentrator._promptEnableEnhancedConditions"></a>

### Concentrator.\_promptEnableEnhancedConditions()
Executes when the module setting is enabled

**Kind**: static method of [<code>Concentrator</code>](#Concentrator)  
<a name="Concentrator._createCondition"></a>

### Concentrator.\_createCondition()
Creates a condition for Concentrating if none exists

**Kind**: static method of [<code>Concentrator</code>](#Concentrator)  
**Todo**

- [ ] extract to Enhanced Conditions and make it generic

<a name="Concentrator._onRenderChatMessage"></a>

### Concentrator.\_onRenderChatMessage(app, html, data)
Handle render ChatMessage

**Kind**: static method of [<code>Concentrator</code>](#Concentrator)  

| Param | Type |
| --- | --- |
| app | <code>\*</code> | 
| html | <code>\*</code> | 
| data | <code>\*</code> | 

<a name="Concentrator._onPreUpdateToken"></a>

### Concentrator.\_onPreUpdateToken(scene, tokenData, update, options)
Handles preUpdateToken

**Kind**: static method of [<code>Concentrator</code>](#Concentrator)  

| Param | Type |
| --- | --- |
| scene | <code>\*</code> | 
| tokenData | <code>\*</code> | 
| update | <code>\*</code> | 
| options | <code>\*</code> | 

<a name="Concentrator._onPreUpdateActor"></a>

### Concentrator.\_onPreUpdateActor(actor, update, options)
Handles preUpdate Actor

**Kind**: static method of [<code>Concentrator</code>](#Concentrator)  

| Param | Type |
| --- | --- |
| actor | <code>\*</code> | 
| update | <code>\*</code> | 
| options | <code>\*</code> | 

<a name="Concentrator._onUpdateActor"></a>

### Concentrator.\_onUpdateActor(actor, update, options)
Handle update Actor

**Kind**: static method of [<code>Concentrator</code>](#Concentrator)  

| Param | Type |
| --- | --- |
| actor | <code>\*</code> | 
| update | <code>\*</code> | 
| options | <code>\*</code> | 

<a name="Concentrator._onUpdateToken"></a>

### Concentrator.\_onUpdateToken(scene, token, update, options, userId)
Handle update Token

**Kind**: static method of [<code>Concentrator</code>](#Concentrator)  

| Param | Type |
| --- | --- |
| scene | <code>\*</code> | 
| token | <code>\*</code> | 
| update | <code>\*</code> | 
| options | <code>\*</code> | 
| userId | <code>\*</code> | 

<a name="Concentrator._determineDisplayedUsers"></a>

### Concentrator.\_determineDisplayedUsers(options)
Distributes concentration prompts to affected users

**Kind**: static method of [<code>Concentrator</code>](#Concentrator)  

| Param | Type |
| --- | --- |
| options | <code>\*</code> | 

<a name="Concentrator._displayChat"></a>

### Concentrator.\_displayChat(token, damage)
Displays a chat message for concentration checks

**Kind**: static method of [<code>Concentrator</code>](#Concentrator)  

| Param | Type |
| --- | --- |
| token | <code>\*</code> | 
| damage | <code>\*</code> | 

<a name="Concentrator._displayDeathChat"></a>

### Concentrator.\_displayDeathChat(token)
Displays a message when a concentrating token dies

**Kind**: static method of [<code>Concentrator</code>](#Concentrator)  

| Param | Type |
| --- | --- |
| token | <code>\*</code> | 

<a name="Concentrator._distributePrompts"></a>

### Concentrator.\_distributePrompts(actorId, users)
Distribute concentration prompts to affected users

**Kind**: static method of [<code>Concentrator</code>](#Concentrator)  

| Param | Type |
| --- | --- |
| actorId | <code>\*</code> | 
| users | <code>\*</code> | 

<a name="Concentrator._displayPrompt"></a>

### Concentrator.\_displayPrompt(actorId, userId)
Displays the prompt to roll a concentration check

**Kind**: static method of [<code>Concentrator</code>](#Concentrator)  

| Param | Type |
| --- | --- |
| actorId | <code>\*</code> | 
| userId | <code>\*</code> | 

<a name="Concentrator._notifyDoubleConcentration"></a>

### Concentrator.\_notifyDoubleConcentration(token)
Displays a chat message to GMs if a Concentration spell is cast while already concentrating

**Kind**: static method of [<code>Concentrator</code>](#Concentrator)  

| Param | Type |
| --- | --- |
| token | <code>\*</code> | 

<a name="PanSelect"></a>

## PanSelect
**Kind**: global class  

* [PanSelect](#PanSelect)
    * [._panHandler(combat, update)](#PanSelect._panHandler)
    * [._checkPlayerPan(token)](#PanSelect._checkPlayerPan)
    * [._checkGMPan(token)](#PanSelect._checkGMPan)
    * [._panToToken(token)](#PanSelect._panToToken)
    * [._selectHandler(combat, update)](#PanSelect._selectHandler)
    * [._checkGMSelect(token)](#PanSelect._checkGMSelect)
    * [._checkPlayerSelect(token)](#PanSelect._checkPlayerSelect)
    * [._checkObserverDeselect(token)](#PanSelect._checkObserverDeselect)

<a name="PanSelect._panHandler"></a>

### PanSelect.\_panHandler(combat, update)
Determines if a panning workflow should begin

**Kind**: static method of [<code>PanSelect</code>](#PanSelect)  

| Param | Type |
| --- | --- |
| combat | <code>Object</code> | 
| update | <code>Object</code> | 

<a name="PanSelect._checkPlayerPan"></a>

### PanSelect.\_checkPlayerPan(token)
Determine if the player should be panned

**Kind**: static method of [<code>PanSelect</code>](#PanSelect)  

| Param | Type |
| --- | --- |
| token | <code>\*</code> | 

<a name="PanSelect._checkGMPan"></a>

### PanSelect.\_checkGMPan(token)
Determine if the GM should be panned

**Kind**: static method of [<code>PanSelect</code>](#PanSelect)  

| Param | Type |
| --- | --- |
| token | <code>\*</code> | 

<a name="PanSelect._panToToken"></a>

### PanSelect.\_panToToken(token)
Pans user to the token

**Kind**: static method of [<code>PanSelect</code>](#PanSelect)  

| Param | Type |
| --- | --- |
| token | <code>\*</code> | 

<a name="PanSelect._selectHandler"></a>

### PanSelect.\_selectHandler(combat, update)
Selects the current token in the turn tracker

**Kind**: static method of [<code>PanSelect</code>](#PanSelect)  

| Param | Type |
| --- | --- |
| combat | <code>Object</code> | 
| update | <code>Object</code> | 

<a name="PanSelect._checkGMSelect"></a>

### PanSelect.\_checkGMSelect(token)
Determine if the current combatant token should be selected for the GM

**Kind**: static method of [<code>PanSelect</code>](#PanSelect)  

| Param | Type |
| --- | --- |
| token | <code>\*</code> | 

<a name="PanSelect._checkPlayerSelect"></a>

### PanSelect.\_checkPlayerSelect(token)
Determines if Player can select the current combatant token

**Kind**: static method of [<code>PanSelect</code>](#PanSelect)  

| Param | Type |
| --- | --- |
| token | <code>\*</code> | 

<a name="PanSelect._checkObserverDeselect"></a>

### PanSelect.\_checkObserverDeselect(token)
Determines if tokens should be deselected when a non-owned Combatant has a turn

**Kind**: static method of [<code>PanSelect</code>](#PanSelect)  

| Param | Type |
| --- | --- |
| token | <code>\*</code> | 

<a name="RerollInitiative"></a>

## RerollInitiative
Rerolls initiative for all combatants

**Kind**: global class  
**Todo**

- [ ] refactor to preUpdate hook

<a name="RerollInitiative._onUpdateCombat"></a>

### RerollInitiative.\_onUpdateCombat(combat, update, options, userId)
Update Combat handler

**Kind**: static method of [<code>RerollInitiative</code>](#RerollInitiative)  

| Param | Type |
| --- | --- |
| combat | <code>\*</code> | 
| update | <code>\*</code> | 
| options | <code>\*</code> | 
| userId | <code>\*</code> | 

<a name="Sidekick"></a>

## Sidekick
Provides helper methods for use elsewhere in the module (and has your back in a melee)

**Kind**: global class  

* [Sidekick](#Sidekick)
    * [.getSystemChoices()](#Sidekick.getSystemChoices)
    * [.fetchJsons(source, path)](#Sidekick.fetchJsons)
    * [.validateObject(object)](#Sidekick.validateObject) ⇒ <code>Boolean</code>
    * [.convertMapToArray(map)](#Sidekick.convertMapToArray)
    * [.getKeyByValue(object, value)](#Sidekick.getKeyByValue)
    * [.getInverseMap()](#Sidekick.getInverseMap)
    * [.handlebarsHelpers()](#Sidekick.handlebarsHelpers)
    * [.jQueryHelpers()](#Sidekick.jQueryHelpers)
    * [.getTerms(arr)](#Sidekick.getTerms)
    * [.escapeRegExp(string)](#Sidekick.escapeRegExp) ⇒ <code>String</code>
    * [.coerceType(target, type)](#Sidekick.coerceType) ⇒ <code>\*</code>
    * [.buildFormData(FD)](#Sidekick.buildFormData)
    * [.createId(existingIds)](#Sidekick.createId)
    * [.toTitleCase(string)](#Sidekick.toTitleCase)
    * [.replaceOnDocument(pattern, string, param2)](#Sidekick.replaceOnDocument)

<a name="Sidekick.getSystemChoices"></a>

### Sidekick.getSystemChoices()
Gets the default game system names stored in the constants butler class

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
<a name="Sidekick.fetchJsons"></a>

### Sidekick.fetchJsons(source, path)
Use FilePicker to browse then Fetch one or more JSONs and return them

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| source | <code>\*</code> | 
| path | <code>\*</code> | 

<a name="Sidekick.validateObject"></a>

### Sidekick.validateObject(object) ⇒ <code>Boolean</code>
Validate that an object is actually an object

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| object | <code>Object</code> | 

<a name="Sidekick.convertMapToArray"></a>

### Sidekick.convertMapToArray(map)
Convert any ES6 Maps/Sets to objects for settings use

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| map | <code>Map</code> | 

<a name="Sidekick.getKeyByValue"></a>

### Sidekick.getKeyByValue(object, value)
Retrieves a key using the given value

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>Object</code> | - the object that contains the key/value |
| value | <code>\*</code> |  |

<a name="Sidekick.getInverseMap"></a>

### Sidekick.getInverseMap()
Inverts the key and value in a map

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
**Todo:**: rework  
<a name="Sidekick.handlebarsHelpers"></a>

### Sidekick.handlebarsHelpers()
Adds additional handlebars helpers

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
<a name="Sidekick.jQueryHelpers"></a>

### Sidekick.jQueryHelpers()
Adds additional jquery helpers

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
<a name="Sidekick.getTerms"></a>

### Sidekick.getTerms(arr)
Takes an array of terms (eg. name parts) and returns groups of neighbouring terms

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| arr | <code>\*</code> | 

<a name="Sidekick.escapeRegExp"></a>

### Sidekick.escapeRegExp(string) ⇒ <code>String</code>
Escapes regex special chars

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
**Returns**: <code>String</code> - escapedString  

| Param | Type |
| --- | --- |
| string | <code>String</code> | 

<a name="Sidekick.coerceType"></a>

### Sidekick.coerceType(target, type) ⇒ <code>\*</code>
Attempts to coerce a target value into the exemplar's type

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
**Returns**: <code>\*</code> - coercedValue  

| Param | Type |
| --- | --- |
| target | <code>\*</code> | 
| type | <code>\*</code> | 

<a name="Sidekick.buildFormData"></a>

### Sidekick.buildFormData(FD)
Builds a FD returned from _getFormData into a formData array
Borrowed from foundry.js

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| FD | <code>\*</code> | 

<a name="Sidekick.createId"></a>

### Sidekick.createId(existingIds)
Get a random unique Id, checking an optional supplied array of ids for a match

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| existingIds | <code>\*</code> | 

<a name="Sidekick.toTitleCase"></a>

### Sidekick.toTitleCase(string)
Sets a string to Title Case

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| string | <code>\*</code> | 

<a name="Sidekick.replaceOnDocument"></a>

### Sidekick.replaceOnDocument(pattern, string, param2)
Parses HTML and replaces instances of a matched pattern

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| pattern | <code>\*</code> | 
| string | <code>\*</code> | 
| param2 | <code>\*</code> | 

<a name="Signal"></a>

## Signal
Initiates module classes (and shines a light on the dark night sky)

**Kind**: global class  
<a name="Signal.lightUp"></a>

### Signal.lightUp()
Registers hooks

**Kind**: static method of [<code>Signal</code>](#Signal)  
<a name="KNOWN_GAME_SYSTEMS"></a>

## KNOWN\_GAME\_SYSTEMS
Stores information about well known game systems. All other systems will resolve to "other"

**Kind**: global constant  
<a name="createCUBPuterButton"></a>

## createCUBPuterButton(html)
Create the sidebar button

**Kind**: global function  

| Param | Type |
| --- | --- |
| html | <code>\*</code> | 

