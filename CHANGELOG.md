# Changelog

## [Unreleased]
- ~~Compendium support for Condition Lab~~
- Combatant stats in Combat Tracker
- Refine Hide NPC Names to allow for "known" NPC names/information
- Attach Macros to Conditions in Condition Lab

## [1.0.0] - 2020-04-24
### Changed

### Fixed
- Concentrator no longer tests concentration when HP = 0 and instead simply removes the status icon

## [0.9.8] - 2020-03-16
### Added
- Enhanced Conditions now outputs the condition icon in the chat message

### Changed
- Enhanced Conditions and Concentrator messages are now sent by the token/actor in question--this allows Hide NPC Names to correctly hide the name
- Reworked the Enhanced Conditions chat message format--the message now displays as a list

### Fixed
- Enhanced Conditions no longer sends multiple chat messages for a single event
- Concentrator no longer sends multiple chat messages for a single event
- Single word names are now correctly hidden by Hide NPC names
- Spaces around names are now trimmed before being processed by Hide NPC Names
- Regex is escaped in single word names

## [0.9.7] - 2020-03-05
### Added
- Added a client setting to set the status effect icon size on tokens. Three options are available: Small (default) -- 5x5 icons, Medium -- 3x3 icons, and Large -- 2x2 icons. If the number of icons exceeds the boundaries of the token the additional icons will "bleed" into the canvas and may obscure other placeable objects or canvas elements. 

## [0.9.6] - 2020-03-01
### Added
- Hide NPC Names now includes a setting to suppress the chat card footer, which can contain sensitive information about the NPC
- Select Token now includes a setting to deselect all controlled tokens when the user does not have OWNER permission on the active combatant. This setting would generally be used in sessions where multiple players are using a single Foundry client

### Changed
- Hide NPC Names enhanced to cover a greater number of possible names including names with spaces and special characters
- Hide NPC Names now replaces names in the body of chat cards
- Pan/Select Token reworked to offer granular GM/Player control -- SOME SETTINGS HAVE BEEN RESET

## [0.9.5] - 2020-02-24
### Added
- Mark Injured/Dead now includes an Unconscious status that can be assigned to a certain type of Actor (eg. Player Characters) in settings

### Changed
- Enhanced Conditions Unconscious mapping now maps to the default Foundry unconscious icon
- PF2e default Condition mapping is now sorted alphabetically (thanks to @trey#9048)

## [0.9.4] - 2020-02-24
### Fixed
- Resolved Concentrator token detection bug
- Concentrator no longer fires on non-Concentration spells

## [0.9.3] - 2020-02-23
### Added
- Concentrator now supports spells cast from D&D Beyond using [Beyond20](https://beyond20.here-for-more.info/) by @kakaroto
- Concentrator now includes a setting to notify if a second Concentration spell is cast while the caster is already Concentrating on a spell. The options are: "None" (no notification), "GM Only" (whisper notification to GMs) and "All" (create general chat message)

## [0.9.2] - 2020-02-23
### Added
- Concentrator now includes a setting to automatically add the Concentrating status if you cast a Concentration spell

## [0.9.1] - 2020-02-23
### Fixed
- Concentrator now correctly calculates DC when damage > 10. Math is hard.

### Changed
- Incremented previous release from v0.8.2 to v0.9.0 due to magnitude

## [0.9.0] - 2020-02-23
### Added
- Concentration Checks -- allows a forced Concentration check when a token or actor takes damage. Thanks @jacobmcauley for this awesome feature! (D&D5e only at this time)

### Changed
- Moved attribution for contributors from the manifest to the README to avoid confusion

### Fixed
- Fixed a bug where panning/selecting tokens would select temporary combatants
- Improved logic around the Update Actor hook

## [0.8.1] - 2020-02-18
### Added
- Hide NPC Names now hides NPC names in the Character and Token Artwork popouts

### Fixed
- Fixed a bug where the Condition Lab button would fail to load due to long scene load times.

## [0.8.0] - 2020-02-15
### Added
- Add Temporary Combatants to the Combat Tracker to track things like Lair Actions or short-lived combatants
- Quick Edit Token Resource from Combat Tracker to quickly edit Combatant health during combat
- Roll Initiative from Character Sheet (limited system support)

### Changed
- Hide NPC Names now correctly hides names buried in chat message contents (Case-insensitive). NOTE: Hide NPC Names *may* break other modules that attach listeners to chat messages. If you are experiencing issues with behaviour related to chat messages try disabling Hide NPC Names.

## [0.7.9] - 2020-01-22
### Fixed
- Mark Injured/Dead not working for Actors with linked tokens
- Condition Lab button appearing before setting is enabled

## [0.7.8] - 2020-01-20
### Fixed
- Mark Injured/Dead not detecting the user correctly

## [0.7.7] - 2020-01-18
### Added
- Support for Foundry VTT 0.4.5

## Changed
- Reroll Initiative has been improved to be more efficient
- Updated the Experience Awarded chat message to display the total XP awarded

### Fixed
- Mark Dead in Tracker now correctly only fires for the GM
- Enhanced Conditions no longer outputs multiple chat messages for the same condition add/remove
- Enabling Reroll Initiative and Select Token caused only player-owned tokens to be selected on round change when initiative was being rerolled

## [0.7.2] - 2020-01-17
### Added
- Support for Foundry VTT 0.4.4 (thanks to tposney#1462 on discord)

### Changed
- Changed Condition output in chat to come from "Condition Lab" instead of the token

## Fixed
- Logic in Mighty Summoner functionality

## [pre-0.7.2] - Ancient History
- Stuff happened
- Here be dragons
