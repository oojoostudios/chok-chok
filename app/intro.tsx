import { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { router } from 'expo-router';
import Silhouette from '../components/Silhouette';
import { COLORS } from '../theme';
import { markIntroSeen } from '../introStore';

// The intro is the same room as the rest of the app, so it uses the app ground
// rather than a hero tone of its own. app.json's splash backgroundColor is
// COLORS.bg by hand — native splash config cannot import from JS, so the two
// have to be kept in sync manually.
const GROUND = COLORS.bg;
// `chip` is the palette's low-emphasis fill. It sits close enough to `bg` to
// read as a watermark at full opacity, which is why the 0.1 opacity that the
// old mauve needed is gone — at that alpha this tone would be invisible.
const FIGURE = COLORS.chip;
const BODY_INK = COLORS.sub;

const HEADLINE = 'Shelf care, shared';
// The \u00A0 binds the last two words so the line can never break to a single
// orphaned "you." — belt and braces alongside the wider measure below.
const BODY =
  'Build your shelf. Group products into routines. Send one as a card — and keep the ones friends send\u00A0you.';
const CTA = 'Start your shelf';

const BODY_SIZE = 13;
const BODY_LEADING = 1.6;

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

      {/* One dropper bottle, sized so the whole shape reads rather than a
          cropped fragment. The icon occupies only the middle third of its
          110-wide viewBox, so a 1.2x box puts the bottle itself at ~0.4x
          screen width, sitting in the upper right with a sliver bleeding off
          the edge. `solid` collapses the interior contours, so this renders as
          a single filled shape. pointerEvents lets taps through to the CTA. */}
      <View
        pointerEvents="none"
        style={[styles.figure, { top: -width * 0.15, right: -width * 0.45 }]}
      >
        <Silhouette icon="dropper-1" color={FIGURE} size={width * 1.2} solid />
      </View>

      <Text style={styles.wordmark}>INROTO</Text>

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
    // Was capped at 260, which wrapped the last word onto its own line. No cap
    // now: the block runs the full measure between the screen's 26pt gutters.
    fontSize: BODY_SIZE,
    lineHeight: BODY_SIZE * BODY_LEADING,
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
