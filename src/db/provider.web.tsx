import { type ReactNode } from 'react';

/**
 * Web build skips the SQLite migration step. expo-sqlite's synchronous web
 * worker is unreliable in dev and the app's primary surfaces are iOS/Android.
 * Any web-only feature that needs persistence should use a different adapter.
 */
export function DatabaseProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
