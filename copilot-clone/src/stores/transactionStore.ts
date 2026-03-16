import { create } from 'zustand';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../database/client';
import { transactions as txnTable } from '../database/schema';
import {
  loadAllTransactions,
} from '../database/db-service';
import { MOCK_TRANSACTIONS } from '../__mocks__/transactions';
import type { Transaction } from '../types';

interface TransactionStore {
  transactions: Transaction[];
  isLoading: boolean;
  // ── Init ────────────────────────────────────────────────────────────────────
  initFromDb: () => Promise<void>;
  // ── Mutators ────────────────────────────────────────────────────────────────
  setTransactions: (txns: Transaction[]) => void;
  setLoading: (loading: boolean) => void;
  markReviewed: (id: string) => void;
  markAllReviewed: (ids: string[]) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  addTransaction: (txn: Transaction) => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  // Fallback to mocks so the app works if initFromDb hasn't run yet
  transactions: MOCK_TRANSACTIONS,
  isLoading: false,

  initFromDb: async () => {
    set({ isLoading: true });
    try {
      const txns = await loadAllTransactions();
      // If DB is empty (before first seed), keep mocks
      if (txns.length > 0) set({ transactions: txns });
    } catch (err) {
      console.error('[DB] transactionStore.initFromDb failed:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  setTransactions: (transactions) => set({ transactions }),
  setLoading: (isLoading) => set({ isLoading }),

  markReviewed: (id) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, reviewed: true } : t,
      ),
    }));
    db.update(txnTable)
      .set({ reviewed: true })
      .where(eq(txnTable.id, id))
      .catch((err) => console.error('[DB] markReviewed failed:', err));
  },

  markAllReviewed: (ids) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        ids.includes(t.id) ? { ...t, reviewed: true } : t,
      ),
    }));
    db.update(txnTable)
      .set({ reviewed: true })
      .where(inArray(txnTable.id, ids))
      .catch((err) => console.error('[DB] markAllReviewed failed:', err));
  },

  updateTransaction: (id, updates) => {
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t,
      ),
    }));
    // Map TS fields → DB columns (handle JSON columns explicitly)
    const dbUpdates: Partial<typeof txnTable.$inferInsert> = {};
    if (updates.merchantName  !== undefined) dbUpdates.merchantName  = updates.merchantName;
    if (updates.date          !== undefined) dbUpdates.date          = updates.date;
    if (updates.amount        !== undefined) dbUpdates.amount        = updates.amount;
    if (updates.categoryId    !== undefined) dbUpdates.categoryId    = updates.categoryId;
    if (updates.type          !== undefined) dbUpdates.type          = updates.type;
    if (updates.notes         !== undefined) dbUpdates.notes         = updates.notes;
    if (updates.isExcluded    !== undefined) dbUpdates.isExcluded    = updates.isExcluded;
    if (updates.reviewed      !== undefined) dbUpdates.reviewed      = updates.reviewed;
    if (updates.tags          !== undefined) dbUpdates.tagsJson      = JSON.stringify(updates.tags);
    if (updates.splitChildren !== undefined) dbUpdates.splitChildrenJson = JSON.stringify(updates.splitChildren);

    if (Object.keys(dbUpdates).length > 0) {
      db.update(txnTable)
        .set(dbUpdates)
        .where(eq(txnTable.id, id))
        .catch((err) => console.error('[DB] updateTransaction failed:', err));
    }
  },

  addTransaction: (txn) => {
    set((state) => ({
      transactions: [txn, ...state.transactions],
    }));
    db.insert(txnTable)
      .values({
        id:                     txn.id,
        accountId:              txn.accountId,
        date:                   txn.date,
        originalDate:           txn.originalDate,
        merchantName:           txn.merchantName,
        originalMerchantName:   txn.originalMerchantName,
        amount:                 txn.amount,
        originalAmount:         txn.originalAmount,
        tipAmount:              txn.tipAmount,
        type:                   txn.type,
        categoryId:             txn.categoryId,
        reviewed:               txn.reviewed,
        isRecurring:            txn.isRecurring,
        recurringId:            txn.recurringId,
        tagsJson:               JSON.stringify(txn.tags),
        notes:                  txn.notes,
        isExcluded:             txn.isExcluded,
        isSplit:                txn.isSplit,
        splitParentId:          txn.splitParentId,
        splitChildrenJson:      JSON.stringify(txn.splitChildren),
        isManual:               txn.isManual,
        currencyCode:           txn.currencyCode,
        originalCurrencyCode:   txn.originalCurrencyCode,
        originalCurrencyAmount: txn.originalCurrencyAmount,
      })
      .onConflictDoNothing()
      .catch((err) => console.error('[DB] addTransaction failed:', err));
  },
}));
