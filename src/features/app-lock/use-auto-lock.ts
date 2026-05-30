import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { LOCK_TIMEOUT_MS, useAppLock } from './store';

/**
 * Subscribes to AppState transitions and locks the app when the configured
 * idle threshold has elapsed since the last background event.
 *
 * Mount once near the root.
 */
export function useAutoLock() {
  const last = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = last.current;
      last.current = next;

      const { enabled, timeout, lock, markBackgrounded, clearBackgrounded, backgroundedAt } =
        useAppLock.getState();
      if (!enabled) return;

      // Going to background — start the idle timer.
      if (next !== 'active' && prev === 'active') {
        markBackgrounded();
        return;
      }

      // Returning to foreground — decide whether to lock.
      if (next === 'active' && prev !== 'active') {
        const threshold = LOCK_TIMEOUT_MS[timeout];
        const elapsed = backgroundedAt ? Date.now() - backgroundedAt : Number.POSITIVE_INFINITY;
        if (elapsed >= threshold) {
          lock();
        } else {
          clearBackgrounded();
        }
      }
    });

    return () => sub.remove();
  }, []);
}
