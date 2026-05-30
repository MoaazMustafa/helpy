import { sql } from 'drizzle-orm';
import { integer, text } from 'drizzle-orm/sqlite-core';

/**
 * Columns every syncable row carries.
 *
 * - `id`           — client-generated ULID, sortable by creation time.
 * - `created_at`   — ms epoch, never changes after insert.
 * - `updated_at`   — ms epoch, bumped on every write.
 * - `deleted_at`   — ms epoch when soft-deleted (null otherwise).
 * - `synced_at`    — ms epoch of last successful sync, null when local-only.
 * - `dirty`        — 1 if the row has unsynced changes, 0 otherwise.
 */
export const syncColumns = {
  id: text('id').primaryKey().notNull(),
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at')
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  deletedAt: integer('deleted_at'),
  syncedAt: integer('synced_at'),
  dirty: integer('dirty').notNull().default(1),
};
