import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { db } from './client';
import migrations from './migrations/migrations';

/**
 * Runs Drizzle migrations on app boot. Renders a tiny loader while pending,
 * surfaces a recoverable error screen on failure.
 *
 * Keep this above any component that touches the database.
 */
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Database setup failed</Text>
        <Text style={styles.message}>{error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  title: { fontSize: 18, fontWeight: '600' },
  message: { textAlign: 'center', opacity: 0.7 },
});
