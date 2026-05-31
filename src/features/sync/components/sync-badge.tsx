import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useSyncStore } from '@/features/sync';
import { useResolvedScheme } from '@/hooks/use-theme';

const LABEL: Record<ReturnType<typeof useSyncStore.getState>['status'], string> = {
  idle: 'Synced',
  syncing: 'Syncing…',
  offline: 'Offline',
  error: 'Sync error',
  disabled: 'Local-only',
};

const DOT: Record<string, string> = {
  idle: '#22C55E',
  syncing: '#F59E0B',
  offline: '#94A3B8',
  error: '#EF4444',
  disabled: '#94A3B8',
};

export function SyncBadge() {
  const scheme = useResolvedScheme();
  const colors = Colors[scheme];
  const status = useSyncStore((s) => s.status);
  const pending = useSyncStore((s) => s.pendingCount);

  return (
    <View style={[styles.pill, { backgroundColor: colors.backgroundElement }]}>
      <View style={[styles.dot, { backgroundColor: DOT[status] }]} />
      <ThemedText type="small" themeColor="textSecondary">
        {LABEL[status]}
        {pending > 0 ? ` · ${pending}` : ''}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
