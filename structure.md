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

Notes & Observations
- Routing and structure:
  - The presence of `app/_layout.tsx` and the `(tabs)` folder indicates a file-based routing system (Expo Router or similar).
  - `app/pubs/[id].tsx` is a dynamic route for individual pub pages.

- Styling:
  - `tailwind.config.js` and `nativewind*.d.ts` indicate Tailwind CSS / NativeWind is used for styling.

- Platform:
  - The configuration and asset naming (icons, splash) suggest this is an Expo-managed React Native app.

How to use this file
- Keep `structure.md` as a quick reference for the repository tree and to help onboard contributors.
- If you want, I can also:
  - Generate a more detailed `STRUCTURE.md` that includes short file summaries for each component.
  - Add a script to print a tree view from the repo.

---
Generated on: 2025-11-20
