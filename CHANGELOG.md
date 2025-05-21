# Changelog

---

## [1.0.2] - 2025-05-21

### UI / UX Enhancements
- Completely revamped `ItemStatTooltip` layout for better readability:
  - Sections now arranged in multiple responsive columns using `Flex` wrapping
  - Minimum width preserved to ensure consistent alignment across stat blocks
- Improved number formatting:
  - Removed unnecessary "+" for:
    - `Attack Speed` (now displayed as `3.1s`)
    - `Required Level` and flat stats like `strength`
  - Kept `+` sign for relative stats (e.g. affinities, bonuses)
  - All numeric values now consistently aligned right for clean vertical scan
- Visual refinements:
  - Hover effect (`bg: gray.700`) on table rows for better feedback
  - Monospace font applied for all numeric cells
  - Table layout now fixed for perfect alignment between keys and values

### Technical Refactors
- Extracted stat rendering logic into clean modular helpers:
  - `formatStatValue()` — handles sign, suffix, and styling
  - `prepareTableRows()` — flattens nested stats and filters out noise
- Added per-section control (`forceSign`) to toggle the sign logic dynamically

### Augment Calculator Rework
- Refactored `AugmentCalculator.jsx` into modular components:
  - `Main.jsx`, `LevelSelector.jsx`, `CounterInput.jsx`, `MaterialConfig.jsx`, `LevelTable.jsx`, `Summary.jsx`
- New folder structure under `src/components/AugmentCalculator/` for clean separation
- Rewired `ItemDetail.jsx` to import the new composed component
- Added `index.js` export for easy import

### New Functional Features
- Augment Time Estimator:
  - User-defined `Time per counter` in seconds (supports decimals like `2.5`)
  - `Critical augment chance (%)` field, reduces estimated time on proc (e.g. 10% chance to gain a +2)
  - `Quick Study` level (0–20), simulates progressive chances to skip counters (4% per level up to 80%)
  - Formula: estimated time = `effective counters × counterTime`
- Improved numeric field handling:
  - `CounterInput` now accepts and parses floating values with `.` or `,` (e.g. `10.5`, `10,5`)
  - Replaced Chakra's `NumberInput` with custom `Input + parseFloat` for better control

---

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
