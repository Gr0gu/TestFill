# DevFill — QA Test Form Auto-Filler (Manifest V3)

DevFill is a standalone Chrome/Edge extension and web app designed for QA engineers and developers. It dynamically generates unique test emails with dates (e.g. `user+test18082026@company.com`) and automatically populates forms across websites.

---

## 🛠 Local Setup & Build Instructions

### Prerequisites
Make sure you have **Node.js (v18+)** and **npm** installed on your system.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
To launch the interactive simulator and configuration dashboard:
```bash
npm run dev
```
Open your browser at `http://localhost:3000` (or the port displayed in your terminal).

### 3. Build the Extension / Web App
To create a production build:
```bash
npm run build
```
This will compile TypeScript and bundle all assets into the `dist/` directory. All extension assets (`manifest.json`, `background.js`, `content.js`, `popup.html`, `options.html`, and `icons/`) are bundled into `dist/`.

---

## 🚀 Loading into Chrome / Edge / Brave

You have two simple ways to load DevFill into your browser:

### Option A: Load from the `dist/` folder (Recommended after build)
1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** in the top-left corner.
4. Select the **`dist`** folder generated after running `npm run build`.

### Option B: Load directly from project root (No build required for extension scripts)
1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the **root directory** of this repository (which contains `manifest.json`, `background.js`, and `content.js`).

---

## ⌨️ Default Shortcuts & Features
- **Auto-Fill Active Form:** `Alt + Shift + F`
- **Context Menu:** Right-click any form or input field → *⚡ Fill Form with Test Data (DevFill)*
- **Toolbar Popup:** Click the DevFill icon in your browser toolbar to copy the dynamic email or trigger instant autofill.
- **Customization:** Click the gear icon or go to Options to configure your base email, date formats (`DDMMYYYY`, `YYYYMMDD`, `YYYY-MM-DD`, `DD-MM-YYYY`), and custom name/address defaults.
