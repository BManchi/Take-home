import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// Open (or create) the SQLite database file.
// enableChangeListener enables reactive queries via useLiveQuery.
const expoDb = openDatabaseSync('copilot.db', { enableChangeListener: true });

export const db = drizzle(expoDb, { schema });

export type Database = typeof db;
