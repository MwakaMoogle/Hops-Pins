# Hops & Pins 🍻

A social pub-tracking mobile app built with React Native and Expo. Discover, log, and share your pub experiences with friends.

## Key features

- 🗺️ Interactive map with pub locations
- 📝 Log visits and rate drinks
- 👥 Social features and profiles
- ⭐ Personal visit history and statistics
- 🔍 Search and discover pubs

## Tech stack

- Frontend: React Native + Expo (Expo Router)
- Navigation: File-based routing (app/)
- Backend: Firebase (Firestore & Auth)
- Maps: React Native Maps (plus Places API helpers)
- Styling: Tailwind / NativeWind
- State: React Context + hooks

## Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- Expo CLI (optional; `npx` can be used)
- Android Studio or Xcode (for emulators), but you can use Expo Go

## Quick setup

1. Clone and install

```bash
git clone https://github.com/MwakaMoogle/Hops-Pins.git
cd hops-and-pins
npm install
# or
yarn install
```

2. Environment

- Copy `.env.example` to `.env` and fill in the public keys used by the app (Firebase, Maps/Places API, RapidAPI, etc.)

## Start the dev server (recommended)

You can start Expo in several ways depending on network and tunneling needs:

- Default (metro + local LAN):

```bash
npx expo start
```

- Recommended if you need a stable connection from a physical device or remote debugger (tunnel + clear cache):

```bash
npx expo start --tunnel --clear
```

- Or specify a port explicitly and use tunnel:

```bash
npx expo start --port 8081 --tunnel
```

## Notes

- NativeWind: `app/_layout.tsx` imports `app/global.css` and the project includes the required NativeWind config. If styling appears missing, ensure the Metro/Babel setup for NativeWind is intact and restart the dev server with `--clear`.
- Firebase: initialization is in `lib/firebase.ts`. The project uses Firestore and Auth; ensure your `.env` values are correct.
- If you run into module resolution issues (Metro bundler), try clearing caches and restarting Expo with the `--clear` flag.

## Where to look in the repo

- App entry & routes: `app/` (file-based routes)
- Components: `app/components/`
- Hooks: `hooks/` (useAuth, useBeer, usePubs)
- API helpers: `lib/api/` (beer, pubs, places)
- Firebase setup: `lib/firebase.ts`
- Tailwind + NativeWind: `tailwind.config.js`, `babel.config.js`, `metro.config.js`, `app/global.css`

## Run a TypeScript check

```bash
npx tsc -p tsconfig.json --noEmit
```
