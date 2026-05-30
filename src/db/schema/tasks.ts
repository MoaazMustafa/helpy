import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { syncColumns } from './_sync';

export const tasks = sqliteTable('tasks', {
  ...syncColumns,
  title: text('title').notNull(),
  notes: text('notes'),
  startAt: integer('start_at'),
  endAt: integer('end_at'),
  status: text('status', { enum: ['pending', 'in_progress', 'completed', 'skipped'] })
    .notNull()
    .default('pending'),
  priority: integer('priority').notNull().default(0),
  categoryId: text('category_id'),
  recurrenceRule: text('recurrence_rule'),
  completedAt: integer('completed_at'),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
