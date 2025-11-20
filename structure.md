# Project Structure: Hops-Pins

This file is an explicit, text-based layout of the repository and its main files so you can quickly understand the project's organization.

Root files
```
app.json
package.json
package-lock.json
README.md
.gitignore
babel.config.js
metro.config.js
eslint.config.js
tailwind.config.js
tsconfig.json
nativewind.env.d.ts
nativewind-env.d.ts
structure.md        # (this file)
```

.vscode/
```
settings.json
extensions.json
```

app/ (source)
```
app/_layout.tsx                 # App-level layout (root router entry)
app/global.css                  # Global styles

app/(tabs)/                     # File-based tab group (likely Expo Router)
  _layout.tsx                   # Layout for tab group
  index.tsx                     # Main/home tab
  search.tsx                    # Search tab
  profile.tsx                   # Profile tab
  history.tsx                   # History tab

app/components/                 # Reusable components
  logDrink.tsx                  # Modal/form used to log a drink for a pub (records beer, quantity, notes)
  mapContainer.tsx              # Map view wrapper that renders a map and markers for nearby pubs
  pubCard.tsx                   # Small card component showing pub details (name, distance, thumbnail)
  searchTab.tsx                 # Search UI used inside the Search tab (query input + results list)

app/pubs/
  [id].tsx                      # Dynamic route for pub details
```

hooks/
```
useBeer.ts                       # Hook for beer-related data/logic
usePubs.ts                       # Hook to fetch/list pubs
```

lib/
```
lib/firebase.ts                  # Firebase initialization/wrapper
lib/api/
  beer.ts                        # Beer-related API helpers
  pubs.ts                        # Pubs API helpers
  places.ts                      # Places API helpers (geocoding / maps)
```

assets/
````markdown
# Project Structure: Hops-Pins

This file is an explicit, text-based layout of the repository and its main files so you can quickly understand the project's organization.

Root files
```
app.json
package.json
package-lock.json
README.md
.gitignore
babel.config.js
metro.config.js
eslint.config.js
tailwind.config.js
tsconfig.json
expo-env.d.ts
nativewind.env.d.ts
nativewind-env.d.ts
structure.md        # (this file)
```

.vscode/
```
settings.json
extensions.json
```

app/ (source)
```
app/_layout.tsx                 # App-level layout (root router entry)
app/global.css                  # Global styles

app/(tabs)/                     # File-based tab group (likely Expo Router)
  _layout.tsx                   # Layout for tab group
  index.tsx                     # Main/home tab
  search.tsx                    # Search tab
  profile.tsx                   # Profile tab
  history.tsx                   # History tab
  testFirebase.tsx              # ad-hoc/test screen for Firebase checks

app/components/                 # Reusable components
  ErrorDisplay.tsx              # Simple component to show error messages
  LoadingSpinner.tsx            # Small loading spinner
  logDrink.tsx                  # Modal/form used to log a drink for a pub (records beer, quantity, notes)
  mapContainer.tsx              # Map view wrapper that renders a map and markers for nearby pubs
  pubCard.tsx                   # Small card component showing pub details (name, distance, thumbnail)
  searchTab.tsx                 # Search UI used inside the Search tab (query input + results list)

app/pubs/
  [id].tsx                      # Dynamic route for pub details
```

hooks/
```
useBeer.ts                       # Hook for beer-related data/logic (fetch, caching helpers)
usePubs.ts                       # Hook to fetch and filter nearby pubs
```

lib/
```
lib/firebase.ts                  # Firebase initialization and helpers (auth, firestore)
lib/errorHandler.ts              # Centralized error-handling utilities
lib/api/
  beer.ts                        # Beer-related API helpers
  pubs.ts                        # Pubs API helpers (CRUD + queries)
  places.ts                      # Places / maps API helpers (geocoding, distance)
```

assets/
```
assets/images/
  icon.png
  favicon.png
  splash-icon.png
  react-logo.png
  react-logo@2x.png
  react-logo@3x.png
  partial-react-logo.png
  android-icon-foreground.png
  android-icon-background.png
  android-icon-monochrome.png
  temp/
    tempMap.png
```

scripts/
```
scripts/tree.sh                  # Helper to print a tree snapshot of the repo
```

Notes & Observations
- Routing and structure:
  - The presence of `app/_layout.tsx` and the `(tabs)` folder indicates a file-based routing system (Expo Router or similar).
  - `app/pubs/[id].tsx` is a dynamic route for individual pub pages.

- Styling:
  - `tailwind.config.js` and `nativewind*.d.ts` indicate Tailwind CSS / NativeWind is used for styling.

- Platform:
  - The configuration and asset naming (icons, splash) suggest this is an Expo-managed React Native app.

Repository snapshot (generated by `./scripts/tree.sh`)
```
.
├── app
│   ├── components
│   │   ├── ErrorDisplay.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── logDrink.tsx
│   │   ├── mapContainer.tsx
│   │   ├── pubCard.tsx
│   │   └── searchTab.tsx
│   ├── global.css
│   ├── _layout.tsx
│   ├── pubs
│   │   └── [id].tsx
│   └── (tabs)
│       ├── history.tsx
│       ├── index.tsx
│       ├── _layout.tsx
│       ├── profile.tsx
│       ├── search.tsx
│       └── testFirebase.tsx
├── app.json
├── assets
│   └── images
│       ├── android-icon-background.png
│       ├── android-icon-foreground.png
│       ├── android-icon-monochrome.png
│       ├── favicon.png
│       ├── icon.png
│       ├── partial-react-logo.png
│       ├── react-logo@2x.png
│       ├── react-logo@3x.png
│       ├── react-logo.png
│       ├── splash-icon.png
│       └── temp
│           └── tempMap.png
├── babel.config.js
├── .env
├── eslint.config.js
├── .expo
│   ├── devices.json
│   ├── README.md
│   └── types
│       └── router.d.ts
├── expo-env.d.ts
├── .gitignore
├── hooks
│   ├── useBeer.ts
│   └── usePubs.ts
├── lib
│   ├── api
│   │   ├── beer.ts
│   │   ├── places.ts
│   │   └── pubs.ts
│   ├── errorHandler.ts
│   └── firebase.ts
├── metro.config.js
├── nativewind-env.d.ts
├── nativewind.env.d.ts
├── package.json
├── package-lock.json
├── README.md
├── scripts
│   └── tree.sh
├── structure.md
├── tailwind.config.js
├── tsconfig.json
└── .vscode
    ├── extensions.json
    └── settings.json

15 directories, 54 files
```

How to use this file
- Keep `structure.md` as a quick reference for the repository tree and to help onboard contributors.
- If you want, I can also:
  - Expand each file with a short description and example usage.
  - Commit these changes and open a PR with the updated documentation.

---
Generated on: 2025-11-20

````
