import { create } from 'zustand';
import type { Transaction } from '../types';
import { MOCK_TRANSACTIONS } from '../__mocks__/transactions';

interface TransactionStore {
  transactions: Transaction[];
  isLoading: boolean;
  // ── Mutators ────────────────────────────────────────────────────────────────
  setTransactions: (txns: Transaction[]) => void;
  setLoading: (loading: boolean) => void;
  markReviewed: (id: string) => void;
  markAllReviewed: (ids: string[]) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  addTransaction: (txn: Transaction) => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  // Pre-loaded with mock data so screens work immediately
  transactions: MOCK_TRANSACTIONS,
  isLoading: false,

  setTransactions: (transactions) => set({ transactions }),
  setLoading: (isLoading) => set({ isLoading }),

  markReviewed: (id) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, reviewed: true } : t,
      ),
    })),

  markAllReviewed: (ids) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        ids.includes(t.id) ? { ...t, reviewed: true } : t,
      ),
    })),

  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t,
      ),
    })),

  addTransaction: (txn) =>
    set((state) => ({
      transactions: [txn, ...state.transactions],
    })),
}));
