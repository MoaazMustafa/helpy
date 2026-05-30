import * as LocalAuthentication from 'expo-local-authentication';

import { log } from '@/lib/logger';
import { err, ok, type Result } from '@/lib/result';

export type BiometricCapability = {
  hasHardware: boolean;
  isEnrolled: boolean;
  types: LocalAuthentication.AuthenticationType[];
};

export async function getBiometricCapability(): Promise<BiometricCapability> {
  const [hasHardware, isEnrolled, types] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);
  return { hasHardware, isEnrolled, types };
}

/**
 * Prompts the user for biometric authentication, falling back to device passcode.
 *
 * Returns `ok(true)` on success, `err(reason)` on failure or cancellation.
 */
export async function authenticate(promptMessage: string): Promise<Result<true, string>> {
  try {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage,
      // Fall back to device passcode if biometrics fail/unavailable.
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
    });
    if (res.success) return ok(true);
    return err(res.error ?? 'unknown');
  } catch (e) {
    log.error('Biometric prompt threw', e);
    return err(e instanceof Error ? e.message : 'unknown');
  }
}
