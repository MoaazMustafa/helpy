import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { syncColumns } from './_sync';

/**
 * Cloud-mirrored user settings. Single-row-per-user pattern.
 * `value` is a JSON-encoded blob; shape validated with Zod at read/write time.
 */
export const userSettings = sqliteTable('user_settings', {
  ...syncColumns,
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
});

export type UserSetting = typeof userSettings.$inferSelect;
export type NewUserSetting = typeof userSettings.$inferInsert;
