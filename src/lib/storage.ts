import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * App-wide persistent key-value store.
 *
 * Backed by `@react-native-async-storage/async-storage` so it works in Expo
 * Go, dev builds, and production builds without a native rebuild. Use it for:
 *   - user preferences (theme, app lock timeout, etc.)
 *   - small cached lookups
 *
 * Do NOT use it for:
 *   - large datasets (use SQLite via `@/db/client`)
 *   - secrets (use `expo-secure-store`)
 */
export const storage = AsyncStorage;

/**
 * Zustand-compatible storage adapter for the `persist` middleware.
 */
export const zustandAsyncStorage = {
  getItem: (name: string) => AsyncStorage.getItem(name),
  setItem: (name: string, value: string) => AsyncStorage.setItem(name, value),
  removeItem: (name: string) => AsyncStorage.removeItem(name),
};
