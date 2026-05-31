/**
 * Web stub — expo-sqlite's `openDatabaseSync` throws "Sync operation timeout"
 * in the browser. The app's primary persistence target is native, so on web we
 * export a `null` db and feature code must guard against it.
 */

export const db = null as any;

export type Database = any;

export const rawSqlite = null;
