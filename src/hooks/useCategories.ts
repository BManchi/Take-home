import { useMemo } from 'react';
import { useCategoryStore } from '../stores/categoryStore';
import { useTransactionStore } from '../stores/transactionStore';
import { useUIStore } from '../stores/uiStore';

/**
 * Derives per-category spending totals for the selected month.
 */
export function useCategories() {
  const { categories, groups, tags, updateCategory, setBudget, toggleGroupExpanded } =
    useCategoryStore();
  const { transactions } = useTransactionStore();
  const { selectedMonth } = useUIStore();

  /** Spending totals per category for the selected month */
  const categorySpending = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const txn of transactions) {
      if (
        txn.date.startsWith(selectedMonth) &&
        txn.type === 'regular' &&
        !txn.isExcluded &&
        txn.categoryId
      ) {
        totals[txn.categoryId] = (totals[txn.categoryId] ?? 0) + Math.abs(txn.amount);
      }
    }
    return totals;
  }, [transactions, selectedMonth]);

  /** Total budget across all non-optional, budgeted categories */
  const totalBudget = useMemo(
    () =>
      categories
        .filter((c) => !c.isOptional && c.budgetAmount != null)
        .reduce((sum, c) => sum + (c.budgetAmount ?? 0), 0),
    [categories],
  );

  /** Total spent across all non-optional, non-excluded regular transactions */
  const totalSpent = useMemo(
    () => Object.values(categorySpending).reduce((s, v) => s + v, 0),
    [categorySpending],
  );

  /** Categories sorted by spend amount descending */
  const categoriesBySpend = useMemo(
    () =>
      [...categories].sort(
        (a, b) => (categorySpending[b.id] ?? 0) - (categorySpending[a.id] ?? 0),
      ),
    [categories, categorySpending],
  );

  return {
    categories,
    categoriesBySpend,
    groups,
    tags,
    categorySpending,
    totalBudget,
    totalSpent,
    updateCategory,
    setBudget,
    toggleGroupExpanded,
  };
}
