// https://docs.expo.dev/workflow/configuration/#using-appconfigjs-or-appconfigts
// Dynamic Expo config — reads env vars and exposes them under `expo.extra`.
// Secrets must never be committed; use a local `.env` (gitignored) or EAS secrets.

import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'helpy',
  slug: 'helpy',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'helpy',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
    bundleIdentifier: 'com.moaazmustafa.helpy',
    supportsTablet: true,
    infoPlist: {
      // App uses only standard HTTPS / Apple-provided crypto, so we can
      // declare exempt encryption to skip the App Store Connect prompt.
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.moaazmustafa.helpy',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  updates: {
    url: 'https://u.expo.dev/5052209d-d624-4fc3-a134-d4442b7fbee0',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-web-browser',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        android: {
          image: './assets/images/splash-icon.png',
          imageWidth: 76,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: '5052209d-d624-4fc3-a134-d4442b7fbee0',
    },
    // Public values only — anything here ships in the JS bundle and is readable
    // by anyone with the app binary. Real secrets must stay server-side.
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    googleClientIdIos: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS ?? '',
    googleClientIdAndroid: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID ?? '',
    googleClientIdWeb: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB ?? '',
    githubClientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID ?? '',
  },
});
