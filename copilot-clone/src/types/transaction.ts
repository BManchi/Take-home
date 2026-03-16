export type TransactionType = 'regular' | 'income' | 'internal_transfer';

export interface Transaction {
  id: string;
  accountId: string;
  /** ISO date "YYYY-MM-DD" */
  date: string;
  originalDate: string;
  /** User-editable display name */
  merchantName: string;
  /** Immutable raw name from bank */
  originalMerchantName: string;
  /** Negative = debit/spend, positive = credit/income */
  amount: number;
  originalAmount: number;
  /** Extracted tip amount; shows gray dot when > 0 */
  tipAmount: number;
  type: TransactionType;
  /** null for income / internal transfers */
  categoryId: string | null;
  reviewed: boolean;
  isRecurring: boolean;
  recurringId: string | null;
  tags: string[];
  notes: string;
  /** Excluded from budgets and spending totals */
  isExcluded: boolean;
  isSplit: boolean;
  splitParentId: string | null;
  splitChildren: string[];
  isManual: boolean;
  currencyCode: string;
  originalCurrencyCode: string | null;
  originalCurrencyAmount: number | null;
}

export interface DailySpend {
  day: number;
  cumulativeSpent: number;
  idealSpend: number;
}

export interface MonthlySpendingSummary {
  month: string;
  totalBudget: number;
  totalSpent: number;
  totalIncome: number;
  totalExcluded: number;
  freeToSpend: number;
  priorMonthTotalSpent: number;
  priorMonthTotalIncome: number;
  dailySpending: DailySpend[];
}
