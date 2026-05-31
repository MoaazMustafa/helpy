import { and, asc, eq, gte, isNull, lte, or } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db/client';
import { reminders, type Task, tasks } from '@/db/schema';
import { cancelReminder, scheduleReminder } from '@/features/notifications';
import { ulid } from '@/lib/ulid';

/**
 * Repository layer for tasks + their primary reminder.
 *
 * Components must never touch `db` directly — they call these functions so we
 * can (a) keep SQL in one place, (b) add the sync outbox hook later, and
 * (c) test repos in isolation.
 */

export const TaskInputSchema = z.object({
  title: z.string().trim().min(1, 'Title required').max(200),
  notes: z.string().trim().max(2000).nullable().optional(),
  startAt: z.number().int().nullable().optional(),
  endAt: z.number().int().nullable().optional(),
  priority: z.number().int().min(0).max(3).default(0),
  remindAt: z.number().int().nullable().optional(),
});
export type TaskInput = z.infer<typeof TaskInputSchema>;

export type TaskWithReminder = Task & { remindAt: number | null };

async function loadReminderMap(taskIds: string[]): Promise<Map<string, number>> {
  if (taskIds.length === 0) return new Map();
  const rows = await db
    .select({ taskId: reminders.taskId, fireAt: reminders.fireAt })
    .from(reminders)
    .where(isNull(reminders.deletedAt));
  const map = new Map<string, number>();
  for (const r of rows) {
    if (r.taskId) map.set(r.taskId, r.fireAt);
  }
  return map;
}

async function withReminders(rows: Task[]): Promise<TaskWithReminder[]> {
  const map = await loadReminderMap(rows.map((r) => r.id));
  return rows.map((r) => ({ ...r, remindAt: map.get(r.id) ?? null }));
}

export async function listTasks(): Promise<TaskWithReminder[]> {
  const rows = await db
    .select()
    .from(tasks)
    .where(isNull(tasks.deletedAt))
    .orderBy(asc(tasks.startAt), asc(tasks.createdAt));
  return withReminders(rows);
}

export async function listTasksInRange(fromMs: number, toMs: number): Promise<TaskWithReminder[]> {
  const rows = await db
    .select()
    .from(tasks)
    .where(
      and(
        isNull(tasks.deletedAt),
        or(
          and(gte(tasks.startAt, fromMs), lte(tasks.startAt, toMs)),
          and(isNull(tasks.startAt), gte(tasks.createdAt, fromMs)),
        ),
      ),
    )
    .orderBy(asc(tasks.startAt));
  return withReminders(rows);
}

export async function createTask(input: TaskInput): Promise<TaskWithReminder> {
  const parsed = TaskInputSchema.parse(input);
  const id = ulid();
  const now = Date.now();

  await db.insert(tasks).values({
    id,
    title: parsed.title,
    notes: parsed.notes ?? null,
    startAt: parsed.startAt ?? null,
    endAt: parsed.endAt ?? null,
    priority: parsed.priority,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    dirty: 1,
  });

  let remindAt: number | null = null;
  if (parsed.remindAt && parsed.remindAt > Date.now()) {
    const notifId = await scheduleReminder({
      title: parsed.title,
      body: parsed.notes ?? null,
      fireAt: parsed.remindAt,
      data: { taskId: id },
    });
    await db.insert(reminders).values({
      id: ulid(),
      taskId: id,
      fireAt: parsed.remindAt,
      notificationId: notifId,
      createdAt: now,
      updatedAt: now,
      dirty: 1,
    });
    remindAt = parsed.remindAt;
  }

  const [row] = await db.select().from(tasks).where(eq(tasks.id, id));
  return { ...row, remindAt };
}

export async function toggleTaskComplete(id: string): Promise<void> {
  const [row] = await db.select().from(tasks).where(eq(tasks.id, id));
  if (!row) return;
  const completed = row.status === 'completed';
  const now = Date.now();
  await db
    .update(tasks)
    .set({
      status: completed ? 'pending' : 'completed',
      completedAt: completed ? null : now,
      updatedAt: now,
      dirty: 1,
    })
    .where(eq(tasks.id, id));

  if (!completed) {
    // Cancel pending reminders once task is done.
    const rows = await db.select().from(reminders).where(eq(reminders.taskId, id));
    for (const r of rows) {
      await cancelReminder(r.notificationId);
      await db
        .update(reminders)
        .set({ deletedAt: now, updatedAt: now, dirty: 1 })
        .where(eq(reminders.id, r.id));
    }
  }
}

export async function deleteTask(id: string): Promise<void> {
  const now = Date.now();
  const rows = await db.select().from(reminders).where(eq(reminders.taskId, id));
  for (const r of rows) {
    await cancelReminder(r.notificationId);
  }
  await db
    .update(reminders)
    .set({ deletedAt: now, updatedAt: now, dirty: 1 })
    .where(eq(reminders.taskId, id));
  await db.update(tasks).set({ deletedAt: now, updatedAt: now, dirty: 1 }).where(eq(tasks.id, id));
}
