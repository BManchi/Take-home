import { db } from './client';
import {
  accounts,
  categories,
  categoryGroups,
  recurringTransactions,
  tags,
  transactions,
} from './schema';
import {
  MOCK_ACCOUNTS,
  MOCK_CATEGORIES,
  MOCK_CATEGORY_GROUPS,
  MOCK_RECURRINGS,
  MOCK_TAGS,
  MOCK_TRANSACTIONS,
} from '../__mocks__';

/**
 * Seeds the database with mock data from the PRD.
 * Safe to call multiple times — uses INSERT OR IGNORE to avoid duplicates.
 */
export async function seedDatabase(): Promise<void> {
  try {
    // Category groups
    for (const g of MOCK_CATEGORY_GROUPS) {
      await db
        .insert(categoryGroups)
        .values(g)
        .onConflictDoNothing();
    }

    // Categories
    for (const c of MOCK_CATEGORIES) {
      await db
        .insert(categories)
        .values(c)
        .onConflictDoNothing();
    }

    // Accounts
    for (const a of MOCK_ACCOUNTS) {
      await db
        .insert(accounts)
        .values({
          id: a.id,
          institutionName: a.institutionName,
          accountName: a.accountName,
          accountNumberMask: a.accountNumberMask,
          type: a.type,
          balance: a.balance,
          availableCredit: a.availableCredit ?? null,
          creditLimit: a.creditLimit ?? null,
          creditUtilization: a.creditUtilization ?? null,
          isManual: a.isManual,
          isHidden: a.isHidden,
          excludeFromNetWorth: a.excludeFromNetWorth,
          connectionStatus: a.connectionStatus,
          lastSyncedAt: a.lastSyncedAt,
        })
        .onConflictDoNothing();
    }

    // Recurring transactions
    for (const r of MOCK_RECURRINGS) {
      await db
        .insert(recurringTransactions)
        .values({
          id: r.id,
          name: r.name,
          emoji: r.emoji,
          categoryId: r.categoryId,
          frequency: r.frequency,
          status: r.status,
          expectedAmount: r.expectedAmount,
          amountMin: r.amountMin,
          amountMax: r.amountMax,
          expectedDayOfMonth: r.expectedDayOfMonth ?? null,
          expectedDayRange: r.expectedDayRange,
          nameMatchRule: r.nameMatchRule,
          nameMatchValue: r.nameMatchValue,
          accountId: r.accountId ?? null,
          nextExpectedDate: r.nextExpectedDate ?? null,
          lastPaidDate: r.lastPaidDate ?? null,
          isShared: r.isShared,
          sharedSplitPercent: r.sharedSplitPercent,
          linkedTransactionIds: JSON.stringify(r.linkedTransactionIds),
        })
        .onConflictDoNothing();
    }

    // Transactions
    for (const txn of MOCK_TRANSACTIONS) {
      await db
        .insert(transactions)
        .values({
          id: txn.id,
          accountId: txn.accountId,
          date: txn.date,
          originalDate: txn.originalDate,
          merchantName: txn.merchantName,
          originalMerchantName: txn.originalMerchantName,
          amount: txn.amount,
          originalAmount: txn.originalAmount,
          tipAmount: txn.tipAmount,
          type: txn.type,
          categoryId: txn.categoryId ?? null,
          reviewed: txn.reviewed,
          isRecurring: txn.isRecurring,
          recurringId: txn.recurringId ?? null,
          tagsJson: JSON.stringify(txn.tags),
          notes: txn.notes,
          isExcluded: txn.isExcluded,
          isSplit: txn.isSplit,
          splitParentId: txn.splitParentId ?? null,
          splitChildrenJson: JSON.stringify(txn.splitChildren),
          isManual: txn.isManual,
          currencyCode: txn.currencyCode,
          originalCurrencyCode: txn.originalCurrencyCode ?? null,
          originalCurrencyAmount: txn.originalCurrencyAmount ?? null,
        })
        .onConflictDoNothing();
    }

    // Tags
    for (const tag of MOCK_TAGS) {
      await db
        .insert(tags)
        .values(tag)
        .onConflictDoNothing();
    }

    console.log('[DB] Seed complete');
  } catch (err) {
    console.error('[DB] Seed failed:', err);
  }
}
