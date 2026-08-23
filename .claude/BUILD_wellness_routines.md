# Dodam — Build: Wellness Routines (goal-based, with toggle)

Adds wellness routines alongside beauty ones. Depends on: wellness cabinet
build (Goal type, GOAL colors, type-aware products) already in place.

## Concept
- Routines screen gets a Beauty | Wellness toggle (like the cabinet tabs).
- Beauty routines are unchanged (role-step based: Morning/PM/Minimal).
- Wellness routines are GOAL-based: a routine = a goal name + a growable list
  of supplements (no per-row role labels, no fixed slot count).
- Saved wellness routines open into the same RoutineCard view and share as an
  image the same way beauty does; dosage is omitted, disclaimer shown.

## Data model (types.ts)
A Routine needs to know which cabinet it belongs to. Add a kind:
```ts
export type Routine = {
  id: string;
  name: string;
  kind?: 'beauty' | 'wellness';   // NEW; default 'beauty' for existing routines
  steps: RoutineStep[];
  // ...existing fields
};
```
For wellness routines, steps hold only a productId (the label field is unused /
optional). Reuse the existing RoutineStep shape:
```ts
export type RoutineStep = { label?: string; productId?: string };
```
So a wellness step is just { productId } — no role label.

## Storage
Routines already persist via storage.ts (@chokchok:routines). No key change.
Wellness routines save to the same store, distinguished by kind.

## Wellness preset templates (presetProtocols.ts or a new wellnessPresets.ts)
8 goal-based presets, each starts empty (user adds supplements):
```ts
export const WELLNESS_PRESETS = [
  { id: 'w-daily',    name: 'Daily',        kind: 'wellness', steps: [] },
  { id: 'w-sleep',    name: 'Sleep & Calm', kind: 'wellness', steps: [] },
  { id: 'w-energy',   name: 'Energy',       kind: 'wellness', steps: [] },
  { id: 'w-gut',      name: 'Gut',          kind: 'wellness', steps: [] },
  { id: 'w-immunity', name: 'Immunity',     kind: 'wellness', steps: [] },
  { id: 'w-hormone',  name: 'Hormone',      kind: 'wellness', steps: [] },
  { id: 'w-skinhair', name: 'Skin & Hair',  kind: 'wellness', steps: [] },
  { id: 'w-targeted', name: 'Targeted',     kind: 'wellness', steps: [] },
];
```

## Routines screen (app/routines.tsx)

1. Add a Beauty | Wellness toggle at the top of the LIST view (reuse the
   segmented-control styling from the cabinet's All/Beauty/Wellness).
2. When Beauty selected: show existing beauty presets + saved beauty routines
   (kind !== 'wellness').
3. When Wellness selected: show the 8 WELLNESS_PRESETS + saved wellness routines
   (kind === 'wellness'). Plus "+ Create custom routine" (creates an empty
   wellness routine; prompt for a name or default "My Routine").

## Wellness routine BUILDER

Reuse the beauty builder, with these differences when kind === 'wellness':
- No per-row role label (beauty shows "1 Cleanse / 2 Treat"; wellness shows
  just the supplement rows).
- Rows are a growable list: each filled row shows the supplement (silhouette in
  its GOAL tint + name + ✕ to remove); one "+ Add supplement" row at the bottom
  always present to add another. No fixed slot count.
- Tapping "+ Add supplement" opens the product picker filtered to
  type === 'wellness' (so only supplements show).
- Header shows the routine/goal name; Save persists with kind 'wellness'.

The beauty builder path (role-labeled fixed steps) is unchanged.

## Product picker filtering
The existing "Choose a product" picker should filter by the routine's kind:
- beauty routine → show type === 'beauty' products
- wellness routine → show type === 'wellness' products
So a sleep routine only offers supplements to add.

## View + Share (reuse Build B)
Saved wellness routine opens into RoutineCard (the finished view). RoutineCard
already:
- shows each step's product (silhouette + name + brand + timing),
- omits dosage,
- shows the disclaimer when any wellness product is present.
For wellness routines, ensure RoutineCard renders steps without requiring a
role label (a step with only productId still renders — show the product's GOAL
tint for its silhouette color). Share button works identically (image capture).

RoutineCard color per step: if the step's product is wellness, use GOAL[goal].tint;
if beauty, ROLE[role].tint (the styleFor helper from the wellness build).

---

## Verify
1. `npx expo start -c`, then `r`.
2. Routines → toggle shows Beauty | Wellness.
3. Beauty side: Morning/PM/Minimal unchanged, still role-based.
4. Wellness side: 8 goal presets + Create custom.
5. Open "Sleep & Calm" → builder shows goal name + "+ Add supplement";
   picker offers only supplements. Add 2-3, Save.
6. Saved Sleep routine opens into the finished RoutineCard (cool goal tints,
   supplement names + timing, disclaimer, NO dosage).
7. Share → image captured the same way as beauty.

Commit:
```
git add -A && git commit -m "Wellness routines: goal-based, toggle, view + share"
```

## Note
Beauty routines and the beauty builder are unchanged. Wellness routines reuse
the same store, RoutineCard, and share path — the differences are: kind field,
no role labels, growable rows, supplement-only picker, goal-tinted silhouettes.
