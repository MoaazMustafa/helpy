import { Button } from 'heroui-native';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { isGoogleConfigured, useGoogleSignIn } from '@/features/auth';

export function SignInScreen() {
  // Hooks must not be called conditionally, so we branch at the component
  // boundary: when no client ID exists for this platform, render a static
  // setup hint instead of mounting the hook (which would throw).
  if (!isGoogleConfigured()) {
    return <UnconfiguredSignIn />;
  }
  return <ConfiguredSignIn />;
}

function ConfiguredSignIn() {
  const { signIn, ready } = useGoogleSignIn();

  return (
    <Shell>
      <Button onPress={signIn} isDisabled={!ready}>
        <Button.Label>Continue with Google</Button.Label>
      </Button>
    </Shell>
  );
}

function UnconfiguredSignIn() {
  const envVar = Platform.select({
    ios: 'EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS',
    android: 'EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID',
    web: 'EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB',
    default: 'EXPO_PUBLIC_GOOGLE_CLIENT_ID_*',
  });
  return (
    <Shell>
      <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
        Google sign-in is not configured for this platform. Set {envVar} in your .env and restart
        the dev server.
      </ThemedText>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Welcome to Helpy
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
              Sign in to sync your tasks, reminders, and progress across devices.
            </ThemedText>
          </View>
          <View style={styles.actions}>{children}</View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.four,
    gap: Spacing.six,
  },
  header: { gap: Spacing.two, alignItems: 'center' },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center' },
  actions: { gap: Spacing.three },
});
