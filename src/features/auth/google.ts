import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect } from 'react';

import { env } from '@/lib/env';
import { log } from '@/lib/logger';

import { useAuth } from './store';

// Required for the OAuth redirect to close the in-app browser on completion.
WebBrowser.maybeCompleteAuthSession();

type GoogleUserInfo = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
};

async function fetchGoogleProfile(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Google userinfo failed: ${res.status}`);
  }
  return (await res.json()) as GoogleUserInfo;
}

/**
 * Hook wrapping Google OAuth via expo-auth-session.
 *
 * Returns `{ promptAsync, ready }`. Call `promptAsync()` from a button handler.
 * On success the auth store is populated and the route guard navigates away
 * from the sign-in screen.
 *
 * Uses PKCE by default (built into expo-auth-session) and per-platform client IDs.
 */
export function useGoogleSignIn() {
  const setSession = useAuth((s) => s.setSession);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: env.googleClientIdIos || undefined,
    androidClientId: env.googleClientIdAndroid || undefined,
    webClientId: env.googleClientIdWeb || undefined,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type !== 'success') return;
    const accessToken = response.authentication?.accessToken;
    const idToken = response.authentication?.idToken ?? null;
    const expiresIn = response.authentication?.expiresIn;
    if (!accessToken) {
      log.warn('Google sign-in returned no access token');
      return;
    }

    fetchGoogleProfile(accessToken)
      .then((profile) => {
        setSession(
          {
            id: profile.sub,
            email: profile.email,
            name: profile.name ?? null,
            avatarUrl: profile.picture ?? null,
            provider: 'google',
          },
          {
            accessToken,
            idToken,
            expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
          },
        );
      })
      .catch((e) => log.error('Google profile fetch failed', e));
  }, [response, setSession]);

  const signIn = useCallback(() => {
    void promptAsync();
  }, [promptAsync]);

  return { signIn, ready: !!request };
}
