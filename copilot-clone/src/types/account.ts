export type AccountType =
  | 'credit_card'
  | 'checking'
  | 'savings'
  | 'investment'
  | 'loan'
  | 'other';

export type ConnectionStatus = 'healthy' | 'needs_reverify' | 'has_new_accounts';

export type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
export type RecurringStatus = 'active' | 'paused' | 'archived';

export interface BalanceSnapshot {
  /** "YYYY-MM-DD" */
  date: string;
  balance: number;
}

export interface Account {
  id: string;
  institutionName: string;
  accountName: string;
  accountNumberMask: string;
  type: AccountType;
  /** Negative for credit/loan accounts */
  balance: number;
  availableCredit?: number;
  creditLimit?: number;
  /** 0–1 ratio; credit cards only */
  creditUtilization?: number;
  isManual: boolean;
  isHidden: boolean;
  excludeFromNetWorth: boolean;
  connectionStatus: ConnectionStatus;
  lastSyncedAt: string;
  balanceHistory: BalanceSnapshot[];
}

export interface RecurringTransaction {
  id: string;
  name: string;
  emoji: string;
  categoryId: string | null;
  frequency: RecurringFrequency;
  status: RecurringStatus;
  expectedAmount: number;
  amountMin: number;
  amountMax: number;
  expectedDayOfMonth: number | null;
  expectedDayRange: number;
  nameMatchRule: 'exact' | 'contains';
  nameMatchValue: string;
  accountId: string | null;
  nextExpectedDate: string | null;
  lastPaidDate: string | null;
  isShared: boolean;
  sharedSplitPercent: number;
  linkedTransactionIds: string[];
}

export interface NetWorthSnapshot {
  /** "YYYY-MM-DD" */
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}
