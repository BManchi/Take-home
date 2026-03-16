import { useMemo } from 'react';
import { useAccountStore } from '../stores/accountStore';
import type { Account, AccountType } from '../types';

const ACCOUNT_TYPE_ORDER: AccountType[] = [
  'credit_card',
  'checking',
  'savings',
  'investment',
  'loan',
  'other',
];

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  credit_card: 'Credit Cards',
  checking:    'Cash & Checking',
  savings:     'Cash & Checking',   // savings grouped with checking
  investment:  'Investments',
  loan:        'Loans',
  other:       'Other',
};

/**
 * Approximate monthly balance delta per account type (positive = growing).
 * Used to synthesize balance history since mock balanceHistory arrays are empty.
 */
const MONTHLY_DELTA: Record<AccountType, number> = {
  credit_card: -25,    // more spending over time → more negative balance
  checking:     50,
  savings:      30,
  investment: 1000,    // 401k / brokerage growth
  loan:        200,    // paying down → less negative
  other:        10,
};

/**
 * Synthesize a balance N months ago using the monthly delta.
 * Going back in time reverses the delta: balance = current - delta * monthsAgo.
 */
function historicalBalance(account: Account, monthsAgo: number): number {
  return account.balance - MONTHLY_DELTA[account.type] * monthsAgo;
}

/**
 * Compute the cutoff date string ('YYYY-MM-DD') for a given time range.
 */
function cutoffDate(range: string): Date {
  const today = new Date();
  switch (range) {
    case '1W':  return new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    case '1M':  return new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    case '3M':  return new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    case '6M':  return new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
    case 'YTD': return new Date(today.getFullYear(), 0, 1);
    case '1Y':  return new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    default:    return new Date(today.getFullYear() - 3, today.getMonth(), today.getDate()); // ALL
  }
}

/**
 * Derived account views: net worth, grouped by type, per-account data.
 */
export function useAccounts() {
  const { accounts, recurrings, netWorthTimeRange, updateAccount, setNetWorthTimeRange } =
    useAccountStore();

  const visibleAccounts = useMemo(() => accounts.filter((a) => !a.isHidden), [accounts]);

  const includedAccounts = useMemo(
    () => visibleAccounts.filter((a) => !a.excludeFromNetWorth),
    [visibleAccounts],
  );

  /** Net worth = sum of all non-excluded account balances */
  const netWorth = useMemo(
    () => includedAccounts.reduce((sum, a) => sum + a.balance, 0),
    [includedAccounts],
  );

  const totalAssets = useMemo(
    () => includedAccounts.filter((a) => a.balance > 0).reduce((sum, a) => sum + a.balance, 0),
    [includedAccounts],
  );

  const totalLiabilities = useMemo(
    () => includedAccounts.filter((a) => a.balance < 0).reduce((sum, a) => sum + a.balance, 0),
    [includedAccounts],
  );

  /**
   * Synthesized net worth history — monthly snapshots filtered to the selected time range.
   * Points are returned oldest→newest for chart rendering.
   */
  const netWorthHistory = useMemo(() => {
    const cutoff = cutoffDate(netWorthTimeRange);
    const today = new Date();
    const points: { date: string; value: number }[] = [];

    // Generate monthly data points going back up to 36 months.
    // Skip i=0 (current month start) since today's actual value is appended below.
    for (let i = 36; i >= 1; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      if (d < cutoff) continue;

      const nw = includedAccounts.reduce(
        (sum, acc) => sum + historicalBalance(acc, i),
        0,
      );
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      points.push({ date: dateStr, value: nw });
    }

    // Always end with today's real net worth value
    const todayStr = today.toISOString().split('T')[0];
    points.push({ date: todayStr, value: netWorth });

    return points;
  }, [includedAccounts, netWorthTimeRange, netWorth]);

  /** Net worth change over the selected time range */
  const netWorthChange = useMemo(() => {
    if (netWorthHistory.length < 2) return { delta: 0, percent: 0 };
    const first = netWorthHistory[0].value;
    const last = netWorthHistory[netWorthHistory.length - 1].value;
    const delta = last - first;
    const percent = first !== 0 ? (delta / Math.abs(first)) * 100 : 0;
    return { delta, percent };
  }, [netWorthHistory]);

  /**
   * Per-account percent change for the selected time range.
   * Uses the same synthetic delta logic.
   */
  const accountChanges = useMemo(() => {
    const cutoff = cutoffDate(netWorthTimeRange);
    const today = new Date();
    const result: Record<string, { delta: number; percent: number }> = {};

    for (const acc of visibleAccounts) {
      // How many months back is the cutoff?
      const monthsAgo = Math.max(
        1,
        Math.round((today.getTime() - cutoff.getTime()) / (1000 * 60 * 60 * 24 * 30)),
      );
      const old = historicalBalance(acc, monthsAgo);
      const delta = acc.balance - old;
      const percent = old !== 0 ? (delta / Math.abs(old)) * 100 : 0;
      result[acc.id] = { delta, percent };
    }

    return result;
  }, [visibleAccounts, netWorthTimeRange]);

  /** Accounts grouped by type, in display order */
  const groupedAccounts = useMemo(() => {
    const groups: Record<string, Account[]> = {};
    for (const acc of visibleAccounts) {
      const label = ACCOUNT_TYPE_LABELS[acc.type];
      if (!groups[label]) groups[label] = [];
      groups[label].push(acc);
    }
    // Build ordered array
    const seen = new Set<string>();
    const ordered: { label: string; accounts: Account[]; total: number }[] = [];
    for (const type of ACCOUNT_TYPE_ORDER) {
      const label = ACCOUNT_TYPE_LABELS[type];
      if (!seen.has(label) && groups[label]) {
        seen.add(label);
        const accs = groups[label];
        ordered.push({
          label,
          accounts: accs,
          total: accs.reduce((s, a) => s + a.balance, 0),
        });
      }
    }
    return ordered;
  }, [visibleAccounts]);

  /** Accounts whose connection needs attention */
  const alertAccounts = useMemo(
    () => accounts.filter((a) => a.connectionStatus !== 'healthy'),
    [accounts],
  );

  return {
    accounts: visibleAccounts,
    recurrings,
    netWorth,
    totalAssets,
    totalLiabilities,
    netWorthHistory,
    netWorthChange,
    accountChanges,
    groupedAccounts,
    alertAccounts,
    netWorthTimeRange,
    updateAccount,
    setNetWorthTimeRange,
  };
}
