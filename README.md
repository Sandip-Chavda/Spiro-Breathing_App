# 🧘 Spiro

**A calm, guided breathing app for Android — built with Expo, Supabase, and a design language tied to the physiology of breath itself.**

<!--
  🖼️ POSTER / BANNER
  Replace the line below with your app banner/poster image.
  Recommended size: 1280x640 (2:1), stored at e.g. /assets/readme/banner.png
-->
<p align="center">
  <img src="./assets/readme/banner.png" alt="Spiro banner" width="100%" />
</p>

<p align="center">
  <img alt="Platform" src="https://img.shields.io/badge/platform-Android-3DDC84?logo=android&logoColor=white" />
  <img alt="Expo" src="https://img.shields.io/badge/Expo-SDK-000020?logo=expo&logoColor=white" />
  <img alt="React Native" src="https://img.shields.io/badge/React%20Native-Expo%20Router-61DAFB?logo=react&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg" />
  <img alt="Status" src="https://img.shields.io/badge/status-in%20development-yellow" />
</p>

<!--
  🎬 DEMO VIDEO
  GitHub renders an uploaded .mp4 as an inline player if you drag-drop it into
  an issue/PR/README edit on github.com and use the generated asset URL below.
  Alternatively, embed a YouTube thumbnail that links out to the full demo.
-->

## 🎬 Demo Video

<p align="center">
  <a href="REPLACE_WITH_YOUTUBE_OR_DEMO_LINK">
    <img src="./assets/readme/demo-thumbnail.png" alt="Will be Added Soon" width="70%" />
  </a>
</p>

---

## ✨ Overview

Spiro is a breathing and wellness app centered on a simple idea: **inhale cools, exhale warms, hold sits in stillness.** That physiological rhythm isn't just a feature — it's the entire visual and interaction language of the app, from the color of the breathing circle to the texture of its haptic feedback.

Built to be fully functional in **Expo Go** during development, with native-only features (in-app purchases, ads, OAuth) deliberately isolated to a final build phase — so the app stays testable and iterable for as long as possible before committing to a production build.

---

## 📱 Screenshots

<!--
  🖼️ SCREENSHOTS
  Replace each placeholder below with actual screenshots.
  Recommended: consistent device frame, same phone/resolution across all.
-->
<p align="center">
  <img src="./assets/readme/screenshot-onboarding.png" width="19%" />
  <img src="./assets/readme/screenshot-home.png" width="19%" />
  <img src="./assets/readme/screenshot-breathe.png" width="19%" />
  <img src="./assets/readme/screenshot-techniques.png" width="19%" />
  <img src="./assets/readme/screenshot-profile.png" width="19%" />
</p>

---

## 🎨 Design System — "Breath Temperature"

Every color in Spiro maps to a physiological phase of breathing, not an arbitrary palette choice.

| Token           | Hex       | Meaning                                        |
| --------------- | --------- | ---------------------------------------------- |
| 🔵 `skyBlue`    | `#3E7EFF` | Inhale phase · primary actions · active states |
| 🟠 `emberCoral` | `#FF7A59` | Exhale phase · secondary accents               |
| 🟣 `duskViolet` | `#7C6FEF` | Hold phase · premium markers                   |
| ⚪ `mistWhite`  | `#F6F8FB` | Canvas background                              |
| ⬜ `cloudPanel` | `#FFFFFF` | Cards, inputs, modals                          |
| ⚫ `inkNavy`    | `#16202E` | Primary text                                   |
| ◽ `driftGray`  | `#77879B` | Muted text, inactive icons                     |

**Typography:** Plus Jakarta Sans (display/headings) + Inter (body).

This logic extends beyond color — haptic feedback and sound cues follow the same three-phase identity (a rising pulse for inhale, a distinct double-tap for hold, a falling tone for exhale), so the _feel_ of the app is consistent whether experienced visually, aurally, or by touch alone.

---

## 🧩 Features

### Core Breathing Engine

- Real-time animated breathing guide with perfectly synced phase timing (inhale / hold / exhale / hold)
- 9 built-in techniques spanning calming, focus, sleep, and energizing use cases — each with full **benefits, how-to steps, precautions, and safety warnings**
- Custom routine builder with decimal-precision timing (Pro)
- Live "estimated total session time" that updates as round count changes
- Session lock — navigation is blocked mid-session so an active breathing session can't be accidentally interrupted or discarded

### Feel & Sound

- Distinct **haptic vibration patterns** per phase (short pulse / double-tap / long pulse) so sessions can be practiced eyes-closed
- Matching **audio cue system** with independent toggle
- In-app demo modals to preview both before committing to eyes-closed practice

### Progress & Habit Tracking

