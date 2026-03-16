import { useMemo } from 'react';
import { useTransactionStore } from '../stores/transactionStore';
import { useCategoryStore } from '../stores/categoryStore';
import { useAccountStore } from '../stores/accountStore';
import { useUIStore } from '../stores/uiStore';
import type { DailySpend, MonthlySpendingSummary } from '../types';

function getDaysInMonth(yearMonth: string): number {
  const [y, m] = yearMonth.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

function getPriorMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Computes all data needed by the Dashboard screen.
 * Memoized so re-renders are cheap.
 */
export function useDashboard() {
  const { transactions } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { recurrings } = useAccountStore();
  const { selectedMonth, goToPrevMonth, goToNextMonth } = useUIStore();

  const priorMonth = useMemo(() => getPriorMonth(selectedMonth), [selectedMonth]);
  const daysInMonth = useMemo(() => getDaysInMonth(selectedMonth), [selectedMonth]);

  /** Recurring transactions that are expected this month (not yet paid) */
  const upcomingRecurrings = useMemo(
    () =>
      recurrings.filter(
        (r) =>
          r.status === 'active' &&
          r.nextExpectedDate?.startsWith(selectedMonth),
      ),
    [recurrings, selectedMonth],
  );

  const summary: MonthlySpendingSummary = useMemo(() => {
    const monthTxns = transactions.filter((t) => t.date.startsWith(selectedMonth));
    const priorTxns = transactions.filter((t) => t.date.startsWith(priorMonth));

    const totalBudget = categories
      .filter((c) => !c.isOptional && c.budgetAmount != null)
      .reduce((s, c) => s + (c.budgetAmount ?? 0), 0);

    const regularSpent = (txns: typeof transactions) =>
      txns
        .filter((t) => t.type === 'regular' && !t.isExcluded && t.amount < 0 && !t.isRecurring)
        .reduce((s, t) => s + Math.abs(t.amount), 0);

    const totalIncome = (txns: typeof transactions) =>
      txns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

    const excludedSpend = (txns: typeof transactions) =>
      txns.filter((t) => t.isExcluded && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

    const totalSpent = regularSpent(monthTxns);
    const freeToSpend = totalBudget - totalSpent;

    // Build daily cumulative spending for the chart
    const dailyTotals: Record<number, number> = {};
    for (const txn of monthTxns) {
      if (txn.type === 'regular' && !txn.isExcluded && !txn.isRecurring && txn.amount < 0) {
        const day = parseInt(txn.date.slice(8, 10), 10);
        dailyTotals[day] = (dailyTotals[day] ?? 0) + Math.abs(txn.amount);
      }
    }

    let cumulative = 0;
    const dailySpending: DailySpend[] = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      cumulative += dailyTotals[day] ?? 0;
      return {
        day,
        cumulativeSpent: cumulative,
        idealSpend: (day / daysInMonth) * totalBudget,
      };
    });

    return {
      month: selectedMonth,
      totalBudget,
      totalSpent,
      totalIncome: totalIncome(monthTxns),
      totalExcluded: excludedSpend(monthTxns),
      freeToSpend,
      priorMonthTotalSpent: regularSpent(priorTxns),
      priorMonthTotalIncome: totalIncome(priorTxns),
      dailySpending,
    };
  }, [transactions, categories, selectedMonth, priorMonth, daysInMonth]);

  /** Top categories sorted by spent/budget ratio for the Dashboard budget preview */
  const topBudgetCategories = useMemo(() => {
    const monthTxns = transactions.filter((t) => t.date.startsWith(selectedMonth));
    const spending: Record<string, number> = {};
    for (const txn of monthTxns) {
      if (txn.type === 'regular' && !txn.isExcluded && txn.categoryId && txn.amount < 0) {
        spending[txn.categoryId] = (spending[txn.categoryId] ?? 0) + Math.abs(txn.amount);
      }
    }
    return categories
      .filter((c) => !c.isOptional && c.budgetAmount)
      .map((c) => ({ category: c, spent: spending[c.id] ?? 0 }))
      .sort((a, b) => b.spent / (b.category.budgetAmount ?? 1) - a.spent / (a.category.budgetAmount ?? 1))
      .slice(0, 5);
  }, [transactions, categories, selectedMonth]);

  return {
    summary,
    topBudgetCategories,
    upcomingRecurrings,
    selectedMonth,
    daysInMonth,
    goToPrevMonth,
    goToNextMonth,
  };
}
