
# The 6-hour Copilot Money clone: a complete battle plan

The strategy leverages clean-architecture from native Android while sidestepping React Native's learning curve by letting AI agents handle framework-specific syntax. Below is every decision pre-made and every minute accounted for.

## The tech stack: one choice per layer, zero debate

The entire stack selection optimizes for a single variable: **AI-agent code-generation accuracy**. Libraries with massive community adoption produce dramatically fewer Claude Code hallucinations.

| Layer | Choice | Why this wins |
|-------|--------|--------------|
| Framework | **Expo SDK 54/55 + Expo Router** | Zero native toolchain setup. File-based routing means folder structure = navigation. Running app in <2 min |
| Styling | **NativeWind v4 + react-native-reusables** | Tailwind classes are the single most AI-friendly styling paradigm. react-native-reusables ports shadcn/ui components to RN — premium finance-app aesthetics out of the box |
| State | **Zustand** | 2.7KB, zero boilerplate. Stores map directly to Android ViewModels. `set()` = `copy()` on Kotlin data classes |
| Database | **expo-sqlite + DrizzleORM** | Type-safe SQL with `useLiveQuery` reactivity. DrizzleORM schema ≈ Room `@Entity`, queries ≈ Room `@Dao`. Official Expo blog endorsement |
| KV Storage | **react-native-mmkv** | For preferences and Zustand persistence. 30x faster than AsyncStorage |
| Charts | **react-native-gifted-charts** | 5-minute setup, beautiful defaults, covers all finance chart types (line, bar, pie, donut) |
| Bottom Sheets | **@gorhom/bottom-sheet v5** | Industry standard, gesture-driven, Reanimated-powered. Essential for transaction detail editing |
| Icons | **lucide-react-native** | 1,500+ clean icons matching shadcn aesthetic. Same icon set the web version of shadcn/ui uses |
| Font | **Inter** via expo-google-fonts | Professional, excellent number readability — critical for a finance app |

**Expo over bare React Native is not a close call.** Expo is now the React Native team's officially recommended framework. For a 6-hour challenge, it eliminates 30+ minutes of Xcode/CocoaPods/Gradle configuration. Every finance-app feature we need — SQLite, secure storage, biometric auth, haptics, blur effects — ships in the Expo SDK. The old "walled garden" limitation is dead: `expo-dev-client` and config plugins allow any native module.

**Expo Router over React Navigation** saves another 15 minutes. File-based routing means the folder structure *is* the navigation tree — AI agents understand this instantly, and Bruno's mental model from composable navigation in Jetpack Compose transfers directly.

## How the architecture maps to KMP concepts

Bruno's biggest advantage is thinking in layers. React Native's ecosystem supports clean architecture; the naming is just different.

```
┌─────────────────────────────────────────┐
│     Screens (Expo Router file-based)     │  ← Activity/Fragment
│     Uses facade hooks for data access    │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Facade Hooks (custom hooks)      │  ← ViewModel / UseCase
│     Combines Zustand store + DB calls    │
│     Business logic lives here            │
└──────────┬───────────────┬──────────────┘
           │               │
┌──────────▼─────┐ ┌──────▼──────────────┐
│  Zustand Store │ │  DrizzleORM +       │
│  (UI state,    │ │  expo-sqlite        │
│   loading,     │ │  (persistent data)  │  ← Room DAO + Entity
│   filters)     │ │                     │
└────────────────┘ └─────────────────────┘
```

**Zustand stores are ViewModels.** Each feature gets one store holding UI state (loading flags, selected filters, modal visibility). Actions on the store are MVI intents. The `set()` function produces immutable state updates, identical in spirit to Kotlin `data class copy()`.

**DrizzleORM schemas are Room entities.** Define a `transactions` table in TypeScript and DrizzleORM generates insert/select types automatically — no manual interface writing. The `useLiveQuery` hook works like Room's `Flow<List<T>>` return type: the UI re-renders whenever underlying data changes.

**Facade hooks are UseCases.** A `useTransactions()` hook composes the Zustand store (for filter state) with DrizzleORM queries (for data), exposing a clean API to screens. This is the exact pattern of a Kotlin `UseCase` class calling a `Repository`.

## The Copilot Money app: what to build and what to skip

Copilot Money is an Apple Design Award finalist with **8 swipeable tabs** (Dashboard, Cash Flow, Categories, Accounts, Investments, Transactions, Recurrings, Goals). Building all 8 is impossible in 6 hours. The strategy is to nail **5 core screens** that capture Copilot's signature design language and a convincing feature set.

