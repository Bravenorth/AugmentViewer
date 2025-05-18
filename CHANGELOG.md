# Changelog

## [1.0.1] - 2025-05-18

### Optimizations
- Refactored `combined_items.json`:
  - Now indexed by item ID
  - Simplified and better aligned with in-game exposed structure
  - Removed unreliable and redundant keys

- Stat system rework:
  - Proper filtering of null or negligible stats (`0`, `"0"`, `null`, etc.)
  - Fixed value conversion for:
    - `offensiveDamageAffinity` (e.g. `1.33` ➜ `+33%`)
    - `hitMults` (e.g. `1.2` ➜ `+20%`)
    - `offensiveCritical` (e.g. `0.025` ➜ `+2.5%`)

### Components
- New: `ItemStatTooltip`
  - Displays all item stats in clean, modular sections
  - Subcomponents:
    - `StatGroup` – generic stat renderer
    - `AttackSpeed` – shows attack speed when applicable
    - `AugmentationBonus` – handles augment-specific bonuses

- Integrated into `ItemDetail` (replaces legacy stat display)

### Layout (WIP)
- Iterated on UI layout:
  - Organized by section: core / offensive / defensive / augment
  - Switched between `SimpleGrid` and `Grid` to test compact formats
  - Styling and spacing refinements postponed for polishing later

---

## [1.0.0] - 2025-05-17

- Initial public release
- Implemented `ItemSearch` to browse augmentable items
- Clicking an item opens a detail panel
- Using `combined_items.json` as initial item database
