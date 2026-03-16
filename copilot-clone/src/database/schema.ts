import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

// ── categories ────────────────────────────────────────────────────────────────
export const categoryGroups = sqliteTable('category_groups', {
  id:              text('id').primaryKey(),
  name:            text('name').notNull(),
  emoji:           text('emoji').notNull(),
  unassignedBudget:real('unassigned_budget').notNull().default(0),
  isExpanded:      integer('is_expanded', { mode: 'boolean' }).notNull().default(true),
  sortOrder:       integer('sort_order').notNull().default(0),
});

export const categories = sqliteTable('categories', {
  id:              text('id').primaryKey(),
  name:            text('name').notNull(),
  emoji:           text('emoji').notNull(),
  color:           text('color').notNull(),
  budgetAmount:    real('budget_amount'),
  isOptional:      integer('is_optional', { mode: 'boolean' }).notNull().default(false),
  groupId:         text('group_id').references(() => categoryGroups.id),
  rolloverEnabled: integer('rollover_enabled', { mode: 'boolean' }).notNull().default(false),
  rolloverBalance: real('rollover_balance').notNull().default(0),
  sortOrder:       integer('sort_order').notNull().default(0),
});

export const budgets = sqliteTable('budgets', {
  id:             text('id').primaryKey(),
  categoryId:     text('category_id').notNull().references(() => categories.id),
  month:          text('month').notNull(), // 'YYYY-MM'
  amount:         real('amount').notNull(),
  rolloverAmount: real('rollover_amount').notNull().default(0),
  effectiveAmount:real('effective_amount').notNull(),
});

// ── accounts ──────────────────────────────────────────────────────────────────
export const accounts = sqliteTable('accounts', {
  id:                  text('id').primaryKey(),
  institutionName:     text('institution_name').notNull(),
  accountName:         text('account_name').notNull(),
  accountNumberMask:   text('account_number_mask').notNull(),
  type:                text('type').notNull(),
  balance:             real('balance').notNull(),
  availableCredit:     real('available_credit'),
  creditLimit:         real('credit_limit'),
  creditUtilization:   real('credit_utilization'),
  isManual:            integer('is_manual', { mode: 'boolean' }).notNull().default(false),
  isHidden:            integer('is_hidden', { mode: 'boolean' }).notNull().default(false),
  excludeFromNetWorth: integer('exclude_from_net_worth', { mode: 'boolean' }).notNull().default(false),
  connectionStatus:    text('connection_status').notNull().default('healthy'),
  lastSyncedAt:        text('last_synced_at').notNull(),
});

// ── transactions ──────────────────────────────────────────────────────────────
export const transactions = sqliteTable('transactions', {
  id:                    text('id').primaryKey(),
  accountId:             text('account_id').notNull().references(() => accounts.id),
  date:                  text('date').notNull(),
  originalDate:          text('original_date').notNull(),
  merchantName:          text('merchant_name').notNull(),
  originalMerchantName:  text('original_merchant_name').notNull(),
  amount:                real('amount').notNull(),
  originalAmount:        real('original_amount').notNull(),
  tipAmount:             real('tip_amount').notNull().default(0),
  type:                  text('type').notNull().default('regular'),
  categoryId:            text('category_id').references(() => categories.id),
  reviewed:              integer('reviewed', { mode: 'boolean' }).notNull().default(false),
  isRecurring:           integer('is_recurring', { mode: 'boolean' }).notNull().default(false),
  recurringId:           text('recurring_id'),
  // tags stored as JSON array string
  tagsJson:              text('tags_json').notNull().default('[]'),
  notes:                 text('notes').notNull().default(''),
  isExcluded:            integer('is_excluded', { mode: 'boolean' }).notNull().default(false),
  isSplit:               integer('is_split', { mode: 'boolean' }).notNull().default(false),
  splitParentId:         text('split_parent_id'),
  splitChildrenJson:     text('split_children_json').notNull().default('[]'),
  isManual:              integer('is_manual', { mode: 'boolean' }).notNull().default(false),
  currencyCode:          text('currency_code').notNull().default('USD'),
  originalCurrencyCode:  text('original_currency_code'),
  originalCurrencyAmount:real('original_currency_amount'),
});

// ── recurring_transactions ────────────────────────────────────────────────────
export const recurringTransactions = sqliteTable('recurring_transactions', {
  id:                     text('id').primaryKey(),
  name:                   text('name').notNull(),
  emoji:                  text('emoji').notNull(),
  categoryId:             text('category_id').references(() => categories.id),
  frequency:              text('frequency').notNull(),
  status:                 text('status').notNull().default('active'),
  expectedAmount:         real('expected_amount').notNull(),
  amountMin:              real('amount_min').notNull(),
  amountMax:              real('amount_max').notNull(),
  expectedDayOfMonth:     integer('expected_day_of_month'),
  expectedDayRange:       integer('expected_day_range').notNull().default(2),
  nameMatchRule:          text('name_match_rule').notNull().default('contains'),
  nameMatchValue:         text('name_match_value').notNull(),
  accountId:              text('account_id'),
  nextExpectedDate:       text('next_expected_date'),
  lastPaidDate:           text('last_paid_date'),
  isShared:               integer('is_shared', { mode: 'boolean' }).notNull().default(false),
  sharedSplitPercent:     real('shared_split_percent').notNull().default(1.0),
  linkedTransactionIds:   text('linked_transaction_ids_json').notNull().default('[]'),
});

// ── tags ──────────────────────────────────────────────────────────────────────
export const tags = sqliteTable('tags', {
  id:    text('id').primaryKey(),
  name:  text('name').notNull().unique(),
  color: text('color'),
});

// ── balance_snapshots ─────────────────────────────────────────────────────────
export const balanceSnapshots = sqliteTable('balance_snapshots', {
  id:        text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => accounts.id),
  date:      text('date').notNull(),       // "YYYY-MM-DD"
  balance:   real('balance').notNull(),
});

// ── net_worth_snapshots ───────────────────────────────────────────────────────
export const netWorthSnapshots = sqliteTable('net_worth_snapshots', {
  id:               text('id').primaryKey(),
  date:             text('date').notNull(), // "YYYY-MM-DD"
  totalAssets:      real('total_assets').notNull(),
  totalLiabilities: real('total_liabilities').notNull(),
  netWorth:         real('net_worth').notNull(),
});
