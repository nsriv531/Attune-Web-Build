<<<<<<< HEAD
# StudyLoop

A focus session app built on the **Cue → Focus → Reward → Reflection → Smart Suggestion** loop.  
Avatar companion (Sage), distraction detection, AI-powered study cycle insights.

---

## Clone and run in 3 commands

```bash
git clone https://github.com/YOUR_USERNAME/studyloop.git
cd studyloop
node scripts/setup.js
```

The setup script checks your Node version, creates `.env.local`, warns about missing fonts, and runs `npm install`. Then:

```bash
npx expo start
```

Scan the QR code with **Expo Go** (iOS App Store / Google Play Store) and you're running.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 20.17.0 | https://nodejs.org (download LTS) |
| npm | ≥ 10.0.0 | comes with Node |
| Expo Go | latest | App Store / Play Store on your phone |

> **Windows users** — use PowerShell or Windows Terminal. Run as Administrator if you hit permission errors.

---

## Environment variables

After running setup, open `.env.local` and fill in your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from [supabase.com](https://supabase.com) → your project → Settings → API.

The app runs in **offline mode** without these — Supabase calls are skipped gracefully.

---

## Fonts (optional)

The app falls back to system fonts if these aren't present, but the designed look uses:

- [DM Sans](https://fonts.google.com/specimen/DM+Sans) → `assets/fonts/DMSans-Regular.ttf`, `DMSans-Medium.ttf`, `DMSans-SemiBold.ttf`  
- [DM Mono](https://fonts.google.com/specimen/DM+Mono) → `assets/fonts/DMMono-Regular.ttf`, `DMMono-Medium.ttf`

Download both families, unzip, and copy the `.ttf` files into `assets/fonts/`.

---

## Run commands

```bash
npx expo start           # QR code — scan with Expo Go on your phone
npx expo start --web     # Opens in browser (fastest way to preview)
npx expo start --ios     # iOS Simulator (Mac + Xcode required)
npx expo start --android # Android Emulator (Android Studio required)
```

---

## Project structure

```
app/
  _layout.tsx              Root shell (fonts, navigation, QueryClient)
  (tabs)/
    index.tsx              Setup screen — pick subject, duration, sound
    session.tsx            Active session — timer ring + Sage overlay
    insights.tsx           AI heatmap + focus pattern insights
    profile.tsx            Avatar, XP, streak, session history
  reward.tsx               Post-session celebration modal

components/
  TimerRing.tsx            Reanimated SVG countdown (runs on UI thread)
  SageAvatar.tsx           Avatar with 4 animated states
  SageOverlay.tsx          Slide-in corner nudge widget
  HeatmapCanvas.tsx        7×4 weekly focus intensity grid
  StatCard.tsx             Reusable metric card

stores/
  sessionStore.ts          Session state machine + focus score algorithm
  userStore.ts             XP, streak, heatmap builder, AI suggestion cache

hooks/
  useTimer.ts              Countdown + AppState distraction detection

lib/
  supabase.ts              Supabase client + DB helpers
  claude.ts                AI suggestion fetcher (calls Edge Function)

constants/
  theme.ts                 All design tokens — colors, typography, spacing

supabase/
  schema.sql               Full DB schema — run in Supabase SQL editor
  functions/
    sage-suggestion/       Edge Function — proxies Claude API (server-side)
```

---

## Supabase setup (for full AI features)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → paste and run `supabase/schema.sql`
3. Add your URL and anon key to `.env.local`
4. Deploy the Edge Function:

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here
supabase functions deploy sage-suggestion
```

---

## Troubleshooting

**`npm install` fails on Windows**
```bash
npm install --ignore-scripts
```

**`expo` command not found**
```bash
npx expo start   # always use npx prefix
```

**Node version error**
Download Node LTS from https://nodejs.org — needs v20.17.0 or higher.

**Metro bundler port conflict**
```bash
npx expo start --port 8082
```

**App shows blank screen**
Press `r` in the terminal to reload, or shake your phone and tap "Reload".
=======
# react-native-app
>>>>>>> 63294e82514e4b1ca3dac237035aa3066d689f6b
