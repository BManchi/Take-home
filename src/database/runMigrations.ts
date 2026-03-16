/**
 * runMigrations.ts
 *
 * Creates all tables using raw SQL if they don't already exist.
 * Run once on app boot before seeding or querying.
 * Avoids the need for drizzle-kit to run on the host machine.
 */
import { expoDb } from './client';

export function runMigrations(): void {
  expoDb.execSync(
    `CREATE TABLE IF NOT EXISTS category_groups (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      unassigned_budget REAL NOT NULL DEFAULT 0,
      is_expanded INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    )`,
  );

  expoDb.execSync(
    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      color TEXT NOT NULL,
      budget_amount REAL,
      is_optional INTEGER NOT NULL DEFAULT 0,
      group_id TEXT REFERENCES category_groups(id),
      rollover_enabled INTEGER NOT NULL DEFAULT 0,
      rollover_balance REAL NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    )`,
  );

  expoDb.execSync(
    `CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY NOT NULL,
      category_id TEXT NOT NULL REFERENCES categories(id),
      month TEXT NOT NULL,
      amount REAL NOT NULL,
      rollover_amount REAL NOT NULL DEFAULT 0,
      effective_amount REAL NOT NULL
    )`,
  );

  expoDb.execSync(
    `CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY NOT NULL,
      institution_name TEXT NOT NULL,
      account_name TEXT NOT NULL,
      account_number_mask TEXT NOT NULL,
      type TEXT NOT NULL,
      balance REAL NOT NULL,
      available_credit REAL,
      credit_limit REAL,
      credit_utilization REAL,
      is_manual INTEGER NOT NULL DEFAULT 0,
      is_hidden INTEGER NOT NULL DEFAULT 0,
      exclude_from_net_worth INTEGER NOT NULL DEFAULT 0,
      connection_status TEXT NOT NULL DEFAULT 'healthy',
      last_synced_at TEXT NOT NULL
    )`,
  );

  expoDb.execSync(
    `CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      account_id TEXT NOT NULL REFERENCES accounts(id),
      date TEXT NOT NULL,
      original_date TEXT NOT NULL,
      merchant_name TEXT NOT NULL,
      original_merchant_name TEXT NOT NULL,
      amount REAL NOT NULL,
      original_amount REAL NOT NULL,
      tip_amount REAL NOT NULL DEFAULT 0,
      type TEXT NOT NULL DEFAULT 'regular',
      category_id TEXT REFERENCES categories(id),
      reviewed INTEGER NOT NULL DEFAULT 0,
      is_recurring INTEGER NOT NULL DEFAULT 0,
      recurring_id TEXT,
      tags_json TEXT NOT NULL DEFAULT '[]',
      notes TEXT NOT NULL DEFAULT '',
      is_excluded INTEGER NOT NULL DEFAULT 0,
      is_split INTEGER NOT NULL DEFAULT 0,
      split_parent_id TEXT,
      split_children_json TEXT NOT NULL DEFAULT '[]',
      is_manual INTEGER NOT NULL DEFAULT 0,
      currency_code TEXT NOT NULL DEFAULT 'USD',
      original_currency_code TEXT,
      original_currency_amount REAL
    )`,
  );

  expoDb.execSync(
    `CREATE TABLE IF NOT EXISTS recurring_transactions (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      category_id TEXT REFERENCES categories(id),
      frequency TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      expected_amount REAL NOT NULL,
      amount_min REAL NOT NULL,
      amount_max REAL NOT NULL,
      expected_day_of_month INTEGER,
      expected_day_range INTEGER NOT NULL DEFAULT 2,
      name_match_rule TEXT NOT NULL DEFAULT 'contains',
      name_match_value TEXT NOT NULL,
      account_id TEXT,
      next_expected_date TEXT,
      last_paid_date TEXT,
      is_shared INTEGER NOT NULL DEFAULT 0,
      shared_split_percent REAL NOT NULL DEFAULT 1.0,
      linked_transaction_ids_json TEXT NOT NULL DEFAULT '[]'
    )`,
  );

  expoDb.execSync(
    `CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      color TEXT
    )`,
  );

  expoDb.execSync(
    `CREATE TABLE IF NOT EXISTS balance_snapshots (
      id TEXT PRIMARY KEY NOT NULL,
      account_id TEXT NOT NULL REFERENCES accounts(id),
      date TEXT NOT NULL,
      balance REAL NOT NULL
    )`,
  );

  expoDb.execSync(
    `CREATE TABLE IF NOT EXISTS net_worth_snapshots (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      total_assets REAL NOT NULL,
      total_liabilities REAL NOT NULL,
      net_worth REAL NOT NULL
    )`,
  );

  console.log('[DB] Migrations complete');
}
