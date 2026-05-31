import { count, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { syncOutbox } from '@/db/schema';
import { log } from '@/lib/logger';

import { useSyncStore } from './store';
import { getSupabase } from './supabase';

/**
 * Drain the local sync outbox to Supabase.
 *
 * For v1 this is intentionally simple: each row maps directly to a
 * table+operation against a same-named Supabase table. Conflict resolution is
 * last-write-wins via `updated_at` columns. When Supabase isn't configured
 * the engine is a no-op so the rest of the app keeps working offline.
 */
export async function drainOutbox(): Promise<void> {
  const supabase = getSupabase();
  const store = useSyncStore.getState();
  if (!supabase) {
    store.setStatus('disabled');
    return;
  }
  if (!store.online) {
    store.setStatus('offline');
    return;
  }

  store.setStatus('syncing');
  try {
    const rows = await db.select().from(syncOutbox).limit(50);
    for (const row of rows) {
      try {
        const payload = JSON.parse(row.payload) as Record<string, unknown>;
        if (row.op === 'delete') {
          await supabase.from(row.tableName).delete().eq('id', row.rowId);
        } else {
          await supabase.from(row.tableName).upsert({ ...payload, id: row.rowId });
        }
        await db.delete(syncOutbox).where(eq(syncOutbox.id, row.id));
      } catch (e) {
        log.warn('sync row failed', row.id, e);
        // Leave the row in the outbox; next drain will retry.
      }
    }
    store.setLastSynced(Date.now());
    await refreshPending();
  } catch (e) {
    store.setError(e instanceof Error ? e.message : 'sync failed');
  }
}

export async function refreshPending(): Promise<void> {
  const [row] = await db.select({ n: count() }).from(syncOutbox);
  useSyncStore.getState().setPending(row?.n ?? 0);
}
