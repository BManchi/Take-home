Create a new Expo project for the Copilot Money clone. Use the PRD at docs/PRD.md
as the specification.

Setup requirements:
- npx create-expo-app@latest copilot-clone --template blank-typescript
- Install these exact dependencies:
  - nativewind@^4 + tailwindcss (styling)
  - @react-navigation/native + expo-router (navigation)
  - zustand + react-native-mmkv (state + persistence)
  - expo-sqlite + drizzle-orm + drizzle-kit (local DB)
  - react-native-gifted-charts (charts)
  - @gorhom/bottom-sheet + react-native-reanimated + react-native-gesture-handler
  - lucide-react-native (icons)
  - expo-font + @expo-google-fonts/inter (typography)

Project structure (create all folders and placeholder files):

src/
├── types/              # TypeScript interfaces from PRD (SHARED, read-only during build)
│   ├── transaction.ts
│   ├── category.ts
│   ├── account.ts
│   └── index.ts        # barrel export
├── __mocks__/          # Mock data from PRD as JSON
│   ├── transactions.ts
│   ├── categories.ts
│   ├── accounts.ts
│   └── index.ts
├── database/           # DrizzleORM schema + migrations
│   ├── schema.ts       # Tables matching TypeScript interfaces
│   ├── client.ts       # expo-sqlite + drizzle client init
│   └── seed.ts         # Seed function using mock data
├── stores/             # Zustand stores (one per feature)
│   ├── transactionStore.ts
│   ├── categoryStore.ts
│   ├── accountStore.ts
│   └── uiStore.ts      # Global UI state (selected tab, modals, filters)
├── hooks/              # Facade hooks (combine store + DB)
│   ├── useTransactions.ts
│   ├── useCategories.ts
│   ├── useAccounts.ts
│   └── useDashboard.ts
├── components/         # Reusable UI components
│   ├── charts/
│   ├── cards/
│   └── common/
├── theme/              # NativeWind config, colors, typography
│   └── colors.ts
└── app/                # Expo Router file-based screens
    ├── (tabs)/
    │   ├── _layout.tsx        # Tab navigator
    │   ├── index.tsx          # Dashboard
    │   ├── categories.tsx     # Categories/Budget
    │   ├── transactions.tsx   # Transaction list
    │   └── accounts.tsx       # Accounts
    └── _layout.tsx            # Root layout

Also create:
- CLAUDE.md at root with architecture rules and agent boundaries
- tailwind.config.js configured for NativeWind
- drizzle.config.ts

Verify the app runs with: npx expo start