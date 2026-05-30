import { Button, RadioGroup } from 'heroui-native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

import { authenticate, getBiometricCapability } from '../biometrics';
import { type LockTimeout, useAppLock } from '../store';

const TIMEOUT_OPTIONS: { value: LockTimeout; label: string }[] = [
  { value: 'immediate', label: 'Immediately' },
  { value: '1m', label: '1 minute' },
  { value: '5m', label: '5 minutes' },
  { value: '15m', label: '15 minutes' },
  { value: 'never', label: 'Never' },
];

export function AppLockSettings() {
  const enabled = useAppLock((s) => s.enabled);
  const timeout = useAppLock((s) => s.timeout);
  const setEnabled = useAppLock((s) => s.setEnabled);
  const setTimeout = useAppLock((s) => s.setTimeout);
  const unlock = useAppLock((s) => s.unlock);

  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getBiometricCapability().then((cap) => {
      setAvailable(cap.hasHardware && cap.isEnrolled);
    });
  }, []);

  const onToggle = useCallback(
    async (next: boolean) => {
      setError(null);
      if (!next) {
        // Disabling requires re-auth so a bystander can't turn it off.
        const res = await authenticate('Authenticate to disable App Lock');
        if (!res.ok) {
          setError('Authentication required to disable App Lock.');
          return;
        }
        setEnabled(false);
        unlock();
        return;
      }
      // Enabling requires a successful auth so we don't lock the user out.
      const res = await authenticate('Authenticate to enable App Lock');
      if (!res.ok) {
        setError('Authentication required to enable App Lock.');
        return;
      }
      setEnabled(true);
      unlock();
    },
    [setEnabled, unlock],
  );

  if (available === false) {
    return (
      <ThemedText type="small" themeColor="textSecondary">
        Biometrics or device passcode aren&apos;t set up on this device. Enroll a biometric or
        passcode in system settings to use App Lock.
      </ThemedText>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <View style={styles.rowText}>
          <ThemedText type="small">App Lock</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Require biometrics on launch and after idle.
          </ThemedText>
        </View>
        <Switch value={enabled} onValueChange={onToggle} disabled={available === null} />
      </View>

      {error ? (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}

      {enabled ? (
        <View style={styles.timeoutSection}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            LOCK AFTER
          </ThemedText>
          <RadioGroup value={timeout} onValueChange={(v) => setTimeout(v as LockTimeout)}>
            {TIMEOUT_OPTIONS.map((opt) => (
              <RadioGroup.Item key={opt.value} value={opt.value}>
                {opt.label}
              </RadioGroup.Item>
            ))}
          </RadioGroup>
        </View>
      ) : null}

      {enabled ? (
        <Button
          variant="secondary"
          onPress={() => {
            useAppLock.getState().lock();
          }}
        >
          <Button.Label>Lock now</Button.Label>
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  rowText: { flex: 1, gap: Spacing.half },
  timeoutSection: { gap: Spacing.two },
  error: { color: '#E5484D' },
});
