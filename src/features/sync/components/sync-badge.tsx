import { Chip } from 'heroui-native';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useSyncStore } from '@/features/sync';

const LABEL: Record<ReturnType<typeof useSyncStore.getState>['status'], string> = {
  idle: 'Synced',
  syncing: 'Syncing…',
  offline: 'Offline',
  error: 'Sync error',
  disabled: 'Local-only',
};

const COLOR: Record<
  ReturnType<typeof useSyncStore.getState>['status'],
  'success' | 'warning' | 'default' | 'danger' | 'accent'
> = {
  idle: 'success',
  syncing: 'warning',
  offline: 'default',
  error: 'danger',
  disabled: 'default',
};

const DOT: Record<string, string> = {
  idle: '#22C55E',
  syncing: '#F59E0B',
  offline: '#94A3B8',
  error: '#EF4444',
  disabled: '#94A3B8',
};

export function SyncBadge() {
  const status = useSyncStore((s) => s.status);
  const pending = useSyncStore((s) => s.pendingCount);
  const label = `${LABEL[status]}${pending > 0 ? ` · ${pending}` : ''}`;

  return (
    <Chip variant="soft" color={COLOR[status]} size="sm" style={styles.chip}>
      <View style={[styles.dot, { backgroundColor: DOT[status] }]} />
      <Chip.Label>{label}</Chip.Label>
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
