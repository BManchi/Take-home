import { useMemo } from 'react';
import { useTransactionStore } from '../stores/transactionStore';
import { useUIStore } from '../stores/uiStore';
import type { Transaction } from '../types';

/**
 * Facade hook: combines the transaction store with the shared UI state
 * (selected month, active filters) to derive filtered views.
 */
export function useTransactions() {
  const store = useTransactionStore();
  const { selectedMonth, transactionFilters } = useUIStore();

  /** All transactions in the currently selected month */
  const monthlyTransactions = useMemo(
    () => store.transactions.filter((t) => t.date.startsWith(selectedMonth)),
    [store.transactions, selectedMonth],
  );

  /** Non-excluded regular transactions needing review this month */
  const pendingReview = useMemo(
    () =>
      monthlyTransactions.filter(
        (t) => !t.reviewed && t.type === 'regular' && !t.isExcluded,
      ),
    [monthlyTransactions],
  );

  /** Transactions matching all active filters + search */
  const filteredTransactions = useMemo(() => {
    const { categoryIds, types, tagNames, accountIds, searchQuery } = transactionFilters;
    return store.transactions.filter((t) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !t.merchantName.toLowerCase().includes(q) &&
          !t.originalMerchantName.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (categoryIds.length && !categoryIds.includes(t.categoryId ?? '')) return false;
      if (types.length && !types.includes(t.type)) return false;
      if (accountIds.length && !accountIds.includes(t.accountId)) return false;
      if (tagNames.length && !tagNames.some((tag) => t.tags.includes(tag))) return false;
      return true;
    });
  }, [store.transactions, transactionFilters]);

  /** Grouped by month descending for the transaction list view */
  const groupedByMonth = useMemo(() => {
    const months: Record<string, Transaction[]> = {};
    for (const txn of filteredTransactions) {
      const month = txn.date.slice(0, 7);
      if (!months[month]) months[month] = [];
      months[month].push(txn);
    }
    return Object.entries(months)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, txns]) => ({
        month,
        transactions: txns.sort((a, b) => b.date.localeCompare(a.date)),
        totalSpent: txns
          .filter((t) => t.type === 'regular' && !t.isExcluded && t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      }));
  }, [filteredTransactions]);

  return {
    // Raw store access
    allTransactions: store.transactions,
    isLoading: store.isLoading,
    // Derived views
    monthlyTransactions,
    pendingReview,
    filteredTransactions,
    groupedByMonth,
    // Actions
    markReviewed: store.markReviewed,
    markAllReviewed: store.markAllReviewed,
    updateTransaction: store.updateTransaction,
    addTransaction: store.addTransaction,
  };
}
