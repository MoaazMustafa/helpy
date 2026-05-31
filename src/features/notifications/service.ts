import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { log } from '@/lib/logger';

/**
 * Thin wrapper around `expo-notifications`. The UI layer should never call
 * the SDK directly so we can swap providers, mock in tests, and no-op on web.
 */

const isSupported = Platform.OS !== 'web';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Asks for notification permission. Resolves `true` if granted (or already was),
 * `false` if denied or unsupported. Safe to call repeatedly.
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!isSupported) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return requested.granted;
}

/**
 * Schedules a one-shot local notification at `fireAt` (ms epoch).
 * Returns the platform notification id or null when permission is missing.
 */
export async function scheduleReminder(params: {
  title: string;
  body?: string | null;
  fireAt: number;
  data?: Record<string, unknown>;
}): Promise<string | null> {
  if (!isSupported) return null;
  const granted = await ensureNotificationPermission();
  if (!granted) return null;

  const seconds = Math.max(1, Math.floor((params.fireAt - Date.now()) / 1000));
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: params.title,
        body: params.body ?? undefined,
        data: params.data ?? {},
        sound: 'default',
        ...(Platform.OS === 'ios' ? { interruptionLevel: 'timeSensitive' as const } : {}),
      },
      trigger: { seconds, repeats: false } as Notifications.TimeIntervalTriggerInput,
    });
  } catch (e) {
    log.warn('scheduleReminder failed', e);
    return null;
  }
}

/**
 * Cancels a previously scheduled notification. Tolerates missing ids.
 */
export async function cancelReminder(id: string | null | undefined): Promise<void> {
  if (!isSupported || !id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // not scheduled; ignore
  }
}
