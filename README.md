# VertaField

Mobile app for tracking agricultural transport quality — routes, freshness, damage, and analytics. Built as a **Progressive Web App (PWA)** and wrapped with **Capacitor** for Android and iOS.

## Features

- Dashboard with shipments, distance, quality, and spoilage metrics
- 3-step transport logging form
- Searchable records with quality filters
- Analytics: scatter plot, correlation, product volumes, route summary
- Offline-capable (service worker + localStorage)
- Installable on phone home screen (PWA)
- Native Android/iOS builds via Capacitor

## Quick start (browser / PWA)

```bash
npm install
npm start
```

Open **http://localhost:3000** on your phone (same Wi‑Fi) or desktop. On Chrome/Edge Android or Safari iOS, use **Add to Home Screen** or the in-app **Install** banner.

## Build native mobile apps

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- **Android:** [Android Studio](https://developer.android.com/studio) + JDK 17
- **iOS (Mac only):** Xcode + CocoaPods

### Android APK

```bash
npm install
npx cap add android
npx cap sync
npx cap open android
```

In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**. Install the APK on a device or emulator.

### iOS

```bash
npm install
npx cap add ios
npx cap sync
npx cap open ios
```

Run from Xcode on a simulator or device (Apple Developer account required for physical devices).

## Project structure

```
Verta/
├── www/                 # Web app (served by Capacitor)
│   ├── index.html
│   ├── js/app.js
│   ├── manifest.json    # PWA manifest
│   ├── sw.js            # Service worker
│   └── icons/
├── capacitor.config.json
├── package.json
└── README.md
```

## Push to GitHub

Git is not available in all environments. On your PC:

### 1. Install Git

Download from [https://git-scm.com/download/win](https://git-scm.com/download/win) and restart your terminal.

### 2. Create a GitHub repository

1. Go to [https://github.com/new](https://github.com/new)
2. Repository name: `vertafield` (or your choice)
3. **Do not** add a README (this project already has one)
4. Click **Create repository**

### 3. Push from this folder

Replace `YOUR_USERNAME` with your GitHub username:

```powershell
cd "C:\Users\23dio\Downloads\Verta"
git init
git add .
git commit -m "Initial VertaField mobile app with Capacitor and PWA"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vertafield.git
git push -u origin main
```

If GitHub asks you to sign in, use a [Personal Access Token](https://github.com/settings/tokens) as the password, or sign in with [GitHub CLI](https://cli.github.com/):

```powershell
winget install GitHub.cli
gh auth login
gh repo create vertafield --public --source=. --remote=origin --push
```

### GitHub Pages (view in Chrome)

**Live app URL:** https://bonaobrarowen.github.io/VertaField/

The full app is in **`www/index.html`** (all HTML, CSS, and JavaScript in one file).

1. Open [Settings → Pages](https://github.com/Bonaobrarowen/VertaField/settings/pages)
2. Set **Source** to **GitHub Actions** (recommended), **or** “Deploy from branch” → branch `main` → folder **`/www`**
3. Do **not** use folder `/ (root)` — that shows the README instead of the app
4. Wait 1–2 minutes after deploy, then open the live URL above

## Data storage

Records are stored in the browser **localStorage** under key `vf_records_v1`. Sample data is seeded on first launch.

## License

MIT
