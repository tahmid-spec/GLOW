# Glow — A Little Space, Just for Us ♡

> A polished and minimal two-person connection app for iOS & Android. Draw live doodles on a shared canvas, exchange 10-second walkie-talkie voice notes, pair securely via cryptographic invitation codes, and customize interactive widgets.

---

## ✨ Features

- **Single-Use Cryptographic Pairing**: Connect 2 people using an 8-character invitation code (e.g. `7F3K-9D2P`) with 10-minute auto-expiry, QR code sharing, and one-tap approval.
- **Shared Live Doodle Canvas**: Real-time collaborative canvas with neon pastel glow strokes, multi-brush sizes, undo/redo, cute stickers, and quick love notes.
- **Walkie-Talkie Voice Notes**: 10-second voice notes with tactile sound effects, animated dynamic waveforms, listened status receipts, and instant hold-to-talk.
- **Interactive Home Screen Widget**: Compact dual widget featuring the latest doodle artwork alongside the walkie-talkie player and mic.
- **Two-Person Simulation Mode**: Switch between profiles (`Tahmid` ⇄ `Rafi`) or view both phones side-by-side to test connection and real-time interaction.
- **PWA & Native APK Ready**: Ready to install directly from the browser or build into a native Android `.apk`.

---

## 🚀 How to Push to GitHub

Follow these quick steps to push this code to your own GitHub repository:

### 1. Initialize Git & Commit
Open your terminal in this project folder:

```bash
git init
git add .
git commit -m "feat: initial commit for Glow app"
```

### 2. Connect to GitHub
Create a new empty repository on [GitHub](https://github.com/new) (name it `glow-app`), then link and push:

```bash
# Rename default branch to main
git branch -M main

# Add your GitHub repository as origin (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/glow-app.git

# Push code to GitHub
git push -u origin main
```

---

## 📱 How to Get the Android APK (2 Methods)

### Method 1: Automatic GitHub Actions Build (Zero Setup!)

This repository comes pre-configured with a GitHub Actions workflow in `.github/workflows/build-apk.yml`.

1. **Push your code to GitHub** (as shown above).
2. Go to your repository on GitHub and click the **Actions** tab.
3. You will see the **Build Android APK** workflow automatically running.
4. Once completed (typically 2-3 minutes), click on the completed workflow run.
5. Scroll down to the **Artifacts** section at the bottom.
6. Click **`Glow-Android-Debug-APK`** to download the zip file.
7. Extract the zip file to get `app-debug.apk` and transfer/open it on your Android phone to install!

---

### Method 2: Build Locally using Capacitor & Android Studio

If you want to build or test the APK locally on your machine:

#### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+)
- [Android Studio](https://developer.android.com/studio) with Android SDK installed

#### Build Steps
```bash
# 1. Install dependencies
npm install

# 2. Build the web app
npm run build

# 3. Add the Android platform (first time only)
npx cap add android

# 4. Sync web assets into the Android native project
npx cap sync android

# 5. Open in Android Studio to build & run on your phone
npx cap open android
```

Or build the debug APK directly via command line:
```bash
cd android
./gradlew assembleDebug
```
Your compiled APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📲 Method 3: Instant Phone Install (PWA)

You don't even need an APK to install Glow on phones! Glow is configured as a Progressive Web App:

- **Android**: Open the URL in Google Chrome, tap the `⋮` menu, and tap **"Install app"** or **"Add to Home screen"**.
- **iPhone / iOS**: Open the URL in Safari, tap the **Share** button (box with arrow), and tap **"Add to Home Screen"**.

The app runs in full-screen standalone mode with its own app icon and offline support.

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Audio Engine**: Web Audio API + MediaRecorder (10s auto-stop & tactile chirps)
- **Native Wrapper**: Capacitor (Android native app bridge)
- **CI/CD**: GitHub Actions automated APK compilation

---

## 🔒 Privacy & Pairing

Glow is strictly designed for two people. No third-party data collection. All paired sessions, doodles, voice recordings, and widget preferences are kept private between the two connected partners.
