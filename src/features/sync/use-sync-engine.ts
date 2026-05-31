import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';

import { drainOutbox, refreshPending } from './engine';
import { useSyncStore } from './store';
import { isSyncConfigured } from './supabase';

/**
 * Mount once at app root. Watches connectivity, refreshes the pending count,
 * and triggers an outbox drain when the device comes back online.
 */
export function useSyncEngine() {
  const setOnline = useSyncStore((s) => s.setOnline);
  const setStatus = useSyncStore((s) => s.setStatus);

  useEffect(() => {
    if (!isSyncConfigured()) {
      setStatus('disabled');
      return;
    }
    void refreshPending();

    const unsub = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected && state.isInternetReachable !== false;
      setOnline(online);
      if (online) {
        void drainOutbox();
      } else {
        setStatus('offline');
      }
    });
    return unsub;
  }, [setOnline, setStatus]);
}
