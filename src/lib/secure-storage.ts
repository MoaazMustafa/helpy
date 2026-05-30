import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Cross-platform secure key/value storage.
 *
 * - Native: hardware-backed Keychain (iOS) / Keystore (Android) via expo-secure-store.
 * - Web: falls back to localStorage. **Not** encrypted. Do not store
 *   high-value secrets in the web build.
 */
type SecureStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const nativeStorage: SecureStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

const webStorage: SecureStorage = {
  getItem: async (key) => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  setItem: async (key, value) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },
};

export const secureStorage: SecureStorage = Platform.OS === 'web' ? webStorage : nativeStorage;
