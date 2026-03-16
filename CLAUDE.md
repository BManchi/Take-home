# Copilot Money Clone — Architecture Rules & Agent Boundaries

## Project Overview
React Native / Expo clone of Copilot Money. Dark-only theme. TypeScript throughout.
PRD is at `../docs/PRD.md`. Help center knowledge base is at `../docs/help-center/`.

## Tech Stack
- **Expo SDK 55** + **React Native 0.83** + **React 19**
- **expo-router v4** (file-based routing, scheme: `copilot-clone`)
- **NativeWind v4** for styling (Tailwind in RN)
- **Zustand** (in-memory stores, no persistence in current scaffold)
- **Drizzle ORM** + **expo-sqlite** (schema defined, not wired to stores yet)
- **react-native-reanimated v4** + **react-native-gesture-handler**

## Directory Structure
```
app/              expo-router pages (tabs + modals)
src/
  __mocks__/      static mock data arrays (read-only source of truth)
  database/       Drizzle schema, client, seed (SQLite, not yet active)
  hooks/          derived-data hooks — the PRIMARY API layer for screens
  stores/         Zustand stores pre-loaded with mock data
  theme/          colors.ts — all design tokens + utility color fns
  types/          TypeScript interfaces only (no logic)
  components/     reusable UI (currently empty subdirs, to be built out)
```

## Architectural Rules

### Data Flow (strict, do not violate)
```
__mocks__  →  stores  →  hooks  →  screens / components
```
1. **Screens and components MUST only call hooks** — never import stores or mocks directly.
2. **Hooks are the computation layer** — all filtering, grouping, aggregation happens here.
3. **Stores hold raw state** — they do NOT compute derived data; they expose actions only.
4. **Mocks are static** — do not mutate mock arrays; stores may diverge from them via actions.

### Styling
- Use `StyleSheet`-style inline objects (current pattern) OR NativeWind Tailwind classes.
- Do NOT mix both in the same component.
- All color values must come from `src/theme/colors.ts` — never hardcode hex values.
- Dark mode only — no light mode variants needed.

### Navigation
- All routes live under `app/`. Bottom sheets are NOT separate routes.
- Tab screens: `app/(tabs)/index.tsx` (Dashboard), `categories.tsx`, `transactions.tsx`, `accounts.tsx`, `recurrings.tsx`
- Future modals: `app/modals/` with `presentation: 'modal'` stack option.

### Components (to be implemented)
Place components in `src/components/` following this structure:
```
src/components/
  cards/          RecurringCard, CategoryRow, TransactionRow, AccountRow
  charts/         SpendingLineChart, NetWorthChart, CategorySummaryChart
  sheets/         TransactionDetailSheet, CategoryDetailSheet, CreateRecurringSheet
  common/         CategoryProgressBar, DotIndicator, TypeBadge, FilterChipRow
```

## Known Constraints

### react-native-mmkv
Installed but NOT imported anywhere. MMKV requires a **native dev build** (not Expo Go).
To enable persistence: `npx expo prebuild`, then add MMKV middleware to Zustand stores.

### react-native-gifted-charts / react-native-svg
Chart placeholders are visible in Dashboard and Accounts screens (marked `TODO`).
Implement `SpendingLineChart` and `NetWorthChart` components using `react-native-gifted-charts`.

### Drizzle / SQLite
Schema is defined in `src/database/schema.ts`. Client in `src/database/client.ts`.
Seed function in `src/database/seed.ts`. Currently NOT connected to Zustand stores.
To wire up: call `seedDatabase()` in root layout, then update stores to query Drizzle instead of mocks.

### expo-router v4 + TypeScript
Typed routes enabled (`"typedRoutes": true` in app.json). The `nativewind-env.d.ts` reference must stay in `tsconfig.json`.

## Running the App
```bash
cd copilot-clone
npx expo start          # Expo Go (limited — no MMKV, no native modules)
npx expo run:ios        # Simulator (requires Xcode)
npx expo run:android    # Emulator (requires Android Studio)
```

## Key Files — Do Not Break
| File | Why it matters |
|------|---------------|
| `babel.config.js` | NativeWind jsxImportSource + reanimated plugin (must be last) |
| `metro.config.js` | withNativeWind wrapper required for Tailwind CSS processing |
| `app/_layout.tsx` | GestureHandlerRootView, font loading, SplashScreen |
| `src/theme/colors.ts` | Single source of truth for all colors |
| `tsconfig.json` | Path alias `@/*` → `src/*`, nativewind-env.d.ts include |

## Agent Boundaries
- **Safe to modify**: `app/(tabs)/*.tsx`, `src/components/**`, `src/hooks/*.ts`
- **Modify carefully**: `src/stores/*.ts` (actions only, don't remove mock preloading)
- **Modify with full context**: `babel.config.js`, `metro.config.js`, `app.json`
- **Do not modify without reason**: `src/types/*.ts`, `src/__mocks__/*.ts`, `src/theme/colors.ts`
- **Do not delete**: `nativewind-env.d.ts`, `global.css`, `tailwind.config.js`
