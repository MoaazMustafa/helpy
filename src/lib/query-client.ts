import { QueryClient } from '@tanstack/react-query';

/**
 * Shared TanStack Query client.
 *
 * Defaults tuned for an offline-first mobile app:
 *   - `staleTime: 30s` so quick re-renders don't refetch
 *   - `gcTime: 1h` keeps recently used queries warm
 *   - `retry: 2` with exponential backoff handled by the library
 *   - `refetchOnWindowFocus: false` — not meaningful on native
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 60 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
