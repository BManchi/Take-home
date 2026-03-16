Read docs/PRD.md. Build:

1. Transaction detail bottom sheet (triggered by tapping any transaction):
   - Use @gorhom/bottom-sheet
   - Editable: name, date, amount, category (emoji picker), type
   - Notes field, "Exclude from budget" toggle, Save button

2. src/app/(tabs)/accounts.tsx
   - Net worth line chart with 1M/3M/6M/1Y/ALL timeframe selector
   - Accounts grouped by type (Credit Cards, Depository, Investments, Loans)
   - Each row: institution, name, balance, percent change or credit utilization