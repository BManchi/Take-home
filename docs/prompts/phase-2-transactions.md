Read docs/PRD.md. Build two screens:

1. src/app/(tabs)/categories.tsx
   - Bar chart: total spent vs total budget
   - Category list: emoji icon, name, colored progress bar, spent/budget amounts
   - Tap category → detail view with monthly spending history

2. src/app/(tabs)/transactions.tsx
   - Transactions grouped by date
   - Each row: merchant, category emoji, amount, type indicator
   - Search bar + filter
   - Unreviewed = blue dot
   - FAB "+" button for manual transaction entry

Use existing hooks and stores. Match Dashboard styling.