import { create } from 'zustand';
import { persist, type StateStorage } from 'zustand/middleware';

import { secureStorage } from '@/lib/secure-storage';

/**
 * Idle duration after which the app re-locks once backgrounded.
 */
export type LockTimeout = 'immediate' | '1m' | '5m' | '15m' | 'never';

export const LOCK_TIMEOUT_MS: Record<LockTimeout, number> = {
  immediate: 0,
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  never: Number.POSITIVE_INFINITY,
};

type AppLockState = {
  enabled: boolean;
  timeout: LockTimeout;
  isLocked: boolean;
  /** Epoch ms when the app last left the foreground. */
  backgroundedAt: number | null;
  hydrated: boolean;
  setEnabled: (enabled: boolean) => void;
  setTimeout: (timeout: LockTimeout) => void;
  lock: () => void;
  unlock: () => void;
  markBackgrounded: () => void;
  clearBackgrounded: () => void;
};

const persistStorage: StateStorage = {
  getItem: (name) => secureStorage.getItem(name),
  setItem: (name, value) => secureStorage.setItem(name, value),
  removeItem: (name) => secureStorage.removeItem(name),
};

export const useAppLock = create<AppLockState>()(
  persist(
    (set) => ({
      enabled: false,
      timeout: '1m',
      // Start locked when enabled, so a fresh launch always demands auth.
      isLocked: false,
      backgroundedAt: null,
      hydrated: false,
      setEnabled: (enabled) => set({ enabled, isLocked: enabled }),
      setTimeout: (timeout) => set({ timeout }),
      lock: () => set({ isLocked: true, backgroundedAt: null }),
      unlock: () => set({ isLocked: false, backgroundedAt: null }),
      markBackgrounded: () => set({ backgroundedAt: Date.now() }),
      clearBackgrounded: () => set({ backgroundedAt: null }),
    }),
    {
      name: 'helpy.app-lock',
      storage: {
        getItem: async (name) => {
          const raw = await persistStorage.getItem(name);
          return raw ? JSON.parse(raw) : null;
        },
        setItem: async (name, value) => {
          await persistStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => persistStorage.removeItem(name),
      },
      // Only persist user preferences — never the live `isLocked` flag.
      partialize: (state) =>
        ({ enabled: state.enabled, timeout: state.timeout }) as unknown as AppLockState,
      onRehydrateStorage: () => (state) => {
        // After hydration: if lock is enabled, start locked.
        useAppLock.setState({ hydrated: true, isLocked: !!state?.enabled });
      },
    },
  ),
);
