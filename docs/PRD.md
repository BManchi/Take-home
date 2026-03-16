# Product Requirements Document
# Copilot Money — React Native Clone

**Version:** 1.0
**Source:** Copilot Money help center (help.copilot.money), scraped March 2026
**Scope:** iOS-first React Native implementation of the 5 priority screens

---

## Table of Contents

1. [App Overview](#1-app-overview)
2. [Screen Inventory](#2-screen-inventory)
   - 2.1 [Dashboard Screen](#21-dashboard-screen)
   - 2.2 [Categories Screen](#22-categories-screen)
   - 2.3 [Transaction List Screen](#23-transaction-list-screen)
   - 2.4 [Transaction Detail Bottom Sheet](#24-transaction-detail-bottom-sheet)
   - 2.5 [Accounts Screen](#25-accounts-screen)
3. [Data Models](#3-data-models)
4. [Navigation Map](#4-navigation-map)
5. [Design System](#5-design-system)
6. [Mock Data](#6-mock-data)
7. [Scope Exclusions](#7-scope-exclusions)

---

## 1. App Overview

### Core Value Proposition
Copilot Money is a beautiful, opinionated personal finance tracker that automatically categorizes transactions from linked bank accounts, enforces a monthly budget with visual progress indicators, and surfaces upcoming recurring bills — giving users a single confident answer to "how am I doing this month?"

### Target User
Financially-engaged individuals (25–45 years old) who have linked multiple bank and credit card accounts, want a zero-effort categorization experience, and think visually about their money through charts and color-coded progress.

### Key Differentiators from Other Finance Apps
- **Emoji-first categories** — every budget category is identified by an emoji and a custom name, making the UI approachable and personal
- **Recurring-aware spending graph** — the dashboard line chart excludes expected recurring charges so the spending line reflects discretionary spending only
- **Intelligent "To Review" queue** — newly imported transactions surface on the Dashboard awaiting a single-tap approval, eliminating the need to hunt for new activity
- **Color-coded progress bars** — budget bars dynamically shift from green → light orange → dark orange → red as the month progresses, not just at end-of-month
- **Transaction dot system** — colored dots on every transaction row communicate review status, tips, and split errors at a glance without opening a detail view

---

## 2. Screen Inventory

---

### 2.1 Dashboard Screen

**File:** `screens/DashboardScreen.tsx`

#### Purpose & User Goal
The home screen. Users open the app here to get an instant, at-a-glance answer to "how is my spending this month?" and to process the To Review queue of new transactions.

#### Layout (top to bottom, all within a single `ScrollView`)

```
┌─────────────────────────────────────┐
│  < Month Selector >      [settings] │  ← DashboardHeader
├─────────────────────────────────────┤
│  FREE TO SPEND  $842                │
│  ╔═══════════════════════╗          │  ← SpendingGraph
│  ║  dotted + solid line  ║          │
│  ╚═══════════════════════╝          │
├─────────────────────────────────────┤
│  TO REVIEW (3)      view all >      │  ← ToReviewSection
│  [txn row] [txn row] [txn row]      │
│  [ MARK ALL AS REVIEWED ]           │
├─────────────────────────────────────┤
│  BUDGETS            view all >      │  ← BudgetsSection
│  🍔 Food          $220 left         │
│  ████████░░░░░░  ($80/$300)         │
│  🚗 Transport     $45 left          │
│  ████░░░░░░░░░░  ($30/$75)          │
├─────────────────────────────────────┤
│  UPCOMING           view all >      │  ← UpcomingSection
│  ← [card] [card] [card] →           │  (horizontal scroll)
├─────────────────────────────────────┤
│  NET THIS MONTH    cash flow >      │  ← NetThisMonthSection
│  Income   Spend   Excluded          │
│  $4,200   $1,358  $240              │
│  ▲$200    ▼$42    ─                 │
└─────────────────────────────────────┘
```

---

#### UI Sections & Components

##### `DashboardHeader`
- Month/year label, centered (e.g., "March 2026")
- Left/right chevron arrows to navigate to previous/next month
- Gear icon (⚙) top-right, navigates to Settings

##### `SpendingGraph`
- **"FREE TO SPEND"** label in small caps + dollar amount in large bold text above chart
  - Free to Spend = `totalBudget - totalSpent` (recurring transactions excluded)
- Line chart using a custom SVG or `react-native-svg` path
  - **Dotted line** (gray): ideal spending trajectory — a straight line from $0 on day 1 to `totalBudget` on last day of month
  - **Solid line** (color varies): actual cumulative spending per day
  - Line color logic (computed daily):
    - `percentUsed = totalSpent / totalBudget`
    - `idealPercent = currentDay / daysInMonth`
    - `diff = percentUsed - idealPercent`
    - `diff < 0` → **Green** (`#34C759`)
    - `0 ≤ diff < 0.20` → **Light Orange** (`#FF9F0A`)
    - `diff ≥ 0.20` → **Dark Orange** (`#FF6B00`)
    - `percentUsed > 1.0` → **Red** (`#FF3B30`)
  - X-axis: day numbers (1, 5, 10, 15, 20, 25, last day)
  - Y-axis: dollar amounts, hidden or faintly gridded
  - Touch/scrub: tap and hold shows a vertical cursor with exact date + spend at that point
- Note: recurring transactions are excluded from the spending line

##### `ToReviewSection`
- Section header row: "TO REVIEW" label (small caps, secondary text) + count badge (e.g., "(3)") + "view all >" tappable link
- List of `TransactionRow` components (up to 5 visible, remainder hidden behind "view all >")
- Each row: `[dot] [merchant name] [category emoji] [amount]` — identical to Transaction List rows
- Tapping a row opens `TransactionDetailSheet`
- **"MARK ALL AS REVIEWED"** button at bottom of section — uppercase, full-width text button; dismisses all visible rows and marks them `reviewed: true`
- Section hidden when review queue is empty

##### `BudgetsSection`
- Section header: "BUDGETS" + "view all >" link (navigates to Categories screen)
- Shows top 3–5 most-active (highest spend ratio) categories
- Each category row (`BudgetRow`):
  - Left: emoji + category name
  - Right: "$X left" or "$X over" label
  - Below: colored progress bar (`CategoryProgressBar`)
    - Bar width = `min(spent / budget, 1.0) * 100%`
    - Bar color: same green/light-orange/dark-orange/red logic as dashboard chart
    - Outlined bar segment (dotted outline, not filled): represents expected recurring spend for that category
  - Tapping a budget row navigates to Categories screen filtered to that category

##### `UpcomingSection`
- Section header: "UPCOMING" + "view all >" link (navigates to Recurrings screen)
- Horizontally scrollable row of `UpcomingRecurringCard` components
- Each card:
  - Emoji (recurring's emoji)
  - Merchant name
  - Expected date (e.g., "Mar 15")
  - Expected amount (e.g., "$14.99")
  - Status: paid (solid) or unpaid (lighter)

##### `NetThisMonthSection`
- Section header: "NET THIS MONTH" + "cash flow >" tappable link
- Three columns: Income | Spend | Excluded
- Each column:
  - Dollar amount (large, white)
  - Delta vs. prior month-to-date (small, below; green up arrow ▲ for good, gray dash for neutral, red down arrow ▼ for bad)
- Tapping "cash flow >" or the whole section navigates to a CashFlow placeholder screen

---

#### User Interactions

| Interaction | Result |
|---|---|
| Swipe left/right on SpendingGraph | Navigate to prev/next month |
| Tap month label left/right arrows | Navigate to prev/next month |
| Touch-hold on chart | Scrub cursor, show tooltip |
| Tap transaction in ToReview | Open TransactionDetailSheet |
| Tap "MARK ALL AS REVIEWED" | Mark all visible queue items reviewed, collapse section |
| Tap "view all >" in Budgets | Navigate to CategoriesScreen |
| Tap a BudgetRow | Navigate to CategoriesScreen, scroll to that category |
| Swipe UpcomingSection horizontally | Scroll upcoming recurring cards |
| Tap "view all >" in Upcoming | Navigate to RecurringsScreen |
| Tap "cash flow >" | Navigate to CashFlowScreen (placeholder) |

---

#### Navigation Connections
- Dashboard → Transactions (via "view all >" in ToReview)
- Dashboard → Categories (via "view all >" in Budgets, or category row tap)
- Dashboard → Recurrings (via "view all >" in Upcoming)
- Dashboard → CashFlow (via "cash flow >" in Net This Month)
- Dashboard → TransactionDetailSheet (via any transaction row tap)
- Dashboard → Settings (via gear icon)

---

### 2.2 Categories Screen

**File:** `screens/CategoriesScreen.tsx`

#### Purpose & User Goal
Show the user their spending organized by category for the selected month, with budget progress bars, grouped categories, and the ability to tap into each category's transactions.

#### Layout

```
┌─────────────────────────────────────┐
│  < Month Selector >        [⋯ menu] │  ← CategoriesHeader
├─────────────────────────────────────┤
│  TOTAL SPEND vs BUDGET              │
│  $1,358 / $2,500                    │  ← CategorySummaryChart
│  ████████████░░░░░  54%             │
│  [Tap to see Yearly/Monthly Metrics]│
├─────────────────────────────────────┤
│  ── GROUP: Food & Dining ──         │  ← CategoryGroupHeader
│  🍔 Restaurants       $180/$250     │  ← CategoryRow
│     ██████████░░░░░░               │
│  🛒 Groceries         $220/$300     │
│     ████████████░░░░               │
├─────────────────────────────────────┤
│  🏠 Housing           $1,600/$1,600 │  ← CategoryRow (no group)
│     ████████████████ (100%)         │
│  📱 Subscriptions     $65/$80       │
│     █████████████░░░               │
│  ...                                │
├─────────────────────────────────────┤
│  [ + Add Category ]                 │  ← AddCategoryButton (iOS bottom)
└─────────────────────────────────────┘
```

---

#### UI Sections & Components

##### `CategoriesHeader`
- Month/year selector with left/right arrows (same as Dashboard)
- "⋯" menu button (top-right) with options:
  - Create new category group
  - Rebalance budgets
  - (future: reorder categories)

##### `CategorySummaryChart`
- Large horizontal progress bar showing total spent vs. total budget for the month
- Labels: "$X,XXX spent" (left) and "$X,XXX budget" (right)
- Bar color follows same green/orange/red logic
- **Yearly Metrics / Monthly Metrics panel** (tappable toggle):
  - Default: hidden, collapsed
  - On tap: expands inline below the chart
  - Shows: "Total spent this year: $X,XXX" and "Avg monthly spend: $XXX"
  - Left/right chevrons to navigate between years/months in this subview
- When no budget is set: shows "vs. last month $X,XXX" instead of a budget bar

##### `CategoryGroupHeader`
- Displayed when categories are organized into a group
- Group name label + expand/collapse chevron
- Group-level budget bar (combined spent / combined budget)
- Tapping expands/collapses sub-categories

##### `CategoryRow`
- Emoji icon (40×40pt tappable area, `EmojiAvatar`)
- Category name (left-aligned)
- "**$X** left" or "**$X over**" label (right-aligned, colored)
- Progress bar below name+amount (full width of row)
  - Filled section: `min(spent/budget, 1)` wide, colored green/orange/red
  - Outlined/dashed section: represents expected recurring spend
- Tapping opens `CategoryDetailSheet` (bottom sheet):
  - Shows key metrics: yearly total, avg monthly
  - Month-by-month bar chart (last 6 months)
  - List of transactions in that category for the selected month
  - Budget amount label — tapping the budget label opens an inline budget editor

##### `AddCategoryButton`
- Bottom of list on iOS: "+ Add Category" text button
- Tapping opens `CreateCategorySheet`

---

#### Category Detail Sheet (`CategoryDetailSheet`)

Triggered by tapping any `CategoryRow`.

```
┌─────────────────────────────────────┐
│  🍔 Restaurants               [✕]   │
│  $180 spent   $250 budget           │
│  ████████████░░░░░░░               │
│  ─────────────────────────          │
│  THIS YEAR: $1,840                  │
│  AVG/MONTH: $205                    │
│  ─────────────────────────          │
│  Oct  Nov  Dec  Jan  Feb  Mar       │
│  $190 $220 $185 $210 $195 $180      │
│  ─────────────────────────          │
│  Mar 10  Chipotle         -$14.50   │
│  Mar 7   Nobu             -$82.00   │
│  ...                                │
│  [ SPLIT ]  [ BUDGET: $250 ]        │
└─────────────────────────────────────┘
```

- Tapping the budget amount opens an inline number input
- Transaction rows in this sheet are tappable → opens `TransactionDetailSheet`

---

#### User Interactions

| Interaction | Result |
|---|---|
| Tap month arrows | Change month, refresh all data |
| Tap category summary chart | Expand/collapse Yearly/Monthly Metrics |
| Tap left/right in metrics | Navigate between years/months |
| Tap category group header | Expand/collapse group |
| Tap CategoryRow | Open CategoryDetailSheet |
| Tap budget label in CategoryDetailSheet | Inline budget editor |
| Tap "⋯" menu | Options sheet: create group, rebalance |
| Tap "+ Add Category" | Open CreateCategorySheet |
| Swipe down on any sheet | Dismiss sheet |

---

#### Navigation Connections
- Categories → TransactionDetailSheet (via transaction in CategoryDetailSheet)
- Categories → CategoriesScreen month-filtered (via month change)

---

### 2.3 Transaction List Screen

**File:** `screens/TransactionsScreen.tsx`

#### Purpose & User Goal
Let users find, filter, and review any past transaction. The primary action is tapping a row to open the detail sheet and correct categorization or type.

#### Layout

```
┌─────────────────────────────────────┐
│  🔍 Search transactions...   [+ ]   │  ← SearchBar + AddButton
├─────────────────────────────────────┤
│  [All] [Category▾] [Type▾] [Tags▾] │  ← FilterChipRow
│        [Account▾]  [Date▾]          │
├─────────────────────────────────────┤
│  MARCH 2026  ·  $1,358 spent        │  ← MonthSectionHeader
│  ● Chipotle        🍔  -$14.50      │  ← TransactionRow
│  ● Amazon          🛒  -$32.99      │
│  ● Spotify [R]     🎵  -$9.99       │
│  ◎ Netflix [R]     🎬  -$15.49      │
│  ─────────────────────────          │
│  FEBRUARY 2026  ·  $1,520 spent     │  ← MonthSectionHeader
│  ...                                │
└─────────────────────────────────────┘
```

---

#### UI Sections & Components

##### `TransactionSearchBar`
- Full-width text input at top
- Placeholder: "Search transactions..."
- Filters the list in real time by merchant name or renamed transaction name
- "+" button to the right → opens `CreateTransactionSheet`

##### `FilterChipRow`
- Horizontally scrollable row of filter chips
- Each chip is a pill button: "[Label ▾]"
- Filter options:
  - **Category**: multi-select from category list
  - **Type**: Regular / Income / Internal Transfer / Recurring
  - **Tags**: multi-select from tag list
  - **Account**: multi-select from account list
  - **Date**: month/date range picker
- Active filters shown with filled chip background (accent color)
- All filters applied simultaneously (AND logic)
- When filters are active, a total spending amount for filtered view shown in a subtitle bar

##### `MonthSectionHeader`
- Month + year label (e.g., "MARCH 2026")
- Total spent for that month (e.g., "· $1,358 spent")
- Sections sorted newest-first

##### `TransactionRow`
- **Left dot indicator** (8pt circle):
  - Blue dot: `reviewed: false` (needs review)
  - Gray dot: transaction has a `tipAmount` > 0
  - Red dot: transaction is a split with mismatched totals
  - No dot: reviewed and clean
- **Merchant name** (left-aligned, primary text)
  - Renamed transactions show the user's name; original name shown subtly below (if different)
  - Badge **[R]** for Recurring, **[I]** for Income, **[T]** for Internal Transfer
  - Tags shown as small pills beneath the name if present
- **Category emoji** (center-right, 24pt)
- **Amount** (right-aligned, primary text)
  - Negative (spend): white or light gray
  - Positive (income/refund): green (`#34C759`)
- Tapping anywhere on row opens `TransactionDetailSheet`
- Long press or swipe-left to enter bulk-select mode

##### Bulk Select Mode
- Checkbox appears on left of each row
- Floating action bar at bottom: "Edit Category | Edit Type | Add Tag | Mark Reviewed"
- Applies selected action to all checked transactions

---

#### User Interactions

| Interaction | Result |
|---|---|
| Type in search bar | Filter transactions by name |
| Tap filter chip | Open filter selector sheet |
| Tap "+" button | Open CreateTransactionSheet |
| Tap transaction row | Open TransactionDetailSheet |
| Long press transaction row | Enter bulk-select mode |
| Swipe left on row | Enter bulk-select mode |
| Select all + "Mark Reviewed" | Mark selected as reviewed |

---

#### Navigation Connections
- Transactions → TransactionDetailSheet (tap row)
- Transactions → CreateTransactionSheet (tap "+")
- Transactions → Categories (via category chip in detail)

---

### 2.4 Transaction Detail Bottom Sheet

**File:** `components/TransactionDetailSheet.tsx`

This is presented as a modal bottom sheet (using `@gorhom/bottom-sheet` or equivalent) from any screen that shows transactions.

#### Layout

```
┌─────────────────────────────────────┐
│  ─── drag handle ───                │
│                                     │
│  CHIPOTLE                     [⋯]  │  ← name (editable) + menu
│  Original: CHIPOTLE MEXICAN GRILL   │  ← original name (if renamed)
│  Mar 10, 2026  ·  Checking ••4521   │  ← date (editable) · account
│                                     │
│  AMOUNT         -$14.50             │  ← Amount (large)
│  Tip            $2.00               │  ← (if tip present)
│                                     │
│  Category       🍔 Restaurants  >  │  ← tappable → picker
│  Type           Regular          >  │  ← tappable → picker
│  Tags           + Add Tag           │  ← tag chips + add
│                                     │
│  ─── Notes ──────────────────────  │
│  [                              ]   │
│                                     │
│  [ SPLIT ]   [ RECURRING ]   [✓]   │  ← action buttons
└─────────────────────────────────────┘
```

---

#### UI Sections & Components

##### Header Row
- **Transaction name** (editable inline — tap to show text input)
- **"⋯" menu button** (top-right):
  - Mark as reviewed / unreviewed
  - Change transaction type (submenu: Income / Internal Transfer / Regular)
  - Exclude from budgets
  - Delete transaction (manual only)
  - View original transaction info

##### Meta Row
- Original name (gray, small, shown only if user has renamed)
- Date (tappable → date picker wheel)
- Account name + masked account number (e.g., "Chase Checking ••4521")

##### Amount Section
- Large amount display
- Tip amount row (gray, indented) if `tipAmount > 0`

##### Category Picker Row
- Label: "Category"
- Right: `[emoji] [category name] >`
- Tapping opens a full-screen or tall bottom sheet `CategoryPickerSheet` with searchable list of all categories

##### Type Picker Row
- Label: "Type"
- Right: "Regular" / "Income" / "Internal Transfer" / "Recurring" + chevron
- Tapping opens type selection sheet

##### Tags Row
- Label: "Tags"
- Tag chips displayed inline (each chip is tappable to remove)
- "+ Add Tag" chip at end: opens `TagPickerSheet`

##### Notes Field
- Multi-line text input
- Placeholder: "Add a note..."

##### Action Button Row (bottom)
- **[SPLIT]** — opens `SplitTransactionSheet`
  - Input two or more amounts summing to original
  - Each split gets its own category/date
- **[RECURRING]** — opens recurring picker/creator sheet
  - Shows list of existing recurrings to attach to, or "Start a new one"
- **[✓ REVIEWED]** / **[○ MARK REVIEWED]** — toggles `reviewed` flag; checkmark turns green when reviewed

---

#### Split Transaction Sheet (`SplitTransactionSheet`)

```
┌─────────────────────────────────────┐
│  SPLIT TRANSACTION            [✕]   │
│  Total: $82.00                      │
│  ─────────────────────────          │
│  [🍔 Restaurants]  $ 55.00  [✕]    │
│  [🥃 Entertainment] $ 27.00  [✕]   │
│                       ─────────     │
│                       = $82.00 ✓    │
│  [ + Add Split ]                    │
│  [ SAVE ]                           │
└─────────────────────────────────────┘
```

- Each split line: category emoji + name (tappable), amount input
- Running total shown; turns red if doesn't sum to parent amount
- After save: parent transaction is hidden; child splits appear in transaction list

---

#### User Interactions

| Interaction | Result |
|---|---|
| Tap transaction name | Inline edit, keyboard appears |
| Tap date | Date picker wheel |
| Tap Category row | CategoryPickerSheet |
| Tap Type row | TypePickerSheet |
| Tap tag chip | Remove tag |
| Tap "+ Add Tag" | TagPickerSheet |
| Tap "⋯" menu | Options sheet |
| Tap SPLIT | SplitTransactionSheet |
| Tap RECURRING | RecurringPickerSheet |
| Tap ✓ button | Toggle reviewed state |
| Swipe down | Dismiss sheet |

---

### 2.5 Accounts Screen

**File:** `screens/AccountsScreen.tsx`

#### Purpose & User Goal
Give users a bird's-eye view of their entire financial picture — net worth, all account balances, and connection health.

#### Layout

```
┌─────────────────────────────────────┐
│  ACCOUNTS                    [+ ]   │  ← AccountsHeader
├─────────────────────────────────────┤
│  NET WORTH          [⚙ chart mode]  │
│  $142,580                           │  ← NetWorthSection
│  ▲ +$3,240 (2.3%)  [1M][3M][YTD]  │
│  ╔═══════════════════════╗          │
│  ║    net worth line     ║          │
│  ╚═══════════════════════╝          │
├─────────────────────────────────────┤
│  ⚠ CONNECTIONS NEEDING ATTENTION   │  ← ConnectionAlertBanner
│  Chase — stopped syncing  [REVERIFY]│
├─────────────────────────────────────┤
│  CREDIT CARDS           -$3,420     │  ← AccountTypeSection
│  Chase Sapphire  -$2,100  ●  28% util│
│  Apple Card      -$1,320  ●  19% util│
├─────────────────────────────────────┤
│  CASH & CHECKING        $8,640      │
│  Chase Checking   $6,120   ▲ +2.1% │
│  Ally Savings     $2,520   ▲ +0.4% │
├─────────────────────────────────────┤
│  INVESTMENTS            $118,200    │
│  Fidelity 401k  $94,000   ▲ +4.2% │
│  Robinhood      $24,200   ▲ +1.8% │
├─────────────────────────────────────┤
│  LOANS                  -$18,500    │
│  Car Loan       -$18,500  ▼ -0.5% │
└─────────────────────────────────────┘
```

---

#### UI Sections & Components

##### `AccountsHeader`
- Title "ACCOUNTS"
- "+" button to add a new account (navigates to AddAccountFlow)

##### `NetWorthSection`
- **Net worth label**: "NET WORTH" (small caps)
- **Net worth value**: large bold dollar amount
- **Change indicator**: "▲ +$X,XXX (+X.X%)" or "▼" — green for positive, red for negative
- **Time range selector**: pill-shaped segmented control
  - Options: 1W · 1M · 3M · 6M · YTD · 1Y · ALL
  - Selected range affects the line chart AND the percentage change shown next to each account
- **Line chart** (`NetWorthChart`, SVG path):
  - Single line (default) or two lines: one for assets, one for debt
  - Touch-hold shows cursor + tooltip for exact date + value
- **⚙ gear icon**: chart mode settings
  - "Combined" (single net worth line)
  - "Split" (assets line + debt line, two colors)
  - Toggle to exclude specific accounts from net worth total

##### `ConnectionAlertBanner`
- Appears between NetWorthSection and account list only when there are connection issues
- Shows institution name + issue description
- **[REVERIFY]** button (accent color)
- **[✕]** to dismiss (temporarily hides; still accessible via Manage > Settings)

##### `AccountTypeSection`
Repeated for each account type. Account types: **Credit Cards**, **Cash & Checking**, **Investments**, **Loans**, **Other**.

- **Section header row**:
  - Account type name (e.g., "CREDIT CARDS")
  - Combined balance for that type (right-aligned)
  - Positive values: white; negative (debt): red-tinted or still white (depends on context)
- **Account rows** (`AccountRow`):
  - Institution + account name (e.g., "Chase Sapphire Reserve")
  - Right side:
    - For **Credit Cards**: balance + credit utilization percentage + colored dot
      - Utilization ≤ 33%: green dot
      - Utilization 33–66%: yellow dot
      - Utilization > 66%: red dot
    - For **Depository, Investment, Other**: balance + percentage change tied to selected time range (green ▲ or red ▼)
    - For **Loans**: balance + percentage change
  - Tapping an account row navigates to `AccountDetailScreen` (out of scope for v1, but include stub)

---

#### User Interactions

| Interaction | Result |
|---|---|
| Tap time range chip | Update chart + all % changes |
| Touch-hold on chart | Show scrub cursor tooltip |
| Tap ⚙ gear icon | Chart mode settings sheet |
| Tap [REVERIFY] | Opens institution re-auth flow (stub) |
| Tap [✕] on alert banner | Dismiss alert banner |
| Tap account row | Navigate to AccountDetailScreen (stub) |
| Tap "+" | Navigate to AddAccountFlow (stub) |

---

#### Navigation Connections
- Accounts → AccountDetailScreen (stub, per account row tap)
- Accounts → AddAccountFlow (stub, via "+")

---

## 3. Data Models

All TypeScript interfaces representing the full data shape visible in the UI.

```typescript
// ─── Core Enums ──────────────────────────────────────────────────────────────

type TransactionType = 'regular' | 'income' | 'internal_transfer';

type AccountType = 'credit_card' | 'checking' | 'savings' | 'investment' | 'loan' | 'other';

type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';

type RecurringStatus = 'active' | 'paused' | 'archived';

type DashboardLineColor = 'green' | 'light_orange' | 'dark_orange' | 'red';

// ─── Account ─────────────────────────────────────────────────────────────────

interface Account {
  id: string;
  institutionName: string;          // e.g., "Chase", "Fidelity"
  accountName: string;              // e.g., "Sapphire Reserve", "Checking ••4521"
  accountNumberMask: string;        // last 4 digits, e.g., "4521"
  type: AccountType;
  balance: number;                  // current balance (negative for credit/loans)
  availableCredit?: number;         // credit cards only
  creditLimit?: number;             // credit cards only
  creditUtilization?: number;       // 0–1, credit cards only
  isManual: boolean;
  isHidden: boolean;
  excludeFromNetWorth: boolean;
  connectionStatus: 'healthy' | 'needs_reverify' | 'has_new_accounts';
  lastSyncedAt: string;             // ISO date string
  balanceHistory: BalanceSnapshot[]; // for chart rendering
}

interface BalanceSnapshot {
  date: string;                     // ISO date "YYYY-MM-DD"
  balance: number;
}

// ─── Category ────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;                     // user-defined, e.g., "Restaurants"
  emoji: string;                    // single emoji character, e.g., "🍔"
  color: string;                    // hex color for progress bar accent, e.g., "#FF9500"
  budgetAmount: number | null;      // null = optional/unbudgeted
  isOptional: boolean;              // optional-budgeted categories excluded from totals
  groupId: string | null;           // foreign key to CategoryGroup.id, null if ungrouped
  rolloverEnabled: boolean;         // whether to carry over underspend/overspend
  rolloverBalance: number;          // current cumulative rollover amount (can be negative)
  sortOrder: number;                // display order in the list
}

interface CategoryGroup {
  id: string;
  name: string;                     // e.g., "Food & Dining"
  emoji: string;
  unassignedBudget: number;         // group-level "flex" budget not assigned to subcategories
  isExpanded: boolean;
  sortOrder: number;
}

// ─── Transaction ─────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  accountId: string;
  date: string;                     // ISO date "YYYY-MM-DD"
  originalDate: string;             // immutable original post date
  merchantName: string;             // user-editable display name
  originalMerchantName: string;     // immutable raw name from bank
  amount: number;                   // negative = debit/spend, positive = credit/income
  originalAmount: number;           // original import amount (before tip adjustment)
  tipAmount: number;                // extracted tip (shows gray dot if > 0)
  type: TransactionType;
  categoryId: string | null;        // null for income / internal transfers
  reviewed: boolean;
  isRecurring: boolean;
  recurringId: string | null;       // links to RecurringTransaction.id
  tags: string[];                   // array of tag names
  notes: string;
  isExcluded: boolean;              // excluded from budgets and spending totals
  isSplit: boolean;                 // this transaction has been split
  splitParentId: string | null;     // set on child transactions; parent id
  splitChildren: string[];          // array of child transaction ids (set on parent)
  isManual: boolean;
  currencyCode: string;             // e.g., "USD"
  originalCurrencyCode: string | null; // if foreign currency
  originalCurrencyAmount: number | null;
}

// ─── RecurringTransaction ────────────────────────────────────────────────────

interface RecurringTransaction {
  id: string;
  name: string;                     // user-defined display name, e.g., "Spotify"
  emoji: string;
  categoryId: string | null;
  frequency: RecurringFrequency;
  status: RecurringStatus;
  expectedAmount: number;           // typical charge amount (negative = expense)
  amountMin: number;                // filter: minimum amount to match
  amountMax: number;                // filter: maximum amount to match
  expectedDayOfMonth: number | null; // 1–31, monthly recurrings
  expectedDayRange: number;         // ± days tolerance for matching (e.g., ±1)
  nameMatchRule: 'exact' | 'contains'; // how to match transaction names
  nameMatchValue: string;           // string to match against transaction names
  accountId: string | null;         // locked to specific account, or null = any
  nextExpectedDate: string | null;  // ISO date "YYYY-MM-DD"
  lastPaidDate: string | null;
  isShared: boolean;                // split with partner
  sharedSplitPercent: number;       // 0–1, your share (default 1.0)
  linkedTransactionIds: string[];   // historical matches
}

// ─── Budget ──────────────────────────────────────────────────────────────────

interface Budget {
  id: string;
  categoryId: string;
  month: string;                    // "YYYY-MM" format
  amount: number;                   // budget for that specific month
  rolloverAmount: number;           // carried over from prior month (positive = surplus)
  effectiveAmount: number;          // amount + rolloverAmount = actual budget cap
}

// ─── Tag ─────────────────────────────────────────────────────────────────────

interface Tag {
  id: string;
  name: string;                     // unique, user-defined
  color: string | null;             // optional tint hex color
}

// ─── Spending Summary (derived/computed) ─────────────────────────────────────

interface MonthlySpendingSummary {
  month: string;                    // "YYYY-MM"
  totalBudget: number;
  totalSpent: number;               // excludes recurring expected + excluded txns
  totalIncome: number;
  totalExcluded: number;
  freeToSpend: number;              // totalBudget - totalSpent
  priorMonthTotalSpent: number;
  priorMonthTotalIncome: number;
  dailySpending: DailySpend[];
}

interface DailySpend {
  day: number;                      // 1–31
  cumulativeSpent: number;          // cumulative actual spend as of this day
  idealSpend: number;               // linear ideal spend at this day
}

// ─── Net Worth Snapshot ───────────────────────────────────────────────────────

interface NetWorthSnapshot {
  date: string;                     // "YYYY-MM-DD"
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}
```

---

## 4. Navigation Map

### Tab Bar Structure

The app uses a 5-tab bottom tab bar. Tab order matches Copilot's iOS default.

```
┌──────────────────────────────────────────────────────┐
│  Dashboard  │  Accounts  │  Categories  │  Transactions  │  Recurrings  │
│  (home)     │            │              │                │               │
└──────────────────────────────────────────────────────┘
```

**Tab bar icons** (SF Symbols or equivalent):
- Dashboard: `chart.line.uptrend.xyaxis`
- Accounts: `building.columns`
- Categories: `circle.grid.2x2`
- Transactions: `list.bullet`
- Recurrings: `arrow.triangle.2.circlepath`

Tab bar background: blurred dark (`rgba(18,18,18,0.92)` + blur)
Active tab: white icon + white label
Inactive tab: gray icon + gray label

---

### Screen / Stack Structure

```
RootNavigator (Tab)
├── DashboardStack
│   └── DashboardScreen
│       ├── → TransactionDetailSheet (modal)
│       ├── → CategoriesScreen (tab switch)
│       ├── → RecurringsScreen (tab switch)
│       └── → CashFlowScreen (push, stub)
│
├── AccountsStack
│   └── AccountsScreen
│       └── → AccountDetailScreen (push, stub)
│
├── CategoriesStack
│   └── CategoriesScreen
│       ├── → CategoryDetailSheet (modal)
│       │    └── → TransactionDetailSheet (modal)
│       └── → CreateCategorySheet (modal)
│
├── TransactionsStack
│   └── TransactionsScreen
│       ├── → TransactionDetailSheet (modal)
│       └── → CreateTransactionSheet (modal)
│
└── RecurringsStack
    └── RecurringsScreen
        ├── → RecurringDetailSheet (modal)
        └── → CreateRecurringSheet (modal)
```

### Modal / Bottom Sheet Triggers

| Sheet | Trigger Location | Presentation |
|---|---|---|
| `TransactionDetailSheet` | Any transaction row tap | Bottom sheet (85% height, draggable) |
| `CategoryDetailSheet` | CategoryRow tap | Bottom sheet (75% height) |
| `CategoryPickerSheet` | Category field in TransactionDetailSheet | Full-screen modal |
| `TagPickerSheet` | Tags row in TransactionDetailSheet | Bottom sheet |
| `SplitTransactionSheet` | SPLIT button in TransactionDetailSheet | Full-screen modal |
| `RecurringPickerSheet` | RECURRING button in TransactionDetailSheet | Bottom sheet |
| `CreateTransactionSheet` | "+" on TransactionList header | Full-screen modal |
| `CreateRecurringSheet` | "+" on Recurrings screen | Full-screen modal |
| `CreateCategorySheet` | "+ Add Category" on Categories | Full-screen modal |
| `FilterSheet` | Any filter chip tap on Transactions | Bottom sheet |

### Deep Linking Between Sections

| "view all >" / link | Source | Destination |
|---|---|---|
| "view all >" in ToReview | Dashboard | Transactions tab, filtered: `reviewed: false`, current month |
| "view all >" in Budgets | Dashboard | Categories tab, current month |
| BudgetRow tap | Dashboard | Categories tab, scrolled to that category |
| "view all >" in Upcoming | Dashboard | Recurrings tab |
| "cash flow >" | Dashboard | CashFlow screen (stub) |
| Category row in Transactions filter | Transactions | Category filter applied |
| RECURRING button in detail | TransactionDetail | Recurrings screen / picker |

---

## 5. Design System

### Color Palette

Copilot uses a **pure dark theme** with no light mode. All colors are designed for a near-black background.

```typescript
const colors = {
  // Backgrounds
  background:         '#0E0E10',   // app background (near-black, slight blue-black)
  surfaceCard:        '#1C1C1E',   // card/section background (iOS system grouped background)
  surfaceElevated:    '#2C2C2E',   // elevated card, modal sheet backgrounds
  surfaceInput:       '#2C2C2E',   // text inputs, pills

  // Text
  textPrimary:        '#FFFFFF',   // primary labels, amounts
  textSecondary:      '#8E8E93',   // secondary labels, metadata
  textTertiary:       '#636366',   // placeholder, de-emphasized

  // Brand / Accent
  accent:             '#0A84FF',   // iOS system blue — buttons, links, active states

  // Budget / Spending State Colors
  budgetGreen:        '#34C759',   // on-pace or under-budget
  budgetLightOrange:  '#FF9F0A',   // approaching budget (within 20%)
  budgetDarkOrange:   '#FF6B00',   // significantly over pace (>20%)
  budgetRed:          '#FF3B30',   // over budget

  // Transaction Dot Colors
  dotNeedsReview:     '#0A84FF',   // blue — needs review
  dotHasTip:          '#8E8E93',   // gray — has tip
  dotBadSplit:        '#FF3B30',   // red — split error

  // Income / Positive
  incomeGreen:        '#34C759',   // positive amounts, income

  // Separator
  separator:          '#38383A',   // list separators, dividers

  // Chart
  chartIdealLine:     '#636366',   // dotted ideal spending line
  chartActualGreen:   '#34C759',
  chartActualLightOrange: '#FF9F0A',
  chartActualDarkOrange:  '#FF6B00',
  chartActualRed:     '#FF3B30',
  chartNetWorthLine:  '#0A84FF',
  chartAssetsLine:    '#34C759',
  chartLiabilitiesLine: '#FF3B30',

  // Credit Utilization Dots
  utilizationLow:     '#34C759',   // ≤ 33%
  utilizationMedium:  '#FF9F0A',   // 33–66%
  utilizationHigh:    '#FF3B30',   // > 66%
};
```

---

### Typography Scale

Uses the **SF Pro** system font on iOS (default React Native font family).

```typescript
const typography = {
  // Display (large hero numbers)
  displayLarge: {
    fontSize: 34,
    fontWeight: '700',       // Bold
    letterSpacing: 0.37,
    color: colors.textPrimary,
  },
  displayMedium: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.36,
    color: colors.textPrimary,
  },

  // Section Headers (small caps style)
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',       // Semibold
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },

  // Body
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: -0.41,
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: -0.24,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.08,
    color: colors.textSecondary,
  },

  // Labels (functional UI)
  labelBold: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.24,
    color: colors.textPrimary,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
  },

  // Monospaced amounts
  amountLarge: {
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
  amountMedium: {
    fontSize: 17,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
  amountSmall: {
    fontSize: 15,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
};
```

---

### Spacing & Padding

Uses an **8pt base grid**.

```typescript
const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// Screen horizontal padding
const screenPadding = 16;

// Card internal padding
const cardPadding = { vertical: 16, horizontal: 16 };

// List row height: 56pt standard, 72pt for rows with subtitle
// Section header height: 40pt
// Tab bar height: 83pt (49pt bar + 34pt safe area)
```

---

### Card & Section Styling

```typescript
const cardStyle = {
  backgroundColor: colors.surfaceCard,
  borderRadius: 12,
  marginHorizontal: spacing.md,
  marginVertical: spacing.sm,
  // No border, no shadow — flat card on dark background
};

const sectionStyle = {
  // Sections are NOT wrapped in cards — they use separator lines
  // Each section header has paddingTop: 24, paddingBottom: 8
  // Rows separated by 1pt hairline at colors.separator
};

const sheetStyle = {
  backgroundColor: colors.surfaceElevated,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  // Drag handle: 4×36pt pill, colors.separator, centered, marginTop: 8
};
```

---

### Key UI Patterns

#### Emoji Category Avatar (`EmojiAvatar`)
```
┌─────────┐
│   🍔    │  40×40pt container
│         │  background: category.color at 20% opacity
└─────────┘  borderRadius: 10, emoji fontSize: 22
```
Every category row, recurring card, and transaction row displays the category emoji in this container. The color tints the background subtly — e.g., a food category with `color: '#FF9500'` gets a warm orange-tinted background.

#### Colored Progress Bar (`BudgetProgressBar`)
```
┌────────────────────────────────────────────┐
│ ███████████████▒▒▒▒░░░░░░░░░░░░░░░░░░░░░  │
│ ← spent →  ← recurrings →  ← remaining →  │
│                                            │
│  height: 6pt, borderRadius: 3             │
│  Track: colors.surfaceInput               │
│  Fill: green/lightOrange/darkOrange/red   │
│  Recurring overlay: same color, 30% opacity, dashed border │
└────────────────────────────────────────────┘
```

Color is computed per-bar at render time using the same daily-pace logic as the dashboard chart.

#### Dashboard Spending Line Chart (`SpendingLineChart`)
- Built with `react-native-svg` (`Path`, `Line`, `Circle` components)
- Coordinate space: `width × 180pt` container
- X = day-of-month, Y = dollar amount (inverted, $0 at top)
- Dotted line: `strokeDasharray="4,4"`, stroke = `colors.chartIdealLine`
- Solid line: `strokeWidth=2`, stroke = current line color
- End-of-line dot: 8pt filled circle in line color
- No axis labels by default; faint horizontal grid lines at 25%/50%/75% of budget

#### Transaction Badge Pills
```
[R]  backgroundColor: colors.surfaceInput, borderRadius: 4, fontSize: 11, fontWeight: '700'
[I]  Same styling but tinted green
[T]  Same styling but tinted blue
```

#### Review Dot Indicator
```
8pt circle, positioned absolutely to left of transaction row
colors: blue (#0A84FF) | gray (#8E8E93) | red (#FF3B30)
```

#### Filter Chips
```
Inactive: background: colors.surfaceInput, borderRadius: 100, paddingH: 12, paddingV: 6
Active:   background: colors.accent at 20%, border: 1pt colors.accent, text: colors.accent
```

---

## 6. Mock Data

### Categories (with emojis, colors, budgets)

```json
[
  { "id": "cat-01", "name": "Restaurants",     "emoji": "🍔", "color": "#FF9500", "budgetAmount": 250, "groupId": "grp-food",    "isOptional": false, "rolloverEnabled": true,  "rolloverBalance": 0,  "sortOrder": 1 },
  { "id": "cat-02", "name": "Groceries",       "emoji": "🛒", "color": "#34C759", "budgetAmount": 300, "groupId": "grp-food",    "isOptional": false, "rolloverEnabled": true,  "rolloverBalance": 0,  "sortOrder": 2 },
  { "id": "cat-03", "name": "Housing",         "emoji": "🏠", "color": "#636366", "budgetAmount": 1600,"groupId": null,          "isOptional": false, "rolloverEnabled": false, "rolloverBalance": 0,  "sortOrder": 3 },
  { "id": "cat-04", "name": "Transport",       "emoji": "🚗", "color": "#0A84FF", "budgetAmount": 150, "groupId": null,          "isOptional": false, "rolloverEnabled": true,  "rolloverBalance": 15, "sortOrder": 4 },
  { "id": "cat-05", "name": "Subscriptions",   "emoji": "📱", "color": "#5E5CE6", "budgetAmount": 80,  "groupId": null,          "isOptional": false, "rolloverEnabled": false, "rolloverBalance": 0,  "sortOrder": 5 },
  { "id": "cat-06", "name": "Health",          "emoji": "💊", "color": "#FF2D55", "budgetAmount": 100, "groupId": null,          "isOptional": false, "rolloverEnabled": true,  "rolloverBalance": 0,  "sortOrder": 6 },
  { "id": "cat-07", "name": "Entertainment",   "emoji": "🎬", "color": "#FF6B00", "budgetAmount": 120, "groupId": null,          "isOptional": false, "rolloverEnabled": true,  "rolloverBalance": 0,  "sortOrder": 7 },
  { "id": "cat-08", "name": "Coffee",          "emoji": "☕", "color": "#A2845E", "budgetAmount": 60,  "groupId": "grp-food",    "isOptional": false, "rolloverEnabled": true,  "rolloverBalance": -8, "sortOrder": 8 },
  { "id": "cat-09", "name": "Shopping",        "emoji": "🛍️", "color": "#FF9F0A", "budgetAmount": 200, "groupId": null,          "isOptional": false, "rolloverEnabled": true,  "rolloverBalance": 0,  "sortOrder": 9 },
  { "id": "cat-10", "name": "Travel",          "emoji": "✈️", "color": "#30D158", "budgetAmount": null,"groupId": null,          "isOptional": true,  "rolloverEnabled": false, "rolloverBalance": 0,  "sortOrder": 10 },
  { "id": "cat-11", "name": "Personal Care",   "emoji": "🪥", "color": "#64D2FF", "budgetAmount": 50,  "groupId": null,          "isOptional": false, "rolloverEnabled": true,  "rolloverBalance": 0,  "sortOrder": 11 },
  { "id": "cat-12", "name": "Utilities",       "emoji": "💡", "color": "#FFD60A", "budgetAmount": 120, "groupId": null,          "isOptional": false, "rolloverEnabled": false, "rolloverBalance": 0,  "sortOrder": 12 },
  { "id": "cat-13", "name": "Gifts",           "emoji": "🎁", "color": "#FF375F", "budgetAmount": 50,  "groupId": null,          "isOptional": true,  "rolloverEnabled": true,  "rolloverBalance": 0,  "sortOrder": 13 },
  { "id": "cat-14", "name": "Fitness",         "emoji": "🏋️", "color": "#30D158", "budgetAmount": 80,  "groupId": null,          "isOptional": false, "rolloverEnabled": false, "rolloverBalance": 0,  "sortOrder": 14 },
  { "id": "cat-15", "name": "Other",           "emoji": "🗂️", "color": "#636366", "budgetAmount": 100, "groupId": null,          "isOptional": false, "rolloverEnabled": true,  "rolloverBalance": 0,  "sortOrder": 15 }
]
```

**Category Groups:**
```json
[
  { "id": "grp-food", "name": "Food & Dining", "emoji": "🍽️", "unassignedBudget": 0, "isExpanded": true, "sortOrder": 1 }
]
```

---

### Accounts (5–6 across different types)

```json
[
  {
    "id": "acc-01",
    "institutionName": "Chase",
    "accountName": "Sapphire Reserve",
    "accountNumberMask": "4521",
    "type": "credit_card",
    "balance": -2104.82,
    "creditLimit": 10000,
    "availableCredit": 7895.18,
    "creditUtilization": 0.21,
    "isManual": false, "isHidden": false, "excludeFromNetWorth": false,
    "connectionStatus": "healthy",
    "lastSyncedAt": "2026-03-12T08:00:00Z",
    "balanceHistory": []
  },
  {
    "id": "acc-02",
    "institutionName": "Apple",
    "accountName": "Apple Card",
    "accountNumberMask": "8812",
    "type": "credit_card",
    "balance": -1320.14,
    "creditLimit": 5000,
    "availableCredit": 3679.86,
    "creditUtilization": 0.26,
    "isManual": false, "isHidden": false, "excludeFromNetWorth": false,
    "connectionStatus": "healthy",
    "lastSyncedAt": "2026-03-12T08:00:00Z",
    "balanceHistory": []
  },
  {
    "id": "acc-03",
    "institutionName": "Chase",
    "accountName": "Total Checking",
    "accountNumberMask": "7732",
    "type": "checking",
    "balance": 6120.48,
    "isManual": false, "isHidden": false, "excludeFromNetWorth": false,
    "connectionStatus": "healthy",
    "lastSyncedAt": "2026-03-12T08:00:00Z",
    "balanceHistory": []
  },
  {
    "id": "acc-04",
    "institutionName": "Ally",
    "accountName": "Online Savings",
    "accountNumberMask": "3390",
    "type": "savings",
    "balance": 2520.00,
    "isManual": false, "isHidden": false, "excludeFromNetWorth": false,
    "connectionStatus": "healthy",
    "lastSyncedAt": "2026-03-12T08:00:00Z",
    "balanceHistory": []
  },
  {
    "id": "acc-05",
    "institutionName": "Fidelity",
    "accountName": "401(k)",
    "accountNumberMask": "5551",
    "type": "investment",
    "balance": 94000.00,
    "isManual": false, "isHidden": false, "excludeFromNetWorth": false,
    "connectionStatus": "healthy",
    "lastSyncedAt": "2026-03-12T08:00:00Z",
    "balanceHistory": []
  },
  {
    "id": "acc-06",
    "institutionName": "Toyota Financial",
    "accountName": "Auto Loan",
    "accountNumberMask": "1188",
    "type": "loan",
    "balance": -18500.00,
    "isManual": false, "isHidden": false, "excludeFromNetWorth": false,
    "connectionStatus": "healthy",
    "lastSyncedAt": "2026-03-11T06:00:00Z",
    "balanceHistory": []
  }
]
```

---

### Recurring Transactions (4–5)

```json
[
  {
    "id": "rec-01", "name": "Rent", "emoji": "🏠",
    "categoryId": "cat-03", "frequency": "monthly", "status": "active",
    "expectedAmount": -1600.00, "amountMin": 1595, "amountMax": 1605,
    "expectedDayOfMonth": 1, "expectedDayRange": 2,
    "nameMatchRule": "contains", "nameMatchValue": "RENT",
    "accountId": "acc-03", "nextExpectedDate": "2026-04-01",
    "lastPaidDate": "2026-03-01", "isShared": false, "sharedSplitPercent": 1.0,
    "linkedTransactionIds": ["txn-001", "txn-051", "txn-101"]
  },
  {
    "id": "rec-02", "name": "Spotify", "emoji": "🎵",
    "categoryId": "cat-05", "frequency": "monthly", "status": "active",
    "expectedAmount": -9.99, "amountMin": 9, "amountMax": 11,
    "expectedDayOfMonth": 23, "expectedDayRange": 2,
    "nameMatchRule": "contains", "nameMatchValue": "SPOTIFY",
    "accountId": null, "nextExpectedDate": "2026-03-23",
    "lastPaidDate": "2026-02-23", "isShared": false, "sharedSplitPercent": 1.0,
    "linkedTransactionIds": ["txn-052", "txn-102"]
  },
  {
    "id": "rec-03", "name": "Netflix", "emoji": "🎬",
    "categoryId": "cat-07", "frequency": "monthly", "status": "active",
    "expectedAmount": -15.49, "amountMin": 15, "amountMax": 16,
    "expectedDayOfMonth": 18, "expectedDayRange": 2,
    "nameMatchRule": "contains", "nameMatchValue": "NETFLIX",
    "accountId": null, "nextExpectedDate": "2026-03-18",
    "lastPaidDate": "2026-02-18", "isShared": false, "sharedSplitPercent": 1.0,
    "linkedTransactionIds": ["txn-053", "txn-103"]
  },
  {
    "id": "rec-04", "name": "Planet Fitness", "emoji": "🏋️",
    "categoryId": "cat-14", "frequency": "monthly", "status": "active",
    "expectedAmount": -24.99, "amountMin": 24, "amountMax": 26,
    "expectedDayOfMonth": 7, "expectedDayRange": 2,
    "nameMatchRule": "contains", "nameMatchValue": "PLANET FITNESS",
    "accountId": null, "nextExpectedDate": "2026-04-07",
    "lastPaidDate": "2026-03-07", "isShared": false, "sharedSplitPercent": 1.0,
    "linkedTransactionIds": ["txn-054", "txn-104"]
  },
  {
    "id": "rec-05", "name": "Internet", "emoji": "📡",
    "categoryId": "cat-12", "frequency": "monthly", "status": "active",
    "expectedAmount": -79.99, "amountMin": 79, "amountMax": 81,
    "expectedDayOfMonth": 15, "expectedDayRange": 3,
    "nameMatchRule": "contains", "nameMatchValue": "XFINITY",
    "accountId": "acc-03", "nextExpectedDate": "2026-03-15",
    "lastPaidDate": "2026-02-15", "isShared": false, "sharedSplitPercent": 1.0,
    "linkedTransactionIds": ["txn-055", "txn-105"]
  }
]
```

---

### Transactions — 3 Months of Seed Data (50+ transactions)

The following covers January, February, and March 2026. March is in-progress (through March 12).

```json
[
  // ── MARCH 2026 (in progress) ──────────────────────────────────────────────
  { "id": "txn-001", "accountId": "acc-03", "date": "2026-03-01", "originalDate": "2026-03-01", "merchantName": "Rent", "originalMerchantName": "ZELLE PAYMENT RENT", "amount": -1600.00, "originalAmount": -1600.00, "tipAmount": 0, "type": "regular", "categoryId": "cat-03", "reviewed": true, "isRecurring": true, "recurringId": "rec-01", "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-002", "accountId": "acc-01", "date": "2026-03-02", "originalDate": "2026-03-02", "merchantName": "Whole Foods", "originalMerchantName": "WHOLE FOODS MARKET #412", "amount": -87.43, "originalAmount": -87.43, "tipAmount": 0, "type": "regular", "categoryId": "cat-02", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-003", "accountId": "acc-01", "date": "2026-03-03", "originalDate": "2026-03-03", "merchantName": "Starbucks", "originalMerchantName": "STARBUCKS #08821", "amount": -6.75, "originalAmount": -6.75, "tipAmount": 1.00, "type": "regular", "categoryId": "cat-08", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-004", "accountId": "acc-01", "date": "2026-03-04", "originalDate": "2026-03-04", "merchantName": "Chipotle", "originalMerchantName": "CHIPOTLE MEXICAN GRILL", "amount": -14.50, "originalAmount": -14.50, "tipAmount": 0, "type": "regular", "categoryId": "cat-01", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-005", "accountId": "acc-03", "date": "2026-03-05", "originalDate": "2026-03-05", "merchantName": "Shell Gas", "originalMerchantName": "SHELL OIL 574829", "amount": -52.30, "originalAmount": -52.30, "tipAmount": 0, "type": "regular", "categoryId": "cat-04", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-006", "accountId": "acc-03", "date": "2026-03-05", "originalDate": "2026-03-05", "merchantName": "Payroll", "originalMerchantName": "DIRECT DEPOSIT ACME CORP", "amount": 4200.00, "originalAmount": 4200.00, "tipAmount": 0, "type": "income", "categoryId": null, "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-007", "accountId": "acc-01", "date": "2026-03-06", "originalDate": "2026-03-06", "merchantName": "Amazon", "originalMerchantName": "AMAZON.COM*2H8K3", "amount": -32.99, "originalAmount": -32.99, "tipAmount": 0, "type": "regular", "categoryId": "cat-09", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-008", "accountId": "acc-02", "date": "2026-03-07", "originalDate": "2026-03-07", "merchantName": "Planet Fitness", "originalMerchantName": "PLANET FITNESS #0482", "amount": -24.99, "originalAmount": -24.99, "tipAmount": 0, "type": "regular", "categoryId": "cat-14", "reviewed": true, "isRecurring": true, "recurringId": "rec-04", "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-009", "accountId": "acc-01", "date": "2026-03-08", "originalDate": "2026-03-08", "merchantName": "Trader Joe's", "originalMerchantName": "TRADER JOES #221", "amount": -64.17, "originalAmount": -64.17, "tipAmount": 0, "type": "regular", "categoryId": "cat-02", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-010", "accountId": "acc-02", "date": "2026-03-09", "originalDate": "2026-03-09", "merchantName": "CVS Pharmacy", "originalMerchantName": "CVS/PHARMACY #7291", "amount": -28.40, "originalAmount": -28.40, "tipAmount": 0, "type": "regular", "categoryId": "cat-06", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-011", "accountId": "acc-01", "date": "2026-03-10", "originalDate": "2026-03-10", "merchantName": "Nobu Restaurant", "originalMerchantName": "NOBU RESTAURANT 0001", "amount": -82.00, "originalAmount": -82.00, "tipAmount": 18.00, "type": "regular", "categoryId": "cat-01", "reviewed": false, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-012", "accountId": "acc-02", "date": "2026-03-11", "originalDate": "2026-03-11", "merchantName": "Target", "originalMerchantName": "TARGET #0712", "amount": -47.63, "originalAmount": -47.63, "tipAmount": 0, "type": "regular", "categoryId": "cat-09", "reviewed": false, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-013", "accountId": "acc-03", "date": "2026-03-11", "originalDate": "2026-03-11", "merchantName": "Lyft", "originalMerchantName": "LYFT *RIDE SUN 3PM", "amount": -18.75, "originalAmount": -18.75, "tipAmount": 3.00, "type": "regular", "categoryId": "cat-04", "reviewed": false, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-014", "accountId": "acc-01", "date": "2026-03-12", "originalDate": "2026-03-12", "merchantName": "Sweetgreen", "originalMerchantName": "SWEETGREEN 0023 SF", "amount": -16.25, "originalAmount": -16.25, "tipAmount": 0, "type": "regular", "categoryId": "cat-01", "reviewed": false, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },

  // ── FEBRUARY 2026 ─────────────────────────────────────────────────────────
  { "id": "txn-051", "accountId": "acc-03", "date": "2026-02-01", "originalDate": "2026-02-01", "merchantName": "Rent", "originalMerchantName": "ZELLE PAYMENT RENT", "amount": -1600.00, "originalAmount": -1600.00, "tipAmount": 0, "type": "regular", "categoryId": "cat-03", "reviewed": true, "isRecurring": true, "recurringId": "rec-01", "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-052", "accountId": "acc-01", "date": "2026-02-02", "originalDate": "2026-02-02", "merchantName": "Whole Foods", "originalMerchantName": "WHOLE FOODS MARKET #412", "amount": -93.21, "originalAmount": -93.21, "tipAmount": 0, "type": "regular", "categoryId": "cat-02", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-053", "accountId": "acc-02", "date": "2026-02-03", "originalDate": "2026-02-03", "merchantName": "Starbucks", "originalMerchantName": "STARBUCKS #08821", "amount": -5.95, "originalAmount": -5.95, "tipAmount": 1.00, "type": "regular", "categoryId": "cat-08", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-054", "accountId": "acc-01", "date": "2026-02-05", "originalDate": "2026-02-05", "merchantName": "Payroll", "originalMerchantName": "DIRECT DEPOSIT ACME CORP", "amount": 4200.00, "originalAmount": 4200.00, "tipAmount": 0, "type": "income", "categoryId": null, "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-055", "accountId": "acc-02", "date": "2026-02-07", "originalDate": "2026-02-07", "merchantName": "Planet Fitness", "originalMerchantName": "PLANET FITNESS #0482", "amount": -24.99, "originalAmount": -24.99, "tipAmount": 0, "type": "regular", "categoryId": "cat-14", "reviewed": true, "isRecurring": true, "recurringId": "rec-04", "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-056", "accountId": "acc-01", "date": "2026-02-08", "originalDate": "2026-02-08", "merchantName": "Amazon", "originalMerchantName": "AMAZON.COM*9X2P1", "amount": -54.99, "originalAmount": -54.99, "tipAmount": 0, "type": "regular", "categoryId": "cat-09", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-057", "accountId": "acc-02", "date": "2026-02-10", "originalDate": "2026-02-10", "merchantName": "Chipotle", "originalMerchantName": "CHIPOTLE MEXICAN GRILL", "amount": -13.25, "originalAmount": -13.25, "tipAmount": 0, "type": "regular", "categoryId": "cat-01", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-058", "accountId": "acc-01", "date": "2026-02-12", "originalDate": "2026-02-12", "merchantName": "Trader Joe's", "originalMerchantName": "TRADER JOES #221", "amount": -71.88, "originalAmount": -71.88, "tipAmount": 0, "type": "regular", "categoryId": "cat-02", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-059", "accountId": "acc-02", "date": "2026-02-13", "originalDate": "2026-02-13", "merchantName": "Walgreens", "originalMerchantName": "WALGREENS #3291", "amount": -22.18, "originalAmount": -22.18, "tipAmount": 0, "type": "regular", "categoryId": "cat-06", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-060", "accountId": "acc-01", "date": "2026-02-14", "originalDate": "2026-02-14", "merchantName": "Valentines Dinner", "originalMerchantName": "BISTRO CENTRAL 0044", "amount": -145.00, "originalAmount": -145.00, "tipAmount": 29.00, "type": "regular", "categoryId": "cat-01", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": ["Date Night"], "notes": "Valentine's Day", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-061", "accountId": "acc-02", "date": "2026-02-15", "originalDate": "2026-02-15", "merchantName": "Xfinity Internet", "originalMerchantName": "XFINITY AUTO PAY", "amount": -79.99, "originalAmount": -79.99, "tipAmount": 0, "type": "regular", "categoryId": "cat-12", "reviewed": true, "isRecurring": true, "recurringId": "rec-05", "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-062", "accountId": "acc-01", "date": "2026-02-16", "originalDate": "2026-02-16", "merchantName": "Shell Gas", "originalMerchantName": "SHELL OIL 574829", "amount": -48.00, "originalAmount": -48.00, "tipAmount": 0, "type": "regular", "categoryId": "cat-04", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-063", "accountId": "acc-02", "date": "2026-02-18", "originalDate": "2026-02-18", "merchantName": "Netflix", "originalMerchantName": "NETFLIX.COM", "amount": -15.49, "originalAmount": -15.49, "tipAmount": 0, "type": "regular", "categoryId": "cat-07", "reviewed": true, "isRecurring": true, "recurringId": "rec-03", "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-064", "accountId": "acc-01", "date": "2026-02-20", "originalDate": "2026-02-20", "merchantName": "Haircut", "originalMerchantName": "GREAT CLIPS #2244", "amount": -25.00, "originalAmount": -25.00, "tipAmount": 5.00, "type": "regular", "categoryId": "cat-11", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-065", "accountId": "acc-02", "date": "2026-02-21", "originalDate": "2026-02-21", "merchantName": "Spotify", "originalMerchantName": "SPOTIFY USA", "amount": -9.99, "originalAmount": -9.99, "tipAmount": 0, "type": "regular", "categoryId": "cat-05", "reviewed": true, "isRecurring": true, "recurringId": "rec-02", "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-066", "accountId": "acc-01", "date": "2026-02-22", "originalDate": "2026-02-22", "merchantName": "Whole Foods", "originalMerchantName": "WHOLE FOODS MARKET #412", "amount": -55.77, "originalAmount": -55.77, "tipAmount": 0, "type": "regular", "categoryId": "cat-02", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-067", "accountId": "acc-02", "date": "2026-02-24", "originalDate": "2026-02-24", "merchantName": "Movie Tickets", "originalMerchantName": "AMC THEATERS #0088", "amount": -31.00, "originalAmount": -31.00, "tipAmount": 0, "type": "regular", "categoryId": "cat-07", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-068", "accountId": "acc-03", "date": "2026-02-25", "originalDate": "2026-02-25", "merchantName": "Chase CC Payment", "originalMerchantName": "CHASE AUTOPAY CREDIT CARD", "amount": -2200.00, "originalAmount": -2200.00, "tipAmount": 0, "type": "internal_transfer", "categoryId": null, "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-069", "accountId": "acc-01", "date": "2026-02-26", "originalDate": "2026-02-26", "merchantName": "Starbucks", "originalMerchantName": "STARBUCKS #08821", "amount": -7.45, "originalAmount": -7.45, "tipAmount": 1.50, "type": "regular", "categoryId": "cat-08", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-070", "accountId": "acc-02", "date": "2026-02-28", "originalDate": "2026-02-28", "merchantName": "Amazon Return", "originalMerchantName": "AMAZON REFUND*2H8K3", "amount": 32.99, "originalAmount": 32.99, "tipAmount": 0, "type": "regular", "categoryId": "cat-09", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "Returned item", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },

  // ── JANUARY 2026 ──────────────────────────────────────────────────────────
  { "id": "txn-101", "accountId": "acc-03", "date": "2026-01-01", "originalDate": "2026-01-01", "merchantName": "Rent", "originalMerchantName": "ZELLE PAYMENT RENT", "amount": -1600.00, "originalAmount": -1600.00, "tipAmount": 0, "type": "regular", "categoryId": "cat-03", "reviewed": true, "isRecurring": true, "recurringId": "rec-01", "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-102", "accountId": "acc-01", "date": "2026-01-03", "originalDate": "2026-01-03", "merchantName": "Whole Foods", "originalMerchantName": "WHOLE FOODS MARKET #412", "amount": -102.44, "originalAmount": -102.44, "tipAmount": 0, "type": "regular", "categoryId": "cat-02", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-103", "accountId": "acc-02", "date": "2026-01-04", "originalDate": "2026-01-04", "merchantName": "Starbucks", "originalMerchantName": "STARBUCKS #08821", "amount": -6.25, "originalAmount": -6.25, "tipAmount": 1.00, "type": "regular", "categoryId": "cat-08", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-104", "accountId": "acc-03", "date": "2026-01-05", "originalDate": "2026-01-05", "merchantName": "Payroll", "originalMerchantName": "DIRECT DEPOSIT ACME CORP", "amount": 4200.00, "originalAmount": 4200.00, "tipAmount": 0, "type": "income", "categoryId": null, "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-105", "accountId": "acc-02", "date": "2026-01-07", "originalDate": "2026-01-07", "merchantName": "Planet Fitness", "originalMerchantName": "PLANET FITNESS #0482", "amount": -24.99, "originalAmount": -24.99, "tipAmount": 0, "type": "regular", "categoryId": "cat-14", "reviewed": true, "isRecurring": true, "recurringId": "rec-04", "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-106", "accountId": "acc-01", "date": "2026-01-09", "originalDate": "2026-01-09", "merchantName": "Best Buy", "originalMerchantName": "BEST BUY #0312", "amount": -149.99, "originalAmount": -149.99, "tipAmount": 0, "type": "regular", "categoryId": "cat-09", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "New keyboard", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-107", "accountId": "acc-01", "date": "2026-01-11", "originalDate": "2026-01-11", "merchantName": "Trader Joe's", "originalMerchantName": "TRADER JOES #221", "amount": -58.33, "originalAmount": -58.33, "tipAmount": 0, "type": "regular", "categoryId": "cat-02", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-108", "accountId": "acc-02", "date": "2026-01-13", "originalDate": "2026-01-13", "merchantName": "Lyft", "originalMerchantName": "LYFT *RIDE MON 11PM", "amount": -24.50, "originalAmount": -24.50, "tipAmount": 4.00, "type": "regular", "categoryId": "cat-04", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-109", "accountId": "acc-01", "date": "2026-01-15", "originalDate": "2026-01-15", "merchantName": "Xfinity Internet", "originalMerchantName": "XFINITY AUTO PAY", "amount": -79.99, "originalAmount": -79.99, "tipAmount": 0, "type": "regular", "categoryId": "cat-12", "reviewed": true, "isRecurring": true, "recurringId": "rec-05", "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-110", "accountId": "acc-02", "date": "2026-01-16", "originalDate": "2026-01-16", "merchantName": "Shell Gas", "originalMerchantName": "SHELL OIL 574829", "amount": -55.10, "originalAmount": -55.10, "tipAmount": 0, "type": "regular", "categoryId": "cat-04", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-111", "accountId": "acc-01", "date": "2026-01-18", "originalDate": "2026-01-18", "merchantName": "Netflix", "originalMerchantName": "NETFLIX.COM", "amount": -15.49, "originalAmount": -15.49, "tipAmount": 0, "type": "regular", "categoryId": "cat-07", "reviewed": true, "isRecurring": true, "recurringId": "rec-03", "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-112", "accountId": "acc-02", "date": "2026-01-19", "originalDate": "2026-01-19", "merchantName": "Chipotle", "originalMerchantName": "CHIPOTLE MEXICAN GRILL", "amount": -11.75, "originalAmount": -11.75, "tipAmount": 0, "type": "regular", "categoryId": "cat-01", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-113", "accountId": "acc-01", "date": "2026-01-21", "originalDate": "2026-01-21", "merchantName": "New Year Party Supplies", "originalMerchantName": "PARTY CITY #0991", "amount": -62.44, "originalAmount": -62.44, "tipAmount": 0, "type": "regular", "categoryId": "cat-13", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": ["Party"], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-114", "accountId": "acc-02", "date": "2026-01-23", "originalDate": "2026-01-23", "merchantName": "Spotify", "originalMerchantName": "SPOTIFY USA", "amount": -9.99, "originalAmount": -9.99, "tipAmount": 0, "type": "regular", "categoryId": "cat-05", "reviewed": true, "isRecurring": true, "recurringId": "rec-02", "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-115", "accountId": "acc-01", "date": "2026-01-24", "originalDate": "2026-01-24", "merchantName": "Whole Foods", "originalMerchantName": "WHOLE FOODS MARKET #412", "amount": -79.90, "originalAmount": -79.90, "tipAmount": 0, "type": "regular", "categoryId": "cat-02", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-116", "accountId": "acc-02", "date": "2026-01-25", "originalDate": "2026-01-25", "merchantName": "Doctor Copay", "originalMerchantName": "UCSF HEALTH PAYMENT", "amount": -40.00, "originalAmount": -40.00, "tipAmount": 0, "type": "regular", "categoryId": "cat-06", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-117", "accountId": "acc-03", "date": "2026-01-26", "originalDate": "2026-01-26", "merchantName": "Chase CC Payment", "originalMerchantName": "CHASE AUTOPAY CREDIT CARD", "amount": -2450.00, "originalAmount": -2450.00, "tipAmount": 0, "type": "internal_transfer", "categoryId": null, "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-118", "accountId": "acc-01", "date": "2026-01-28", "originalDate": "2026-01-28", "merchantName": "Starbucks", "originalMerchantName": "STARBUCKS #08821", "amount": -6.50, "originalAmount": -6.50, "tipAmount": 1.00, "type": "regular", "categoryId": "cat-08", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-119", "accountId": "acc-02", "date": "2026-01-29", "originalDate": "2026-01-29", "merchantName": "Target", "originalMerchantName": "TARGET #0712", "amount": -38.14, "originalAmount": -38.14, "tipAmount": 0, "type": "regular", "categoryId": "cat-09", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null },
  { "id": "txn-120", "accountId": "acc-01", "date": "2026-01-31", "originalDate": "2026-01-31", "merchantName": "Electric Bill", "originalMerchantName": "PG&E AUTO PAY", "amount": -88.22, "originalAmount": -88.22, "tipAmount": 0, "type": "regular", "categoryId": "cat-12", "reviewed": true, "isRecurring": false, "recurringId": null, "tags": [], "notes": "", "isExcluded": false, "isSplit": false, "splitParentId": null, "splitChildren": [], "isManual": false, "currencyCode": "USD", "originalCurrencyCode": null, "originalCurrencyAmount": null }
]
```

**Seed data summary:**
- March 2026: 14 transactions ($1,358 spent, $4,200 income, 4 unreviewed)
- February 2026: 20 transactions ($1,520 spent, $4,200 income, all reviewed)
- January 2026: 20 transactions ($1,690 spent, $4,200 income, all reviewed)

**Tags used in seed data:** `["Date Night", "Party"]`

---

## 7. Scope Exclusions

The following features exist in the real Copilot Money app but are **explicitly out of scope** for this v1 React Native clone.

### Excluded Features

| Feature | Reason |
|---|---|
| **Bank account linking (Plaid/MX)** | Requires third-party API keys and backend; use mock data only |
| **Real-time transaction sync** | No backend; all data is local/static |
| **Cash Flow tab** | Screen included as a navigation stub only |
| **Goals / Savings Goals tab** | Not in priority 5 screens |
| **Investments tab** | Not in priority 5 screens; investments shown in Accounts only |
| **Widgets (iOS home screen)** | Requires WidgetKit (native iOS), not React Native |
| **Push notifications** | Requires backend + notification service |
| **iCloud sync / data backup** | Requires backend |
| **Subscription/paywall** | No auth, no payments |
| **Referral program / Free Months section** | Requires backend |
| **Cryptocurrency account integration** | API key management out of scope |
| **Real Estate / Car asset tracking** | Out of scope; use manual account stub |
| **International / foreign currency** | Seed data is USD only |
| **Export transactions (CSV)** | File system access out of scope for v1 |
| **Year in Review / Month in Review** | Analytics feature, out of scope |
| **Copilot Intelligence (AI categorization)** | Requires backend ML model |
| **Name rules / auto-categorization rules** | Out of scope for v1 |
| **macOS / iPadOS layout** | iOS only |
| **Accessibility (VoiceOver)** | Future enhancement |
| **Budget rebalancing tool** | Categories screen shows budgets; rebalancing UI deferred |
| **Optional budgeting toggle** | All categories in mock data have budgets set |
| **Budget rollover editing** | Rollovers shown in data model but no editing UI in v1 |

### In-Scope Summary (v1 Build)
Build the following and nothing else:
1. Dashboard screen (read-only, with mock data)
2. Categories screen (read-only, category detail sheet)
3. Transaction list screen (search + filter by category/type)
4. Transaction detail bottom sheet (view + edit: name, date, category, type, tags, notes, reviewed toggle)
5. Accounts screen (read-only net worth chart + account list)
6. Tab bar navigation with correct 5 tabs
7. Month selector on Dashboard + Categories + Transactions
8. Mark as reviewed (single transaction + bulk)
9. Category picker sheet (for transaction detail)
10. Split transaction sheet (UI only, no persistence edge cases)

---

*End of PRD — v1.0*
