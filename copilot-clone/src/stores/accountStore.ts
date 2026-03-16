import { create } from 'zustand';
import { eq } from 'drizzle-orm';
import { db } from '../database/client';
import { accounts as accTable, recurringTransactions as recTable } from '../database/schema';
import { loadAllAccounts, loadAllRecurrings } from '../database/db-service';
import { MOCK_ACCOUNTS, MOCK_RECURRINGS } from '../__mocks__/accounts';
import type { Account, RecurringTransaction } from '../types';

interface AccountStore {
  accounts: Account[];
  recurrings: RecurringTransaction[];
  netWorthTimeRange: '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'ALL';
  // ── Init ────────────────────────────────────────────────────────────────────
  initFromDb: () => Promise<void>;
  // ── Mutators ────────────────────────────────────────────────────────────────
  updateAccount: (id: string, updates: Partial<Account>) => void;
  setNetWorthTimeRange: (range: AccountStore['netWorthTimeRange']) => void;
  updateRecurring: (id: string, updates: Partial<RecurringTransaction>) => void;
}

export const useAccountStore = create<AccountStore>((set) => ({
  accounts: MOCK_ACCOUNTS,
  recurrings: MOCK_RECURRINGS,
  netWorthTimeRange: '1M',

  initFromDb: async () => {
    try {
      const [accs, recs] = await Promise.all([loadAllAccounts(), loadAllRecurrings()]);
      if (accs.length > 0) set({ accounts: accs, recurrings: recs });
    } catch (err) {
      console.error('[DB] accountStore.initFromDb failed:', err);
    }
  },

  updateAccount: (id, updates) => {
    set((state) => ({
      accounts: state.accounts.map((a) =>
        a.id === id ? { ...a, ...updates } : a,
      ),
    }));
    const dbUpdates: Partial<typeof accTable.$inferInsert> = {};
    if (updates.institutionName     !== undefined) dbUpdates.institutionName     = updates.institutionName;
    if (updates.accountName         !== undefined) dbUpdates.accountName         = updates.accountName;
    if (updates.balance             !== undefined) dbUpdates.balance             = updates.balance;
    if (updates.availableCredit     !== undefined) dbUpdates.availableCredit     = updates.availableCredit;
    if (updates.creditLimit         !== undefined) dbUpdates.creditLimit         = updates.creditLimit;
    if (updates.creditUtilization   !== undefined) dbUpdates.creditUtilization   = updates.creditUtilization;
    if (updates.isHidden            !== undefined) dbUpdates.isHidden            = updates.isHidden;
    if (updates.excludeFromNetWorth !== undefined) dbUpdates.excludeFromNetWorth = updates.excludeFromNetWorth;
    if (updates.connectionStatus    !== undefined) dbUpdates.connectionStatus    = updates.connectionStatus;
    if (updates.lastSyncedAt        !== undefined) dbUpdates.lastSyncedAt        = updates.lastSyncedAt;

    if (Object.keys(dbUpdates).length > 0) {
      db.update(accTable)
        .set(dbUpdates)
        .where(eq(accTable.id, id))
        .catch((err) => console.error('[DB] updateAccount failed:', err));
    }
  },

  setNetWorthTimeRange: (netWorthTimeRange) => set({ netWorthTimeRange }),

  updateRecurring: (id, updates) => {
    set((state) => ({
      recurrings: state.recurrings.map((r) =>
        r.id === id ? { ...r, ...updates } : r,
      ),
    }));
    const dbUpdates: Partial<typeof recTable.$inferInsert> = {};
    if (updates.name              !== undefined) dbUpdates.name              = updates.name;
    if (updates.status            !== undefined) dbUpdates.status            = updates.status;
    if (updates.expectedAmount    !== undefined) dbUpdates.expectedAmount    = updates.expectedAmount;
    if (updates.nextExpectedDate  !== undefined) dbUpdates.nextExpectedDate  = updates.nextExpectedDate;
    if (updates.lastPaidDate      !== undefined) dbUpdates.lastPaidDate      = updates.lastPaidDate;
    if (updates.categoryId        !== undefined) dbUpdates.categoryId        = updates.categoryId;
    if (updates.linkedTransactionIds !== undefined) {
      dbUpdates.linkedTransactionIds = JSON.stringify(updates.linkedTransactionIds);
    }

    if (Object.keys(dbUpdates).length > 0) {
      db.update(recTable)
        .set(dbUpdates)
        .where(eq(recTable.id, id))
        .catch((err) => console.error('[DB] updateRecurring failed:', err));
    }
  },
}));
