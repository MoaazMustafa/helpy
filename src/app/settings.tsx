import { Button } from 'heroui-native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { AppLockSettings } from '@/features/app-lock';
import { useAuth } from '@/features/auth';
import { ThemeToggle } from '@/features/theme';

export default function SettingsScreen() {
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Settings
          </ThemedText>

          <Section title="Appearance">
            <ThemedText type="small" themeColor="textSecondary" style={styles.caption}>
              Choose how Helpy looks. System follows your device.
            </ThemedText>
            <ThemeToggle />
          </Section>

          <Section title="Security">
            <AppLockSettings />
          </Section>

          {user ? (
            <Section title="Account">
              <ThemedText type="small">{user.name ?? user.email}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.caption}>
                Signed in with {user.provider}
              </ThemedText>
              <Button variant="secondary" onPress={signOut}>
                <Button.Label>Sign out</Button.Label>
              </Button>
            </Section>
          ) : null}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {title.toUpperCase()}
      </ThemedText>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, alignItems: 'center' },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.four,
  },
  title: { marginBottom: Spacing.two },
  section: { gap: Spacing.two },
  sectionBody: { gap: Spacing.two },
  caption: { marginBottom: Spacing.one },
});
