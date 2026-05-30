import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { syncColumns } from './_sync';

export const reminders = sqliteTable('reminders', {
  ...syncColumns,
  taskId: text('task_id'),
  fireAt: integer('fire_at').notNull(),
  repeatRule: text('repeat_rule'),
  sound: text('sound'),
  notificationId: text('notification_id'),
});

export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = typeof reminders.$inferInsert;
