# Changelog

## [Unreleased]
- Compendium support for Condition Lab
- Combatant stats in Combat Tracker
- Hide NPC Names in Artwork "Share With Players"

## [0.8.0] - 2020-02-15
### Added
- Add Temporary Combatants to the Combat Tracker to track things like Lair Actions or short-lived combatants
- Quick Edit Token Resource from Combat Tracker to quickly edit Combatant health during combat
- Roll Initiative from Character Sheet (limited system support)

### Changed
- Hide NPC Names now correctly hides names buried in chat message contents (Case-insensitive). NOTE: Hide NPC Names *may* break other modules that attach listeners to chat messages. If you are experiencing issues with behaviour related to chat messages try disabling Hide NPC Names.

## [0.7.9] - 2020-01-22
### Changed
- FIXED: Mark Injured/Dead not working for Actors with linked tokens
- FIXED: Condition Lab button appearing before setting is enabled

## [0.7.8] - 2020-01-20
### Changed
- FIXED: Mark Injured/Dead not detecting the user correctly

## [0.7.7] - 2020-01-18
### Added
- Support for Foundry VTT 0.4.5

### Changed
- FIXED: Mark Dead in Tracker now correctly only fires for the GM
- FIXED: Enhanced Conditions no longer outputs multiple chat messages for the same condition add/remove
- FIXED: Enabling Reroll Initiative and Select Token caused only player-owned tokens to be selected on round change when initiative was being rerolled
- Reroll Initiative has been improved to be more efficient
- Updated the Experience Awarded chat message to display the total XP awarded

## [0.7.2] - 2020-01-17
### Added
- Support for Foundry VTT 0.4.4 (thanks to tposney#1462 on discord)

### Changed
- Fixed some logic in Mighty Summoner functionality
- Changed Condition output in chat to come from "Condition Lab" instead of the token

