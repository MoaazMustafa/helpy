import { createMMKV } from 'react-native-mmkv';

/**
 * Single MMKV instance for the whole app.
 *
 * MMKV is synchronous, fast, and persistent. Use it for:
 *   - user preferences (theme, app lock timeout, etc.)
 *   - small cached lookups
 *
 * Do NOT use it for:
 *   - large datasets (use SQLite via `@/db/client`)
 *   - secrets (use `expo-secure-store`)
 *
 * Note: `react-native-mmkv` requires a custom dev build (works fine with
 * `npx expo run:ios|android` or EAS dev clients; does not work in Expo Go).
 */
export const storage = createMMKV({ id: 'helpy.default' });

/**
 * Zustand-compatible storage adapter for `persist` middleware.
 */
export const zustandMMKVStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};