**The 5 must-build screens, in priority order:**

**1. Dashboard** — This is Copilot's hero screen and the most visually distinctive. It contains a spending-pace line chart at the top (solid line = actual spending, dotted line = ideal pace, with green/yellow/red coloring), a "To Review" transaction queue with a blue dot indicator and "Mark as Reviewed" button, a budget snapshot with colored progress bars, a horizontally scrollable "Upcoming" recurrings row, and a "Net This Month" summary card showing income vs. spend. The Dashboard alone demonstrates comprehension of the app's core value prop.

**2. Categories/Budget screen** — A bar chart showing total spent vs. total budget at top, then a scrollable list of categories. Each row shows an **emoji icon** (🥑 Groceries, ☕ Coffee, 🔑 Rent), a colored progress bar (green under pace → yellow → red over budget), and spent/budget amounts. Tapping a category opens a detail view with monthly spending history. This screen showcases the budget intelligence that defines Copilot.

**3. Transaction list** — Grouped by date, with each row displaying merchant name, category emoji + label, amount, and type indicators (T = transfer, I = income, R = recurring). A search bar and filter system at top. Unreviewed transactions show a light-blue dot. The "+" button enables manual transaction creation.

**4. Transaction detail (bottom sheet)** — Triggered by tapping any transaction. Editable fields for name, date, amount, category (with emoji picker), and transaction type (Expense/Income/Transfer). Notes field, "Exclude from budget" toggle, and save button. This is where `@gorhom/bottom-sheet` earns its place in the stack.

**5. Accounts screen** — Net worth line chart at top with a 1M/3M/6M/1Y/ALL timeframe selector. Below, accounts grouped by type (Credit Cards, Depository, Investments, Loans) with institution name, balance, and percent change or credit utilization indicator.

**Skip entirely:** Plaid bank connection, cloud sync, authentication, onboarding, Investments tab (requires live market data), Goals tab, widgets, notifications, transaction rules engine, export functionality.

**Copilot's design DNA to replicate:** Emoji-first category icons make scanning instant and delightful. Color-as-signal (green/yellow/red) communicates budget health at a glance. Generous whitespace with card-based sections on the dashboard. Dark mode support. The spending-pace line chart is the single most recognizable UI element — getting this right sells the clone.

## Parallel Claude Code agents: the force multiplier

Running **two Claude Code instances in parallel git worktrees** doubles throughput during the 3.5-hour implementation phase. Claude Code has native first-class worktree support via the `--worktree` flag.

```bash
# Terminal 1: UI Agent
claude --worktree feature-ui

# Terminal 2: Data Agent
claude --worktree feature-data
```

Each worktree creates an isolated directory at `.claude/worktrees/<name>/` with its own branch, working directory, and staging area — but shares git history with the main repo.

**The split is clean because the dependency flows one direction.** The Data Agent builds services, hooks, and database schemas. The UI Agent builds screens and components using mock data. At integration time, the UI Agent swaps mock imports for real hooks. There is zero file overlap:

```
src/
├── types/           ← SHARED (defined on main before branching)
├── __mocks__/       ← UI Agent reads, Data Agent ignores
├── app/             ← UI Agent OWNS (Expo Router screens)
├── components/      ← UI Agent OWNS
├── theme/           ← UI Agent OWNS
├── stores/          ← Data Agent OWNS (Zustand stores)
├── hooks/           ← Data Agent OWNS (facade hooks)
├── database/        ← Data Agent OWNS (DrizzleORM schema + migrations)
└── services/        ← Data Agent OWNS
```

**The contract is TypeScript interfaces.** Before spawning parallel agents, Bruno defines all shared types in `src/types/` on the `main` branch. Both agents branch from this shared base and implement against the interfaces, never against each other's code. This is the single most effective way to prevent integration conflicts.

**CLAUDE.md keeps agents in their lanes.** Create a root-level instruction file that both agents read:

```markdown
# CLAUDE.md
## Architecture: Feature-based clean separation
## Agent Boundaries:
- UI Agent: ONLY modify src/app/, src/components/, src/theme/
- Data Agent: ONLY modify src/stores/, src/hooks/, src/database/, src/services/
## Shared types in src/types/ are READ-ONLY. Never modify.
## Use mock data from src/__mocks__/ for UI development.
```

**Integration order matters.** Merge the Data Agent's branch to `main` first (it has no UI dependencies). Then merge the UI Agent's branch and replace mock imports with real hook imports — a mechanical find-and-replace operation that takes 10 minutes.

## The PRD: feeding the machines

