import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandMMKVStorage } from '@/lib/storage';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemePreferenceState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

/**
 * User-controlled theme preference, persisted via MMKV.
 *
 * Read with a slice selector to avoid re-renders:
 *   const mode = useThemePreference((s) => s.mode);
 */
export const useThemePreference = create<ThemePreferenceState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'theme-preference',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
);
