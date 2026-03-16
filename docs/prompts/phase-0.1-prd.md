I have a complete knowledge base of the Copilot Money app in docs/help-center/.
Screenshots of every screen are in docs/screenshots/.

Using this knowledge base, create a comprehensive PRD at docs/PRD.md for building
a React Native clone of Copilot Money. The PRD should include:

1. APP OVERVIEW
   - Core value proposition (one sentence)
   - Target user
   - Key differentiators from other finance apps

2. SCREEN INVENTORY (for each of these 5 priority screens):
   - Dashboard
   - Categories/Budget
   - Transaction List
   - Transaction Detail (bottom sheet)
   - Accounts

   For each screen document:
   - Purpose and user goal
   - Every UI section/component visible in the screenshots
   - Data displayed in each section
   - User interactions (tap, swipe, scroll behaviors)
   - Navigation connections to other screens
   - Component names (React component naming convention)

3. DATA MODELS as TypeScript interfaces:
   - Transaction
   - Category
   - Account
   - RecurringTransaction
   - Budget
   Include all fields visible in the UI, with proper types.

4. NAVIGATION MAP
   - Tab bar structure
   - Modal/bottom sheet triggers
   - Deep linking between sections (e.g., Dashboard "view all >" → Categories)

5. DESIGN SYSTEM NOTES
   - Color palette (extract from screenshots)
   - Typography scale
   - Spacing/padding patterns
   - Card/section styling
   - Key UI patterns: emoji categories, colored progress bars, line charts

6. MOCK DATA
   - Seed data JSON for 3 months of transactions (at least 50 transactions)
   - 10-15 categories with emojis, colors, and budget amounts
   - 5-6 accounts across different types
   - 4-5 recurring transactions

7. SCOPE EXCLUSIONS
   - Explicitly list what we're NOT building

The PRD must be detailed enough that an AI coding agent with no other context
can implement each screen correctly.