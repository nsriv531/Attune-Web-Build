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

The setup script checks your Node version, creates `.env.local`, warns about missing fonts, and runs `npm install`.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 20.17.0 | https://nodejs.org (download LTS) |
| npm | ≥ 10.0.0 | comes with Node |
| Expo Go | latest | App Store / Play Store on your phone |

---

## Environment variables

After running setup, open `.env.local` and fill in your Convex and Clerk credentials:

```env
CONVEX_DEPLOYMENT_URL=https://your-deployment-url.convex.cloud
EXPO_PUBLIC_CONVEX_URL=https://your-deployment-url.convex.cloud
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## Fonts (optional)

The app falls back to system fonts if these aren't present, but the designed look uses:

- [DM Sans](https://fonts.google.com/specimen/DM+Sans) → `assets/fonts/DMSans-Regular.ttf`, `DMSans-Medium.ttf`, `DMSans-SemiBold.ttf`  
- [DM Mono](https://fonts.google.com/specimen/DM+Mono) → `assets/fonts/DMMono-Regular.ttf`, `DMMono-Medium.ttf`

Download both families, unzip, and copy the `.ttf` files into `assets/fonts/`.

---

## Run commands

```bash
npm run convex:dev       # Start Convex backend in dev mode
npx expo start           # QR code — scan with Expo Go on your phone
npx expo start --web     # Opens in browser (fastest way to preview)
```

---

## Project structure (New Convex Architecture)

```
convex/
  schema.ts                New relational schema (Users, Avatars, Sessions, etc.)
  users.ts                 Clerk auth integration & profile management
  sessions.ts              Session logic (XP & Focus Score calculations)
  subscriptions.ts         IAP tracking (iOS/Android)
  insights.ts              AI-powered productivity metrics
  feedback.ts              Post-session user ratings
```

---

## Convex & Clerk Setup

1. **Convex:** Run `npm run convex:dev`. This will prompt you to log in and create a project.
2. **Clerk:**
   - Create a JWT Template named `convex`.
   - Set the `aud` (audience) claim to `convex`.
   - Copy the Issuer URL to `convex/auth.config.ts`.
3. **IAP & Spotify:** Add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` to your Convex dashboard environment variables.

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
