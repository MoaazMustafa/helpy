import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Outbox of mutations that have not yet been pushed to the cloud.
 * Drained by the sync engine when network is available.
 *
 * Not itself syncable (no `synced_at`/`dirty`).
 */
export const syncOutbox = sqliteTable('sync_outbox', {
  id: text('id').primaryKey().notNull(),
  tableName: text('table_name').notNull(),
  rowId: text('row_id').notNull(),
  op: text('op', { enum: ['insert', 'update', 'delete'] }).notNull(),
  payload: text('payload').notNull(),
  createdAt: integer('created_at').notNull(),
  attempts: integer('attempts').notNull().default(0),
  lastError: text('last_error'),
});

export type SyncOutboxRow = typeof syncOutbox.$inferSelect;
export type NewSyncOutboxRow = typeof syncOutbox.$inferInsert;
