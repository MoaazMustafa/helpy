import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { syncColumns } from './_sync';

/**
 * Daily roll-up of task completion.
 *
 * Note: this table is derived from `tasks` and recomputed by the app — never
 * authoritative. Stored so the home screen can render instantly without a
 * heavy aggregation query at mount.
 */
export const progressEntries = sqliteTable('progress_entries', {
  ...syncColumns,
  // ISO date string (YYYY-MM-DD) in the device's local zone.
  date: text('date').notNull(),
  scheduled: integer('scheduled').notNull().default(0),
  completed: integer('completed').notNull().default(0),
  onTime: integer('on_time').notNull().default(0),
  score: integer('score').notNull().default(0),
});

export type ProgressEntry = typeof progressEntries.$inferSelect;
export type NewProgressEntry = typeof progressEntries.$inferInsert;
