import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { type ThemeMode, useThemePreference } from '@/features/theme';
import { useTheme } from '@/hooks/use-theme';

interface Option {
  value: ThemeMode;
  label: string;
}

const OPTIONS: readonly Option[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

/**
 * Segmented control for picking the app theme. Persists via the
 * `useThemePreference` store (MMKV-backed).
 */
export function ThemeToggle() {
  const mode = useThemePreference((s) => s.mode);
  const setMode = useThemePreference((s) => s.setMode);
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundElement }]}
      accessibilityRole="radiogroup"
    >
      {OPTIONS.map((option) => {
        const selected = option.value === mode;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => setMode(option.value)}
            style={[styles.option, selected && { backgroundColor: theme.backgroundSelected }]}
          >
            <ThemedText type="smallBold" themeColor={selected ? 'text' : 'textSecondary'}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: Spacing.half,
    gap: Spacing.half,
  },
  option: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: 10,
  },
});
