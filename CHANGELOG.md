# Changelog

---

## [0.2.1] - 2025-09-22

### UI Foundation & Theme
- Centralised Chakra styling in `src/theme.js` (consistent spacing, focus rings, tooltips, field styling) so buttons, inputs, and selects share one visual language.
- Removed inline select hacks by relying on theme overrides.

### Layout & Navigation
- Introduced `AppLayout` with responsive max-width containers and a two-column shell (search + detail) and added a friendly empty state on first load.
- Added breadcrumb/back affordance and harmonised spacing within the detail view for easier navigation.

### Item Explorer Enhancements
- Refined `ItemSearch` spacing, added loading and no-results states, stable card highlighting, and keyboard-friendly interactions.

### Augment Planner Updates
- Rebuilt the calculator into tabs (Configuration / Materials / Summary) and added preset save/reset support.
- Enhanced inputs with tooltips, helper text, validation, and maintained the full +0 starting range.
- Polished the summary display with icons, headings, and clearer hierarchy.

### Cleanup
- Removed legacy inline styles, obsolete imports, and tightened component exports under `src/features/items`.
- Ensured only augmentable items surface through the shared helper and kept lists accessible with deterministic keys.

---
## [0.1.3] - 2025-05-22

### 🧮 Augment Calculator Enhancements
- **Summary UI refactor**:
  - Material lines now display:
    - `Log: 900 (Estimated) / 1000 (Max)`
    - `Gold: 169,200 🪙 (estimated) / 188,000 🪙 (max)`
  - Rounded values (no more decimals)
  - Clarified structure and improved alignment

- **Dual cost tracking**:
  - Clearly separated display for **estimated cost** (with critical/quick study effects)
  - And **maximum cost** (worst case with no procs)

- Added the 🪙 emoji to better represent currency visually

### 🛑 Item Detail – Augmentability Check
- Non-augmentable items (missing `craft.augmenting`) no longer display the augment calculator
- Instead, a message is shown:
  > “This item is not augmentable.”

### 🔧 Technical Fixes
- Fixed missing imports (`useMemo`, Chakra components) in `Summary.jsx`
- Rounded material quantities using `Math.round()` for accurate display and cost

---

## [0.1.2] - 2025-05-21

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

## [0.1.1] - 2025-05-18

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

## [0.1.0] - 2025-05-17

- Initial public release
- Implemented `ItemSearch` to browse augmentable items
- Clicking an item opens a detail panel
- Using `combined_items.json` as initial item database




