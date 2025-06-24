# Idlescape Augment Viewer

A fan-made web tool to explore and analyze equipment in [Idlescape](https://idlescape.com), focused on augmentable items.

This project allows players to browse in-game equipment, view all relevant stats, and calculate potential augmentation costs or benefits — with a compact, readable layout inspired by the in-game tooltips.

> **Disclaimer**: This project is not affiliated with or endorsed by Idlescape. All data is manually curated or scraped from public sources such as the [Idlescape Wiki](https://wiki.idlescape.com).

---

## 🚀 Features

- 🔍 **Item Search** – Quickly find any augmentable item by name
- 📊 **Full Stat Display** – View all available stats including:
  - Offensive & defensive stats
  - Affinity and accuracy modifiers
  - Critical chance and hit multipliers
  - Augment bonuses and attack speed
- ⚙️ **Data-Driven** – Uses a single `combined_items.json` file for all item logic
- 💡 **Responsive UI** – Dark mode, readable layout, mobile-friendly

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/idlescape-augment-viewer.git
cd idlescape-augment-viewer

# Install dependencies
npm install

# Start the development server
npm run dev
```

> Requires [Node.js](https://nodejs.org/) 16+

---

## 🛠 Development Notes

- Built with **React** + **Chakra UI**
- State and logic are minimal; UI-first focus
- Item stats are parsed from a preprocessed JSON (can be regenerated via scripts or scraping tools)

---

## 📁 File Structure

```
src/
├── components/
│   ├── AugmentCalculator/
│   ├── ItemDetail/
│   ├── ItemSearch/
│   └── common/
├── data/
├── hooks/
├── App.jsx
├── main.jsx
```

---

## 📜 License

This project is open-source under the MIT License.  
All Idlescape content belongs to its respective creators.

---

## 💬 Contact

Want to contribute or report an issue?

- Discord: [Bravenorth#0001](https://discordapp.com/users/134398029317799936)
- GitHub Issues: [Create Issue](https://github.com/yourusername/idlescape-augment-viewer/issues)
