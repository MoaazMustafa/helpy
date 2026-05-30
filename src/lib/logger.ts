/**
 * Tiny dev-only logger. In production all calls become no-ops so they
 * tree-shake away cleanly.
 */
/* eslint-disable no-console */

const isDev = __DEV__;

export const log = {
  debug: (...args: unknown[]) => {
    if (isDev) console.log('[debug]', ...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.log('[info]', ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn('[warn]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[error]', ...args);
  },
};
