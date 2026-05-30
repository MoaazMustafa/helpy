import { create } from 'zustand';
import { persist, type StateStorage } from 'zustand/middleware';

import { secureStorage } from '@/lib/secure-storage';

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  provider: 'google';
};

type AuthSession = {
  accessToken: string;
  idToken: string | null;
  expiresAt: number | null;
};

type AuthState = {
  user: AuthUser | null;
  session: AuthSession | null;
  hydrated: boolean;
  setSession: (user: AuthUser, session: AuthSession) => void;
  signOut: () => void;
};

const zustandSecureStorage: StateStorage = {
  getItem: (name) => secureStorage.getItem(name),
  setItem: (name, value) => secureStorage.setItem(name, value),
  removeItem: (name) => secureStorage.removeItem(name),
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      hydrated: false,
      setSession: (user, session) => set({ user, session }),
      signOut: () => set({ user: null, session: null }),
    }),
    {
      name: 'helpy.auth',
      storage: {
        getItem: async (name) => {
          const raw = await zustandSecureStorage.getItem(name);
          return raw ? JSON.parse(raw) : null;
        },
        setItem: async (name, value) => {
          await zustandSecureStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => zustandSecureStorage.removeItem(name),
      },
      partialize: (state) => ({ user: state.user, session: state.session }) as unknown as AuthState,
      onRehydrateStorage: () => (state) => {
        state?.hydrated && void 0; // no-op
        // Mark hydrated regardless of outcome so the gate can release.
        useAuth.setState({ hydrated: true });
      },
    },
  ),
);
