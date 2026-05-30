import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';

import * as schema from './schema';

/**
 * Single SQLite connection for the whole app.
 *
 * `openDatabaseSync` is safe at module scope because Expo SQLite uses a
 * background thread internally. The handle is reused for all queries.
 */
const sqlite = SQLite.openDatabaseSync('helpy.db', {
  enableChangeListener: true,
});

export const db = drizzle(sqlite, { schema });

export type Database = typeof db;

/**
 * Re-export the underlying connection for the migrations hook.
 */
export const rawSqlite = sqlite;
