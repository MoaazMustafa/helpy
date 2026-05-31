import { Card, Surface } from 'heroui-native';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { isGoogleConfigured, useGoogleSignIn } from '@/features/auth';
import { useResolvedScheme } from '@/hooks/use-theme';

import { GoogleLogo } from './google-logo';

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
  const [pending, setPending] = useState(false);

  async function handle() {
    setPending(true);
    try {
      await signIn();
    } finally {
      // The AuthGate unmounts this screen on success, but if the user cancels
      // the OAuth prompt we still need to release the spinner.
      setPending(false);
    }
  }

  return (
    <Shell>
      <GoogleButton onPress={handle} disabled={!ready || pending} pending={pending} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.legal}>
        By continuing you agree to our terms of use and privacy policy.
      </ThemedText>
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
      <GoogleButton disabled pending={false} onPress={() => {}} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.legal}>
        Google sign-in is not configured for this platform. Set {envVar} in your .env and restart
        the dev server.
      </ThemedText>
    </Shell>
  );
}

function GoogleButton({
  onPress,
  disabled,
  pending,
}: {
  onPress: () => void;
  disabled: boolean;
  pending: boolean;
}) {
  const scheme = useResolvedScheme();
  const colors = Colors[scheme];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.googleBtn,
        {
          backgroundColor: '#ffffff',
          borderColor: colors.backgroundSelected,
          opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
        },
      ]}
    >
      {pending ? <ActivityIndicator color="#1f1f1f" /> : <GoogleLogo size={20} />}
      <ThemedText style={styles.googleLabel}>
        {pending ? 'Signing in…' : 'Continue with Google'}
      </ThemedText>
    </Pressable>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const scheme = useResolvedScheme();
  const colors = Colors[scheme];
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={[styles.brandDot, { backgroundColor: colors.text }]}>
            <ThemedText type="title" style={[styles.brandGlyph, { color: colors.background }]}>
              h
            </ThemedText>
          </View>
          <Card style={styles.card}>
            <Surface variant="default" style={styles.surface}>
              <View style={styles.header}>
                <ThemedText type="title" style={styles.title}>
                  Welcome to Helpy
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
                  Sign in to sync your tasks, reminders and progress across devices.
                </ThemedText>
              </View>
              <View style={styles.actions}>{children}</View>
            </Surface>
          </Card>
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
    gap: Spacing.five,
    alignItems: 'center',
  },
  brandDot: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandGlyph: { fontSize: 36, lineHeight: 40 },
  card: { width: '100%', borderRadius: 24, overflow: 'hidden' },
  surface: { padding: Spacing.five, gap: Spacing.five, borderRadius: 24 },
  header: { gap: Spacing.two, alignItems: 'center' },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center' },
  actions: { gap: Spacing.three },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: 14,
    paddingHorizontal: Spacing.four,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  googleLabel: { color: '#1f1f1f', fontSize: 15, fontWeight: '600' },
  legal: { textAlign: 'center' },
});
