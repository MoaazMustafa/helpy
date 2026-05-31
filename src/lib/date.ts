import { endOfDay, format, formatDistanceToNow, isToday, isTomorrow, startOfDay } from 'date-fns';

/**
 * Date helpers. All functions assume the host device timezone — we never
 * persist localized strings, only epoch ms or ISO from DB layer.
 */

export function startOfToday(): number {
  return startOfDay(new Date()).getTime();
}

export function endOfToday(): number {
  return endOfDay(new Date()).getTime();
}

export function formatTime(ms: number): string {
  return format(new Date(ms), 'p');
}

export function formatRelative(ms: number): string {
  const d = new Date(ms);
  if (isToday(d)) return `Today, ${format(d, 'p')}`;
  if (isTomorrow(d)) return `Tomorrow, ${format(d, 'p')}`;
  return format(d, 'MMM d, p');
}

export function timeUntil(ms: number): string {
  return formatDistanceToNow(new Date(ms), { addSuffix: true });
}