The format is a single `docs/PRD.md` file referenced from `CLAUDE.md`. AI agents consume structured markdown with TypeScript interfaces far more reliably than prose requirements.

The most critical section is **data models defined as TypeScript interfaces** — these become the contract for parallel agents and the schema source for DrizzleORM:

```typescript
export interface Transaction {
  id: string;
  amount: number;
  date: string;
  categoryId: string;
  merchant: string;
  isRecurring: boolean;
  isReviewed: boolean;
  accountId: string;
  type: 'expense' | 'income' | 'transfer';
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  budgetAmount: number;
  groupId?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'loan';
  balance: number;
  institution: string;
}
```

The PRD should include a screen inventory (one section per screen with purpose, data displayed, user actions, and component names), a text-based navigation flow diagram, mock data as JSON for the UI Agent, and checkbox-style acceptance criteria (`- [ ]`) so agents can self-verify their work.

**To reverse-engineer Copilot's features efficiently:** fetch the help center at `help.copilot.money/en/` (the Quick Start Guide alone provides 80% of the feature map), analyze App Store screenshots with Claude's vision capabilities to extract UI patterns, and search YouTube for "Copilot Money walkthrough 2026" — a 10-minute video reveals every screen and interaction better than any help article.

## Minute-by-minute execution timeline

| Time | Phase | Activity |
|------|-------|----------|
| **0:00–0:30** | **Setup** | `npx create-expo-app finance-app`, install all deps (NativeWind, DrizzleORM, Zustand, gifted-charts, bottom-sheet, lucide, Inter font, MMKV). Configure NativeWind + Tailwind. Verify app runs with `npx expo start` |
| **0:30–1:00** | **Architecture** | Define TypeScript interfaces in `src/types/`. Create DrizzleORM schema in `src/database/schema.ts`. Write CLAUDE.md. Create mock data in `src/__mocks__/`. Set up Zustand stores skeleton. Create Expo Router file structure for 5 screens. Commit to `main` |
| **1:00–1:15** | **Agent Launch** | Open two terminals. Launch `claude --worktree feature-ui` and `claude --worktree feature-data`. Give each agent its assignment via the CLAUDE.md context plus specific feature instructions |
| **1:15–4:30** | **Parallel Build** | UI Agent builds all 5 screens + components using mock data. Data Agent implements DrizzleORM queries, Zustand stores with real logic, facade hooks, seed data generator. Bruno monitors both, answers questions, and course-corrects |
| **4:30–5:00** | **Integration** | Merge data branch → main. Merge UI branch → main. Replace mock imports with real hooks. Fix any type mismatches |
| **5:00–5:45** | **Polish** | Dark mode toggle, haptic feedback on interactions, loading states, empty states, error boundaries. Run through each screen and fix visual issues |
| **5:45–6:00** | **Ship** | Final commit, README with setup instructions, record a 60-second demo video walking through the app |

## What makes this plan survive contact with reality

Three design decisions make this plan resilient to the inevitable surprises of a 6-hour sprint.

**First, the mock-data-first approach means the UI Agent is never blocked.** Even if the Data Agent hits a DrizzleORM configuration snag, the UI Agent keeps building screens against mock data. The app looks complete visually at hour 4 regardless of data layer status.

**Second, every library in the stack has been chosen for AI-agent accuracy, not theoretical superiority.** Zustand over Redux Toolkit saves ~200 lines of boilerplate the AI would need to generate correctly. NativeWind means Claude Code writes Tailwind classes it's seen millions of times in web training data. expo-sqlite + DrizzleORM uses standard SQL patterns any model knows cold. WatermelonDB's decorator-based ORM and Legend State's signal-based `$value` bindings would produce more hallucinations.

**Third, the 5-screen scope is deliberately conservative.** Five polished screens with real data, smooth animations, and dark mode support will impress more than eight half-broken screens. If time remains after the core five, add the Cash Flow and Recurrings screens — they're visually simple bar-chart and list views that Claude Code can generate in 15 minutes each.

## Conclusion: architecture thinking transfers, syntax doesn't matter

Bruno's KMP experience is actually his greatest asset here — not despite being new to React Native, but because of the architectural clarity it trained. Clean architecture, unidirectional data flow, separation of presentation from domain logic — these patterns are identical across platforms. The only thing that changes is syntax, and that's exactly what AI agents handle best. By front-loading architectural decisions (this plan) and offloading syntax generation (Claude Code), Bruno inverts the typical challenge: instead of fighting an unfamiliar framework, he orchestrates AI agents within a familiar architectural blueprint. The 6 hours become about *directing* rather than *typing*.

