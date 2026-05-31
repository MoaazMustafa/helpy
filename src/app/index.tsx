import { Card, Surface } from 'heroui-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { SyncBadge } from '@/features/sync';
import { QuickAddTask, TaskList, useTasks } from '@/features/tasks';
import { useResolvedScheme } from '@/hooks/use-theme';
import { endOfToday, startOfToday } from '@/lib/date';

export default function HomeScreen() {
  const scheme = useResolvedScheme();
  const colors = Colors[scheme];
  const user = useAuth((s) => s.user);
  const firstName = user?.name?.split(' ')[0];
  const { data: tasks = [], isLoading } = useTasks();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const stats = useMemo(() => {
    const sod = startOfToday();
    const eod = endOfToday();
    const inToday = tasks.filter((t) => {
      const at = t.startAt ?? t.remindAt;
      return at && at >= sod && at <= eod;
    });
    const done = inToday.filter((t) => t.status === 'completed').length;
    const total = inToday.length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return { done, total, pct };
  }, [tasks]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="small" themeColor="textSecondary">
              {greeting()}
            </ThemedText>
            <ThemedText type="title" style={styles.greeting}>
              {firstName ?? 'Hello'}
            </ThemedText>
            <SyncBadge />
          </View>

          <Card style={styles.statsCard}>
            <Surface variant="secondary" style={styles.statsSurface}>
              <View style={styles.statsRow}>
                <View style={styles.flex1}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Today
                  </ThemedText>
                  <ThemedText type="subtitle">
                    {stats.done}
                    <ThemedText type="small" themeColor="textSecondary">
                      {' / '}
                      {stats.total}
                    </ThemedText>
                  </ThemedText>
                </View>
                <View style={styles.ringCol}>
                  <ProgressRing
                    pct={stats.pct}
                    color={colors.text}
                    bgColor={colors.backgroundSelected}
                  />
                </View>
              </View>
            </Surface>
          </Card>

          {isLoading ? (
            <ThemedText type="small" themeColor="textSecondary">
              Loading…
            </ThemedText>
          ) : tasks.length === 0 ? (
            <EmptyState onAdd={() => setQuickAddOpen(true)} />
          ) : (
            <TaskList tasks={tasks} />
          )}
        </ScrollView>

        <Pressable
          accessibilityLabel="Add task"
          onPress={() => setQuickAddOpen(true)}
          style={[styles.fab, { backgroundColor: colors.text }]}
        >
          <ThemedText style={[styles.fabPlus, { color: colors.background }]}>+</ThemedText>
        </Pressable>
      </SafeAreaView>

      <QuickAddTask visible={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </ThemedView>
  );
}

function ProgressRing({ pct, color, bgColor }: { pct: number; color: string; bgColor: string }) {
  // Simple square ring built from a rotated arc. Pure RN, no svg dependency on
  // hot path — keeps the home screen snappy.
  return (
    <View style={[ringStyles.outer, { borderColor: bgColor }]}>
      <View
        style={[
          ringStyles.fill,
          {
            borderColor: color,
            transform: [{ rotate: `${Math.min(360, (pct / 100) * 360)}deg` }],
          },
        ]}
      />
      <ThemedText type="smallBold">{pct}%</ThemedText>
    </View>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={emptyStyles.container}>
      <ThemedText type="subtitle" style={emptyStyles.title}>
        Nothing scheduled
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={emptyStyles.body}>
        Add your first task and we&apos;ll remind you when it&apos;s time.
      </ThemedText>
      <Pressable onPress={onAdd} style={emptyStyles.cta}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Tap + to add a task
        </ThemedText>
      </Pressable>
    </View>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.six,
    gap: Spacing.four,
  },
  header: { gap: Spacing.one },
  greeting: { fontSize: 36, lineHeight: 40 },
  statsCard: { borderRadius: 18, overflow: 'hidden' },
  statsSurface: { padding: Spacing.four, borderRadius: 18 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  flex1: { flex: 1, gap: Spacing.one },
  ringCol: { width: 72, height: 72 },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: BottomTabInset + Spacing.three,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabPlus: { fontSize: 28, lineHeight: 30 },
});

const ringStyles = StyleSheet.create({
  outer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 6,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

const emptyStyles = StyleSheet.create({
  container: { gap: Spacing.two, alignItems: 'center', paddingVertical: Spacing.five },
  title: { textAlign: 'center' },
  body: { textAlign: 'center', maxWidth: 280 },
  cta: { marginTop: Spacing.three },
});
