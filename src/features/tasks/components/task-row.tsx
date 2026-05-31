import { Checkbox, Surface } from 'heroui-native';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatRelative } from '@/lib/date';

import { useDeleteTask, useToggleTaskComplete } from '../hooks';
import type { TaskWithReminder } from '../repo';

export function TaskRow({ task }: { task: TaskWithReminder }) {
  const toggle = useToggleTaskComplete();
  const del = useDeleteTask();
  const completed = task.status === 'completed';

  function confirmDelete() {
    Alert.alert('Delete task?', task.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => del.mutate(task.id) },
    ]);
  }

  return (
    <Pressable onLongPress={confirmDelete}>
      <Surface variant="secondary" style={styles.row}>
        <Checkbox isSelected={completed} onSelectedChange={() => toggle.mutate(task.id)} />
        <View style={styles.body}>
          <ThemedText
            type="default"
            style={completed ? [styles.title, styles.struck] : styles.title}
          >
            {task.title}
          </ThemedText>
          {task.notes ? (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
              {task.notes}
            </ThemedText>
          ) : null}
          {task.remindAt ? (
            <ThemedText type="small" themeColor="textSecondary">
              ⏰ {formatRelative(task.remindAt)}
            </ThemedText>
          ) : null}
        </View>
      </Surface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 14,
  },
  body: { flex: 1, gap: Spacing.half },
  title: { fontSize: 16 },
  struck: { textDecorationLine: 'line-through', opacity: 0.5 },
});
