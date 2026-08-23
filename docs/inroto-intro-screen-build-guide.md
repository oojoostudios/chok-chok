# Inroto — First-Run Intro Screen

## Goal

Add a single intro screen that shows once, on first launch only, explaining what Inroto is and sending the user into their empty cabinet. After the user taps through, it never appears again.

## Scope

**In:** one new route, a first-run flag in AsyncStorage, a gate in the root layout, one Google font.

**Not in:** onboarding carousel, multi-step walkthrough, native splash screen changes, permissions prompts, analytics. Do not add a "Skip" button — the screen shows once, so there is nothing to skip.

---

## Before you start

Read these and report what you find rather than assuming:

1. The current root layout (`app/_layout.tsx` or equivalent) — how does it currently mount, and does it already load fonts or hold the splash screen?
2. Where the existing product silhouette SVG components live, and what their component names and props are. One will be reused here.
3. Where colour values live — a theme file, a constants file, or inline. The intro screen must use whatever already exists, not new hardcoded hexes.
4. The existing AsyncStorage keys in use.

**Do not modify `@chokchok:routines`.** That key is intentionally preserved and unrelated to this work.

---

## Where it lives

This is an **Expo Router route**, not a native splash screen.

That choice is deliberate: since SDK 52, Expo Go shows the app icon instead of the configured splash, and development builds don't reflect all splash config plugin properties. Building this as a native splash would mean it can't be previewed in Expo Go at all. As a route it renders normally in Expo Go and can be iterated on directly.

The existing native splash stays as-is. Set its background colour to match the intro screen's ground colour so the handoff between them is invisible.

### The gate

In the root layout:

- New AsyncStorage key: `@chokchok:hasSeenIntro`, value `'true'`.
- On mount, read the key into state initialised as `null` (meaning "not yet known").
- Hold the native splash visible (`SplashScreen.preventAutoHideAsync()`) until **both** the flag has resolved **and** fonts have loaded.
- Only then call `SplashScreen.hideAsync()` and render.
- If the flag is absent, route to the intro screen. If present, go straight to the normal home route.

**This ordering matters.** If the splash hides before the flag resolves, the user sees a flash of the home screen before being bounced to the intro. Resolve first, render once.

The CTA writes `@chokchok:hasSeenIntro = 'true'` and navigates with `router.replace()` — not `push()` — so the intro is not in the back stack.

---

## Content

Exact copy. Do not paraphrase or reflow.

**Wordmark:** `INROTO`

**Headline:**
```
Shelf care, shared
```

**Body:**
```
Build your shelf. Group products into routines.
Send one as a card — and keep the ones friends send you.
```

**Button:**
```
Start your shelf
```

Sentence case on the headline is deliberate — do not set it in caps. All-caps breaks badly if Hangul ever appears, and the serif is doing enough work at display size.

---

## Layout

Single full-height screen, no scroll. Content is bottom-weighted so the button sits in the thumb zone.

```
┌─────────────────────┐
│                     │  safe-area top + 24
│  INROTO             │  wordmark, 10pt, wide tracking
│                     │
│                     │
│      (silhouette    │  oversized, low opacity,
│       bleeds off    │  absolutely positioned,
│       an edge)      │  pointerEvents="none"
│                     │
│                     │
│  Shelf care,        │  serif, ~40pt, 1.08 line height
│  shared             │
│                     │  16pt gap
│  Build your shelf.  │  13pt, 1.6 line height
│  Group products…    │  max width ~260
│                     │  28pt gap
│  ┌───────────────┐  │
│  │ Start your    │  │  full-width pill, 52pt tall
│  │ shelf         │  │
│  └───────────────┘  │
│                     │  safe-area bottom + 32
└─────────────────────┘
```

Horizontal padding: 26. Use `useSafeAreaInsets()` for top and bottom — do not hardcode notch offsets.

---

## Type and colour

Install:

```
npx expo install @expo-google-fonts/dm-serif-display expo-font
```

Use `npx expo install`, not `npm install`. Load `DMSerifDisplay_400Regular` via the `useFonts` hook in the root layout alongside the flag check.

The headline uses DM Serif Display. Everything else uses the app's existing body font — do not introduce a second new typeface.

Ground colour: pull from the existing theme. If there's no established intro/hero tone, use the warm blush already in the app's palette rather than inventing one, and flag it for review.

Text sits at high contrast against the ground. The silhouette sits at **8–12% opacity** — it is a colour field, not an illustration. If it reads as a drawing, reduce the opacity.

---

## The silhouette

Reuse one existing product silhouette component. Do not create a new asset.

- Switch it from `stroke="currentColor"` to a `fill`, so it reads as a soft shape rather than a line drawing.
- Scale to roughly 2× the screen width and position it absolutely so it bleeds off one edge — top-right or bottom-left, whichever reads better against the text block.
- **`pointerEvents="none"` is required** so taps pass through to the button underneath.

If the existing components don't accept a fill or opacity prop, add one rather than duplicating the SVG.

---

## Known gotchas

- **`letterSpacing` differs across platforms.** iOS treats it as absolute points; Android's handling is less predictable. The wordmark uses wide tracking, so check it on both. Use `Platform.select()` if the values need to diverge.
- **Run `npx expo start -c`** after adding the font package, to clear the bundler cache.
- **Don't hide the splash early.** See the ordering note above.
- **Test the second launch.** Kill and reopen the app — the intro must not reappear.
- To re-test the first-run path, clear the key or use a dev-only reset. Do not ship a reset button.

---

## Acceptance criteria

Do not report this as complete until every line is true:

- [ ] Fresh install goes straight to the intro screen with no flash of the home screen.
- [ ] Second launch goes straight to home. Intro does not appear.
- [ ] Copy matches this document exactly, including punctuation and the em dash.
- [ ] Headline renders in DM Serif Display, not a fallback serif.
- [ ] Button is tappable across its full width — the silhouette does not intercept taps.
- [ ] Nothing is cut off or overlapping on a small device (iPhone SE) or a notched device.
- [ ] `@chokchok:routines` is untouched.
- [ ] No scrolling on the intro screen at any supported size.

If any criterion fails, say which one and why. Do not describe the screen as built.

---

## Git

Commit before starting. Commit again once the acceptance criteria pass, before any styling refinement.
