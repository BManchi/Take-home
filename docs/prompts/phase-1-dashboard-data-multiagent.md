Create an agent team to build two independent pieces of the Copilot clone.

Teammate 1 (UI): Build the Dashboard screen layout at src/app/(tabs)/index.tsx.
Use mock data from src/__mocks__/. Include:
- A spending pace line chart placeholder (use gifted-charts LineChart)
- A "To Review" transaction list section
- A "Budgets" section with colored progress bars
- An "Upcoming" recurrings horizontal scroll
- A "Net This Month" summary card
Style everything with NativeWind/Tailwind classes.
ONLY touch files in src/app/ and src/components/.

Teammate 2 (Data): Implement the full DrizzleORM database layer:
- Schema in src/database/schema.ts matching the TypeScript interfaces in src/types/
- Client initialization in src/database/client.ts
- Seed function in src/database/seed.ts that populates the DB with mock data
- Zustand store for transactions in src/stores/transactionStore.ts
- Facade hook useTransactions in src/hooks/useTransactions.ts
ONLY touch files in src/database/, src/stores/, and src/hooks/.

Both teammates should read CLAUDE.md for project conventions.
Coordinate via messages if either needs to know about the other's progress.