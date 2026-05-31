import { Button, Input } from 'heroui-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useCreateTask } from '@/features/tasks/hooks';
import { useResolvedScheme } from '@/hooks/use-theme';
import { log } from '@/lib/logger';

type Preset = { id: '15m' | '1h' | 'tomorrow' | null; label: string; minutes?: number };

const PRESETS: Preset[] = [
  { id: null, label: 'No reminder' },
  { id: '15m', label: 'In 15 min', minutes: 15 },
  { id: '1h', label: 'In 1 hour', minutes: 60 },
  { id: 'tomorrow', label: 'Tomorrow 9am' },
];

function remindAtFor(preset: Preset): number | null {
  if (!preset.id) return null;
  if (preset.minutes) return Date.now() + preset.minutes * 60_000;
  // tomorrow 9am
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d.getTime();
}

export function QuickAddTask({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const scheme = useResolvedScheme();
  const colors = Colors[scheme];
  const create = useCreateTask();
  const [title, setTitle] = useState('');
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);

  function reset() {
    setTitle('');
    setPreset(PRESETS[0]);
  }

  async function submit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      await create.mutateAsync({ title: trimmed, priority: 0, remindAt: remindAtFor(preset) });
      reset();
      onClose();
    } catch (e) {
      log.error('create task failed', e);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flexEnd}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[styles.sheet, { backgroundColor: colors.background }]}
          >
            <View style={styles.handle} />
            <ThemedText type="subtitle">New task</ThemedText>

            <Input
              placeholder="What needs doing?"
              value={title}
              onChangeText={setTitle}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={submit}
            />

            <View style={styles.presets}>
              {PRESETS.map((p) => {
                const active = p.id === preset.id;
                return (
                  <Pressable
                    key={p.label}
                    onPress={() => setPreset(p)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active
                          ? colors.backgroundSelected
                          : colors.backgroundElement,
                      },
                    ]}
                  >
                    <ThemedText type="small">{p.label}</ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Button variant="secondary" onPress={onClose}>
                  <Button.Label>Cancel</Button.Label>
                </Button>
              </View>
              <View style={styles.flex1}>
                <Button onPress={submit} isDisabled={!title.trim() || create.isPending}>
                  <Button.Label>{create.isPending ? 'Adding…' : 'Add task'}</Button.Label>
                </Button>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  flexEnd: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    padding: Spacing.four,
    paddingBottom: Spacing.five,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: Spacing.three,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#999',
    opacity: 0.4,
    alignSelf: 'center',
    marginBottom: Spacing.one,
  },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
  row: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  flex1: { flex: 1 },
});
