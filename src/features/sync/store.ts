import { create } from 'zustand';

export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'error' | 'disabled';

type SyncState = {
  status: SyncStatus;
  online: boolean;
  lastSyncedAt: number | null;
  lastError: string | null;
  pendingCount: number;
  setStatus: (status: SyncStatus) => void;
  setOnline: (online: boolean) => void;
  setLastSynced: (ts: number) => void;
  setError: (msg: string | null) => void;
  setPending: (n: number) => void;
};

export const useSyncStore = create<SyncState>((set) => ({
  status: 'idle',
  online: true,
  lastSyncedAt: null,
  lastError: null,
  pendingCount: 0,
  setStatus: (status) => set({ status }),
  setOnline: (online) => set({ online }),
  setLastSynced: (lastSyncedAt) => set({ lastSyncedAt, lastError: null }),
  setError: (lastError) => set({ lastError, status: lastError ? 'error' : 'idle' }),
  setPending: (pendingCount) => set({ pendingCount }),
}));
