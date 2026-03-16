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
 * Derived account views: net worth, grouped by type, per-account data.
 */
export function useAccounts() {
  const { accounts, recurrings, netWorthTimeRange, updateAccount, setNetWorthTimeRange } =
    useAccountStore();

  const visibleAccounts = useMemo(() => accounts.filter((a) => !a.isHidden), [accounts]);

  /** Net worth = sum of all non-excluded account balances */
  const netWorth = useMemo(
    () =>
      visibleAccounts
        .filter((a) => !a.excludeFromNetWorth)
        .reduce((sum, a) => sum + a.balance, 0),
    [visibleAccounts],
  );

  const totalAssets = useMemo(
    () =>
      visibleAccounts
        .filter((a) => !a.excludeFromNetWorth && a.balance > 0)
        .reduce((sum, a) => sum + a.balance, 0),
    [visibleAccounts],
  );

  const totalLiabilities = useMemo(
    () =>
      visibleAccounts
        .filter((a) => !a.excludeFromNetWorth && a.balance < 0)
        .reduce((sum, a) => sum + a.balance, 0),
    [visibleAccounts],
  );

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
    groupedAccounts,
    alertAccounts,
    netWorthTimeRange,
    updateAccount,
    setNetWorthTimeRange,
  };
}
