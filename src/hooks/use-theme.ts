/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useThemePreference } from '@/features/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ResolvedScheme = 'light' | 'dark';

/**
 * Resolve the effective color scheme by combining the OS scheme with the
 * user's preference (`system | light | dark`).
 */
export function useResolvedScheme(): ResolvedScheme {
  const mode = useThemePreference((s) => s.mode);
  const systemScheme = useColorScheme();

  if (mode === 'light' || mode === 'dark') return mode;
  return systemScheme === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  const scheme = useResolvedScheme();
  return Colors[scheme];
}
