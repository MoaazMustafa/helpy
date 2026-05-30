import { BlurView } from 'expo-blur';
import { useEffect, useSyncExternalStore } from 'react';
import { AppState, StyleSheet } from 'react-native';

import { useResolvedScheme } from '@/hooks/use-theme';

import { useAppLock } from '../store';

let currentState: 'active' | 'inactive' =
  AppState.currentState === 'active' ? 'active' : 'inactive';
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  if (listeners.size === 0) {
    AppState.addEventListener('change', (s) => {
      const next = s === 'active' ? 'active' : 'inactive';
      if (next === currentState) return;
      currentState = next;
      listeners.forEach((fn) => fn());
    });
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const getSnapshot = () => currentState;

/**
 * iOS-style privacy cover. Renders a blur over the app content whenever the
 * app transitions to `inactive` (app switcher) but not yet `background`.
 *
 * This keeps sensitive data out of OS screenshots without forcing a re-auth.
 */
export function PrivacyCover() {
  const enabled = useAppLock((s) => s.enabled);
  const scheme = useResolvedScheme();
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Touch effect dep so React keeps the subscription alive when enabled flips.
  useEffect(() => {}, [enabled]);

  if (!enabled || state === 'active') return null;
  return (
    <BlurView intensity={80} tint={scheme} style={StyleSheet.absoluteFill} pointerEvents="none" />
  );
}
