import { create } from 'zustand';
import type { Account, RecurringTransaction } from '../types';
import { MOCK_ACCOUNTS, MOCK_RECURRINGS } from '../__mocks__/accounts';

interface AccountStore {
  accounts: Account[];
  recurrings: RecurringTransaction[];
  netWorthTimeRange: '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'ALL';
  // ── Mutators ────────────────────────────────────────────────────────────────
  updateAccount: (id: string, updates: Partial<Account>) => void;
  setNetWorthTimeRange: (range: AccountStore['netWorthTimeRange']) => void;
  updateRecurring: (id: string, updates: Partial<RecurringTransaction>) => void;
}

export const useAccountStore = create<AccountStore>((set) => ({
  accounts: MOCK_ACCOUNTS,
  recurrings: MOCK_RECURRINGS,
  netWorthTimeRange: '1M',

  updateAccount: (id, updates) =>
    set((state) => ({
      accounts: state.accounts.map((a) =>
        a.id === id ? { ...a, ...updates } : a,
      ),
    })),

  setNetWorthTimeRange: (netWorthTimeRange) => set({ netWorthTimeRange }),

  updateRecurring: (id, updates) =>
    set((state) => ({
      recurrings: state.recurrings.map((r) =>
        r.id === id ? { ...r, ...updates } : r,
      ),
    })),
}));