- Streak tracking with proper **local-timezone-safe** date logic
- GitHub-style consistency heatmap (Pro)
- Full session history, grouped by month, with per-session deletion (no bulk-clear, by design — protects the daily-limit integrity for both tiers)
- **Streak recovery system** — Pro users can recover up to 5 missed days free, with a scaling cost beyond that

### Accounts & Data

- Email/password authentication via Supabase, with Row-Level Security on every table
- Full cloud sync of sessions, streaks, routines, and preferences — with local caching for offline resilience
- One-time onboarding carousel (device-level) fully decoupled from per-account name collection — correctly re-triggers for new accounts without re-showing onboarding
- In-app **account deletion** (Play Store / App Store compliance requirement for any app offering account creation)

### Monetization (Free / Pro)

- Free tier: 3 core techniques, 20-round cap, 1 session/day, blurred analytics
- Pro tier: full technique library, unlimited rounds & sessions, custom routines, full analytics, streak recovery
- Dedicated `/upgrade` plans screen — architecture ready for RevenueCat + Google Play Billing integration

---

## 🛠️ Tech Stack

| Layer     | Choice                                                     |
| --------- | ---------------------------------------------------------- |
| Framework | [Expo](https://expo.dev) (Expo Router, Expo Go compatible) |
| Language  | TypeScript                                                 |
| Styling   | NativeWind (Tailwind for React Native)                     |
| State     | Zustand (with `persist` middleware)                        |
| Backend   | [Supabase](https://supabase.com) (Auth, Postgres, RLS)     |
| Animation | React Native Reanimated                                    |
| Audio     | `expo-audio`                                               |
| Haptics   | `expo-haptics` + `Vibration` API                           |
| Charts    | `react-native-chart-kit`                                   |
| Icons     | `lucide-react-native`                                      |

---

## 📂 Project Structure

```text
spiro/
├── src/
│   ├── app/
│   │   ├── _layout.tsx              # Root layout, auth provider, fonts
│   │   ├── index.tsx                # Auth/onboarding/name-setup routing logic
│   │   ├── onboarding.tsx           # 3-screen animated onboarding
│   │   ├── name-setup.tsx           # Post-auth, per-account name collection
│   │   ├── upgrade.tsx              # Pro plans screen
│   │   ├── history.tsx              # Full session history (grouped by month)
│   │   ├── techniques.tsx           # Full technique catalog
│   │   ├── privacy-policy.tsx
│   │   ├── terms-of-use.tsx
│   │   ├── technique/[id].tsx       # Technique detail + safety info
│   │   ├── (auth)/                  # Sign in / sign up
│   │   └── (tabs)/                  # Home, Breathe, Profile
│   ├── components/                  # Shared UI (modals, banners, rows)
│   ├── context/                     # AuthProvider
│   ├── data/                        # Static technique definitions
│   ├── hooks/                       # usePhaseSounds, etc.
│   ├── lib/                         # Supabase client
│   ├── store/                       # Zustand stores (session, settings, UI)
│   └── utils/                       # Date, UUID, haptics helpers
└── assets/
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- [Expo Go](https://expo.dev/go) app on an Android device (or emulator)
- A free [Supabase](https://supabase.com) project

### 1. Clone & Install

```bash
git clone https://github.com/Sandip-Chavda/Spiro-Breathing_App.git
cd Spiro-Breathing_App
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

> ⚠️ Never use the `service_role`/secret key here — only the publishable key belongs in client code.

### 3. Database Setup

Run the SQL migration in `supabase/schema.sql` (or the Supabase SQL Editor) to create the `profiles`, `sessions`, and `custom_routines` tables with Row-Level Security policies, plus the `delete_user()` function used for account deletion.

### 4. Run the App

```bash
npx expo start --clear
```

Scan the QR code with Expo Go.

---

## 🗺️ Future Roadmap

- [ ] RevenueCat + Google Play Billing integration (requires native build)
- [ ] Rewarded ads for free-tier bonus unlocks (requires native build)
- [ ] Stable deep links for email confirmation
- [ ] Google/Apple OAuth (not required for launch)
- [ ] Play Store submission

---

## ⚠️ A Note on Safety

Spiro includes precaution and warning content for every breathing technique, written to reflect known physiological effects of breathwork (e.g., lightheadedness from extended breath-holds or rapid breathing). This content is informational, not medical advice, and has not been reviewed by a licensed professional. If you're adapting this project for your own use, have relevant safety copy reviewed appropriately before shipping to real users.

---

## 🙏 Acknowledgments

- Technique imagery sourced from Pinterest/Unsplash — replace with licensed or original imagery before any commercial release
- Built with [Expo](https://expo.dev) and [Supabase](https://supabase.com)

---

## 📄 License

<!-- Replace with your actual license choice -->

This project is licensed under the MIT License — see [LICENSE](./LICENSE) for details.

---

<p align="center">
  Made with 🫁 by <strong>Sandip Chavda & Claude</strong>
</p>
