import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HeroUINativeProvider } from 'heroui-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { ErrorBoundary } from '@/components/error-boundary';
import { useResolvedScheme } from '@/hooks/use-theme';
import { queryClient } from '@/lib/query-client';

export default function TabLayout() {
  const scheme = useResolvedScheme();
  const isDark = scheme === 'dark';
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <HeroUINativeProvider>
            <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
              <StatusBar style={isDark ? 'light' : 'dark'} />
              <AnimatedSplashOverlay />
              <AppTabs />
            </ThemeProvider>
          </HeroUINativeProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
