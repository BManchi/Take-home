import { create } from 'zustand';
import type { TransactionType } from '../types';

interface TransactionFilters {
  categoryIds: string[];
  types: TransactionType[];
  tagNames: string[];
  accountIds: string[];
  searchQuery: string;
}

interface UIStore {
  // ── Month selection (shared across Dashboard, Categories, Transactions) ──────
  selectedMonth: string; // 'YYYY-MM'
  setSelectedMonth: (month: string) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;

  // ── Active bottom sheets ─────────────────────────────────────────────────────
  activeTransactionId: string | null;
  activeCategoryId: string | null;
  openTransactionSheet: (id: string) => void;
  closeTransactionSheet: () => void;
  openCategorySheet: (id: string) => void;
  closeCategorySheet: () => void;

  // ── Transaction filters ──────────────────────────────────────────────────────
  transactionFilters: TransactionFilters;
  setSearchQuery: (q: string) => void;
  toggleCategoryFilter: (id: string) => void;
  toggleTypeFilter: (type: TransactionType) => void;
  toggleAccountFilter: (id: string) => void;
  toggleTagFilter: (name: string) => void;
  clearFilters: () => void;
}

const today = new Date();
const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

const defaultFilters: TransactionFilters = {
  categoryIds: [],
  types: [],
  tagNames: [],
  accountIds: [],
  searchQuery: '',
};

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export const useUIStore = create<UIStore>((set) => ({
  selectedMonth: currentMonth,

  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
  goToPrevMonth: () =>
    set((s) => ({ selectedMonth: shiftMonth(s.selectedMonth, -1) })),
  goToNextMonth: () =>
    set((s) => ({ selectedMonth: shiftMonth(s.selectedMonth, 1) })),

  activeTransactionId: null,
  activeCategoryId: null,

  openTransactionSheet: (id) => set({ activeTransactionId: id }),
  closeTransactionSheet: () => set({ activeTransactionId: null }),
  openCategorySheet: (id) => set({ activeCategoryId: id }),
  closeCategorySheet: () => set({ activeCategoryId: null }),

  transactionFilters: defaultFilters,

  setSearchQuery: (q) =>
    set((s) => ({
      transactionFilters: { ...s.transactionFilters, searchQuery: q },
    })),

  toggleCategoryFilter: (id) =>
    set((s) => ({
      transactionFilters: {
        ...s.transactionFilters,
        categoryIds: toggle(s.transactionFilters.categoryIds, id),
      },
    })),

  toggleTypeFilter: (type) =>
    set((s) => ({
      transactionFilters: {
        ...s.transactionFilters,
        types: toggle(s.transactionFilters.types, type),
      },
    })),

  toggleAccountFilter: (id) =>
    set((s) => ({
      transactionFilters: {
        ...s.transactionFilters,
        accountIds: toggle(s.transactionFilters.accountIds, id),
      },
    })),

  toggleTagFilter: (name) =>
    set((s) => ({
      transactionFilters: {
        ...s.transactionFilters,
        tagNames: toggle(s.transactionFilters.tagNames, name),
      },
    })),

  clearFilters: () => set({ transactionFilters: defaultFilters }),
}));
