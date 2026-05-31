import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { endOfToday, startOfToday } from '@/lib/date';

import type { TaskWithReminder } from '../repo';
import { TaskRow } from './task-row';

type Group = { label: string; items: TaskWithReminder[] };

function groupTasks(tasks: TaskWithReminder[]): Group[] {
  const now = Date.now();
  const sod = startOfToday();
  const eod = endOfToday();

  const overdue: TaskWithReminder[] = [];
  const today: TaskWithReminder[] = [];
  const upcoming: TaskWithReminder[] = [];
  const someday: TaskWithReminder[] = [];
  const done: TaskWithReminder[] = [];

  for (const t of tasks) {
    if (t.status === 'completed') {
      done.push(t);
      continue;
    }
    const at = t.startAt ?? t.remindAt;
    if (!at) {
      someday.push(t);
    } else if (at < sod && at < now) {
      overdue.push(t);
    } else if (at >= sod && at <= eod) {
      today.push(t);
    } else {
      upcoming.push(t);
    }
  }

  return [
    { label: 'Overdue', items: overdue },
    { label: 'Today', items: today },
    { label: 'Upcoming', items: upcoming },
    { label: 'Someday', items: someday },
    { label: 'Completed', items: done },
  ].filter((g) => g.items.length > 0);
}

export function TaskList({ tasks }: { tasks: TaskWithReminder[] }) {
  const groups = useMemo(() => groupTasks(tasks), [tasks]);

  return (
    <View style={styles.container}>
      {groups.map((g) => (
        <View key={g.label} style={styles.group}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {g.label.toUpperCase()}
          </ThemedText>
          <View style={styles.items}>
            {g.items.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.four },
  group: { gap: Spacing.two },
  items: { gap: Spacing.two },
});
