import { Button } from 'heroui-native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useGoogleSignIn } from '@/features/auth';

export function SignInScreen() {
  const { signIn, ready } = useGoogleSignIn();

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

          <View style={styles.actions}>
            <Button onPress={signIn} isDisabled={!ready}>
              <Button.Label>Continue with Google</Button.Label>
            </Button>
          </View>
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
