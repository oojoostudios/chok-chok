import { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { router } from 'expo-router';
import Silhouette from '../components/Silhouette';
import { COLORS, ROLE } from '../theme';
import { markIntroSeen } from '../introStore';

// No established intro/hero tone exists in the theme, so this reuses the warm
// blush already in the palette. Keep app.json's splash backgroundColor in sync.
const GROUND = ROLE.Seal.bg;
const FIGURE = ROLE.Seal.tintStrong;
const BODY_INK = ROLE.Seal.ink;

const HEADLINE = 'Shelf care, shared';
const BODY =
  'Build your shelf. Group products into routines. Send one as a card — and keep the ones friends send you.';
const CTA = 'Start your shelf';

export default function IntroScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // The root layout deliberately leaves the splash up so home never flashes
  // behind the redirect. This is the handoff: reveal once we have painted.
  const revealOnce = useCallback(() => {
    SplashScreen.hideAsync();
  }, []);

  const start = useCallback(async () => {
    await markIntroSeen();
    router.replace('/');
  }, []);

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
      ]}
      onLayout={revealOnce}
    >
      <StatusBar style="dark" />

      {/* A colour field, not an illustration. pointerEvents lets taps through
          to the button beneath it. */}
      <View
        pointerEvents="none"
        style={[styles.figure, { top: -width * 1.25, right: -width * 1.56 }]}
      >
        <Silhouette icon="dropper-1" color={FIGURE} size={width * 3.3} opacity={0.1} solid />
      </View>

      <Text style={styles.wordmark}>DODAM</Text>

      <View style={styles.spacer} />

      <Text style={styles.headline}>{HEADLINE}</Text>

      <Text style={styles.body}>{BODY}</Text>

      <Pressable
        accessibilityRole="button"
        onPress={start}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonLabel}>{CTA}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: GROUND,
    paddingHorizontal: 26,
    // The silhouette is deliberately larger than the screen; clip it so it
    // cannot extend the layout past the viewport.
    overflow: 'hidden',
  },
  figure: {
    position: 'absolute',
  },
  spacer: {
    flex: 1,
  },
  wordmark: {
    fontSize: 10,
    color: COLORS.ink,
    // iOS treats letterSpacing as absolute points; Android renders it heavier.
    letterSpacing: Platform.select({ ios: 4, android: 3.2, default: 4 }),
  },
  headline: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 40,
    lineHeight: 43,
    color: COLORS.ink,
  },
  body: {
    marginTop: 16,
    maxWidth: 260,
    fontSize: 13,
    lineHeight: 21,
    color: BODY_INK,
  },
  button: {
    marginTop: 28,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.card,
  },
});
