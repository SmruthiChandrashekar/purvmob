# Puravankara Grievance & Policy Mobile App (React Native)

A modern, cross-platform mobile application for Puravankara employees, residents, vendors, and contractors. Built with **React Native** and **Expo SDK 52**, seamlessly interfacing with the Supabase database and FastAPI RAG AI backend.

---

## 🌟 Key Features

1. **Policy AI Assistant (RAG)**
   - Ask complex compliance questions (POSH, internal HR, grievance timelines).
   - Real-time policy citations with document and page numbers.
   - Severity auto-detection with one-tap formal grievance lodging.
2. **Lodge Grievance Portal**
   - Multi-category support: Internal (Employee), External (Customer / Vendor), Contractor.
   - Whistleblower / Anonymous filing option with complete privacy protection.
   - Live character validation and instant tracking ID generation.
3. **Real-time Status Tracking**
   - Step-by-step progress timeline: Submitted ➔ Triaged ➔ Investigating ➔ Resolved.
   - Department assignment, severity tags, and SLA countdowns.
   - Saved recent tracking history for anonymous reporters.
4. **Supabase Authentication & Settings**
   - Secure session persistence with `@react-native-async-storage/async-storage`.
   - Dynamic backend endpoint switching (`10.0.2.2:8000` for Android emulator, `localhost:8000` for iOS, or custom LAN IP for physical Expo Go).
   - In-app connection health ping.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Start the Development Server
```bash
npx expo start
```

### 3. Run on Target Platform
- **Android Emulator**: Press `a` in the terminal (or run `npm run android`).
- **iOS Simulator** (macOS): Press `i` in the terminal (or run `npm run ios`).
- **Physical Phone**: Install the free **Expo Go** app from the App Store / Google Play Store and scan the terminal QR code.

---

## ⚙️ Backend Connectivity
- **Android Emulator**: Connects to host FastAPI server via `http://10.0.2.2:8000`.
- **iOS Simulator**: Connects via `http://localhost:8000`.
- **Physical Phone**: Enter your computer's local Wi-Fi IP (e.g. `http://192.168.1.15:8000`) in the app's **Settings** tab.
