import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import * as SplashScreen from 'expo-splash-screen';
import { loadHasSeenIntro } from '../introStore';

// Module scope, not awaited — per the expo-splash-screen docs.
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({ DMSerifDisplay_400Regular });
  // null means "not yet known" — we must not render or route until it resolves.
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null);

  useEffect(() => {
    loadHasSeenIntro().then(setHasSeenIntro);
  }, []);

  const ready = (fontsLoaded || !!fontError) && hasSeenIntro !== null;

  useEffect(() => {
    if (!ready) return;
    if (hasSeenIntro) {
      // Home is the initial route already, so it is safe to reveal it now.
      SplashScreen.hideAsync();
    } else {
      // Leave the splash up. The intro screen hides it once it has painted,
      // so home never shows through the gap between mount and replace.
      router.replace('/intro');
    }
  }, [ready, hasSeenIntro]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
