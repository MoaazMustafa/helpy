import Constants from 'expo-constants';
import { z } from 'zod';

/**
 * Typed access to runtime configuration exposed via `app.config.ts` → `extra`.
 *
 * Values are validated once at module load. Missing required values throw
 * immediately so misconfigured builds fail fast at startup rather than at
 * the first network call.
 *
 * Only `EXPO_PUBLIC_*` values belong here. Real secrets must stay server-side.
 */

const EnvSchema = z.object({
  supabaseUrl: z.string().url().or(z.literal('')),
  supabaseAnonKey: z.string().min(1).or(z.literal('')),
  googleClientIdIos: z.string().or(z.literal('')),
  googleClientIdAndroid: z.string().or(z.literal('')),
  googleClientIdWeb: z.string().or(z.literal('')),
  githubClientId: z.string().or(z.literal('')),
});

export type Env = z.infer<typeof EnvSchema>;

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

const parsed = EnvSchema.safeParse(extra);

if (!parsed.success) {
  // Throwing here is intentional: a misconfigured build should never reach UI.
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const env: Env = parsed.data;
