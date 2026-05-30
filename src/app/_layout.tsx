import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HeroUINativeProvider } from 'heroui-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { ErrorBoundary } from '@/components/error-boundary';
import { DatabaseProvider } from '@/db/provider';
import { useAuth } from '@/features/auth';
import { SignInScreen } from '@/features/auth/components/sign-in-screen';
import { useResolvedScheme } from '@/hooks/use-theme';
import { queryClient } from '@/lib/query-client';

function AuthGate() {
  const hydrated = useAuth((s) => s.hydrated);
  const user = useAuth((s) => s.user);
  if (!hydrated) return null;
  if (!user) return <SignInScreen />;
  return (
    <>
      <AnimatedSplashOverlay />
      <AppTabs />
    </>
  );
}

export default function TabLayout() {
  const scheme = useResolvedScheme();
  const isDark = scheme === 'dark';
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <DatabaseProvider>
            <HeroUINativeProvider>
              <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <AuthGate />
              </ThemeProvider>
            </HeroUINativeProvider>
          </DatabaseProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
