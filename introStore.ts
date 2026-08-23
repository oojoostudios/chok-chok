import AsyncStorage from '@react-native-async-storage/async-storage';

const HAS_SEEN_INTRO_KEY = '@chokchok:hasSeenIntro';

export async function loadHasSeenIntro(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(HAS_SEEN_INTRO_KEY)) === 'true';
  } catch {
    // A read failure would otherwise trap the user on the intro every launch.
    return true;
  }
}

export async function markIntroSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(HAS_SEEN_INTRO_KEY, 'true');
  } catch {}
}

// Dev-only: clears the flag so the next launch replays the first-run path.
// Called from the __DEV__-gated reset control in app/index.tsx, which is
// marked REMOVE BEFORE SHIPPING. This helper itself is harmless to keep.
export async function resetIntroForTesting(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HAS_SEEN_INTRO_KEY);
  } catch {}
}
