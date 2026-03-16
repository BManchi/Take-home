/**
 * db-service.ts
 *
 * Row↔TypeScript-type mappers and bulk SELECT queries.
 * Keeps stores free from schema-level concerns (JSON columns, string→enum casts).
 */
import { db } from './client';
import {
  accounts,
  categories,
  categoryGroups,
  recurringTransactions,
  tags,
  transactions,
} from './schema';
import type {
  Account,
  AccountType,
  Category,
  CategoryGroup,
  ConnectionStatus,
  RecurringFrequency,
  RecurringStatus,
  RecurringTransaction,
  Tag,
  Transaction,
  TransactionType,
} from '../types';

// ── Row → TypeScript type mappers ────────────────────────────────────────────

export function rowToTransaction(
  row: typeof transactions.$inferSelect,
): Transaction {
  return {
    id: row.id,
    accountId: row.accountId,
    date: row.date,
    originalDate: row.originalDate,
    merchantName: row.merchantName,
    originalMerchantName: row.originalMerchantName,
    amount: row.amount,
    originalAmount: row.originalAmount,
    tipAmount: row.tipAmount,
    type: row.type as TransactionType,
    categoryId: row.categoryId ?? null,
    reviewed: row.reviewed,
    isRecurring: row.isRecurring,
    recurringId: row.recurringId ?? null,
    tags: JSON.parse(row.tagsJson) as string[],
    notes: row.notes,
    isExcluded: row.isExcluded,
    isSplit: row.isSplit,
    splitParentId: row.splitParentId ?? null,
    splitChildren: JSON.parse(row.splitChildrenJson) as string[],
    isManual: row.isManual,
    currencyCode: row.currencyCode,
    originalCurrencyCode: row.originalCurrencyCode ?? null,
    originalCurrencyAmount: row.originalCurrencyAmount ?? null,
  };
}

export function rowToCategory(
  row: typeof categories.$inferSelect,
): Category {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    color: row.color,
    budgetAmount: row.budgetAmount ?? null,
    isOptional: row.isOptional,
    groupId: row.groupId ?? null,
    rolloverEnabled: row.rolloverEnabled,
    rolloverBalance: row.rolloverBalance,
    sortOrder: row.sortOrder,
  };
}

export function rowToGroup(
  row: typeof categoryGroups.$inferSelect,
): CategoryGroup {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    unassignedBudget: row.unassignedBudget,
    isExpanded: row.isExpanded,
    sortOrder: row.sortOrder,
  };
}

export function rowToAccount(
  row: typeof accounts.$inferSelect,
): Account {
  return {
    id: row.id,
    institutionName: row.institutionName,
    accountName: row.accountName,
    accountNumberMask: row.accountNumberMask,
    type: row.type as AccountType,
    balance: row.balance,
    availableCredit: row.availableCredit ?? undefined,
    creditLimit: row.creditLimit ?? undefined,
    creditUtilization: row.creditUtilization ?? undefined,
    isManual: row.isManual,
    isHidden: row.isHidden,
    excludeFromNetWorth: row.excludeFromNetWorth,
    connectionStatus: row.connectionStatus as ConnectionStatus,
    lastSyncedAt: row.lastSyncedAt,
    balanceHistory: [],   // balance_snapshots table out of scope
  };
}

export function rowToRecurring(
  row: typeof recurringTransactions.$inferSelect,
): RecurringTransaction {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    categoryId: row.categoryId ?? null,
    frequency: row.frequency as RecurringFrequency,
    status: row.status as RecurringStatus,
    expectedAmount: row.expectedAmount,
    amountMin: row.amountMin,
    amountMax: row.amountMax,
    expectedDayOfMonth: row.expectedDayOfMonth ?? null,
    expectedDayRange: row.expectedDayRange,
    nameMatchRule: row.nameMatchRule as 'exact' | 'contains',
    nameMatchValue: row.nameMatchValue,
    accountId: row.accountId ?? null,
    nextExpectedDate: row.nextExpectedDate ?? null,
    lastPaidDate: row.lastPaidDate ?? null,
    isShared: row.isShared,
    sharedSplitPercent: row.sharedSplitPercent,
    linkedTransactionIds: JSON.parse(row.linkedTransactionIds) as string[],
  };
}

export function rowToTag(row: typeof tags.$inferSelect): Tag {
  return {
    id: row.id,
    name: row.name,
    color: row.color ?? null,
  };
}

// ── Bulk SELECT queries ───────────────────────────────────────────────────────

export async function loadAllTransactions(): Promise<Transaction[]> {
  const rows = await db.select().from(transactions);
  return rows.map(rowToTransaction);
}

export async function loadAllCategories(): Promise<Category[]> {
  const rows = await db.select().from(categories);
  return rows.map(rowToCategory);
}

export async function loadAllGroups(): Promise<CategoryGroup[]> {
  const rows = await db.select().from(categoryGroups);
  return rows.map(rowToGroup);
}

export async function loadAllAccounts(): Promise<Account[]> {
  const rows = await db.select().from(accounts);
  return rows.map(rowToAccount);
}

export async function loadAllRecurrings(): Promise<RecurringTransaction[]> {
  const rows = await db.select().from(recurringTransactions);
  return rows.map(rowToRecurring);
}

export async function loadAllTags(): Promise<Tag[]> {
  const rows = await db.select().from(tags);
  return rows.map(rowToTag);
}
