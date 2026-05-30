import { BlurView } from 'expo-blur';
import { Button } from 'heroui-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useResolvedScheme } from '@/hooks/use-theme';

import { authenticate } from '../biometrics';
import { useAppLock } from '../store';

/**
 * Full-screen lock surface. Prompts for biometrics on mount and on every
 * Retry tap. Blurred backdrop hides app content underneath.
 */
export function LockScreen() {
  const scheme = useResolvedScheme();
  const unlock = useAppLock((s) => s.unlock);
  const [error, setError] = useState<string | null>(null);
  const [prompting, setPrompting] = useState(false);

  const prompt = async () => {
    if (prompting) return;
    setPrompting(true);
    setError(null);
    const res = await authenticate('Unlock Helpy');
    setPrompting(false);
    if (res.ok) {
      unlock();
    } else {
      setError('Authentication failed. Try again.');
    }
  };

  useEffect(() => {
    // Triggering a biometric prompt on mount is the whole point of this screen,
    // so the resulting setState calls are intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void prompt();
    // Intentionally run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView intensity={50} tint={scheme} style={StyleSheet.absoluteFill} />
      <ThemedView style={[StyleSheet.absoluteFill, styles.dim]}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.content}>
            <ThemedText type="title" style={styles.title}>
              Helpy is locked
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
              Unlock with biometrics or your device passcode.
            </ThemedText>
            {error ? (
              <ThemedText type="small" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}
            <Button onPress={prompt} isDisabled={prompting}>
              <Button.Label>{prompting ? 'Authenticating…' : 'Unlock'}</Button.Label>
            </Button>
          </View>
        </SafeAreaView>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: { opacity: 0.96 },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.four,
    gap: Spacing.three,
    alignItems: 'center',
  },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center' },
  error: { color: '#E5484D', textAlign: 'center' },
});
