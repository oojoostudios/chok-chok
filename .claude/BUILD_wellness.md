# Dodam — Build: Wellness cabinet (goal taxonomy, parallel to beauty roles)

Brings wellness up to parity with beauty. Wellness products organize by GOAL
(not role), reuse the same container icons + add form + store, add an optional
dosage field, and keep dosage OUT of shared cards.

## File included
- `containerIcons.ts` → REPLACE data/containerIcons.ts. Now 25 icons across 8
  families (adds pill bottle, gummy, suppository, patch). Same API as before,
  so existing beauty code keeps working.

## Step 1 — Types + FULL palette re-tone (types.ts + theme.ts)

This build ALSO re-tones beauty into a warm family so the two cabinets read by
temperature (beauty warm, wellness cool). Update BOTH maps in theme.ts.

types.ts:
```ts
export type Goal =
  'Daily'|'Sleep & Calm'|'Energy'|'Gut'|'Immunity'|'Hormone'|'Skin & Hair'|'Targeted';
```
Add to Product:
```ts
goal?: Goal;       // wellness: required in the form (like role for beauty)
dosage?: string;   // wellness: optional. NOT shared.
```

theme.ts — REPLACE the ROLE tints with these WARM values (bg / tint), keep ink
roughly as-is or darken tint for tintStrong at small sizes:
```
Remove    bg #EAD9CC  tint #B08A6E
Cleanse   bg #F0E7D6  tint #CBA875
Exfoliate bg #F3E2D2  tint #D6A074
Prep      bg #EEE8DF  tint #C4AE98
Treat     bg #F3DED3  tint #D6926F
Seal      bg #F4DEE3  tint #D48EA0
Protect   bg #F5EAD2  tint #DDB56E
Targeted  bg #ECDAE0  tint #BE8CA0
```

theme.ts — ADD a GOAL map with these COOL values:
```
Daily        bg #E6EBE2  tint #A7BA9A
Sleep & Calm bg #E2E8EC  tint #9DAFBC
Energy       bg #E4EDE6  tint #9CC0A6
Gut          bg #E7EDE3  tint #A9BE94
Immunity     bg #E0EAEA  tint #95B4B0
Hormone      bg #E6E6EE  tint #A6A2C0
Skin & Hair  bg #E2ECEC  tint #93B4B0
Targeted     bg #E4E8EC  tint #9AAAB8
```
Each map entry: { bg, tint, tintStrong (a darker tint for 16px chips), ink, label }.

## Step 2 — Goal -> default container
```ts
export const GOAL_DEFAULT_FAMILY: Record<Goal, Family> = {
  'Daily':'capsule','Sleep & Calm':'capsule','Energy':'capsule','Gut':'capsule',
  'Immunity':'capsule','Hormone':'capsule','Skin & Hair':'capsule','Targeted':'capsule',
};
// default icon = DEFAULT_ICON['capsule'] = 'capsule-1'; pill bottle one tap away.
```

## Step 3 — Add/Edit form handles wellness (app/add-product.tsx)

The form currently builds beauty products (type 'beauty', role, container).
Make it type-aware:

1. At the top of the form, a TYPE toggle: Beauty | Wellness. Default Beauty.
   (If the user tapped Add from the Wellness tab, default to Wellness.)
2. When type === 'wellness':
   - Replace the ROLE pills with GOAL pills (the 8 goals).
   - Keep CONTAINER (same family picker; default to capsule).
   - Keep TIMING.
   - Show an optional DOSAGE text field (e.g. "1 capsule", "400mg").
   - Keep Brand, Product, Notes.
3. On save for wellness:
   ```ts
   const product: Product = {
     id, brand, name, type:'wellness',
     goal, icon, timing,
     dosage: dosage.trim() || undefined,
     notes: notes.trim() || undefined,
   };
   ```
   Beauty save path unchanged (role instead of goal, no dosage).
   canSave for wellness = brand && name && goal && icon && timing.

## Step 4 — Carousel / card / detail read goal for wellness

Anywhere that currently does ROLE[product.role] for the color/label/tag:
- if product.type === 'wellness' → use GOAL[product.goal]
- else → ROLE[product.role]
Make a small helper:
```ts
function styleFor(p: Product) {
  return p.type === 'wellness' ? GOAL[p.goal!] : ROLE[p.role!];
}
```
Use styleFor in ProductCard, ProductDetailSheet, the picker, and the carousel
header. The Wellness tab filters type==='wellness' (already does).
Detail sheet: for wellness show Goal, Dosage (if set), Timing. Keep the
"Not medical advice…" disclaimer for wellness (already present).

## Step 5 — Dosage never shared

In RoutineCard.tsx (the share card) dosage is already omitted — confirm no
dosage is rendered. Wellness steps on a shared card show name + timing only.

## Step 6 — Private items excludable from share (light touch)
Suppository and intimate items are sensitive. For now: no special handling
needed beyond dosage omission, BUT do not auto-include wellness dosage or any
future "private" flag in shares. (Full per-item share toggle is a later build.)

---

## Verify
1. `npx expo start -c`, then `r`.
2. Wellness tab → Add → form defaults to Wellness → pick a Goal (colors show),
   container defaults to capsule (pill bottle & gummy selectable), set timing,
   optional dosage, save.
3. Wellness carousel shows the product in its goal color with the capsule icon.
4. Detail sheet shows Goal / Dosage / Timing + disclaimer.
5. Build a routine with a wellness product, share it → dosage is absent on the card.
6. Beauty still works exactly as before (role, no dosage).

Commit:
```
git add -A && git commit -m "Wellness cabinet: goal taxonomy + wellness add form"
```

## Notes
- containerIcons.ts is REPLACED (25 icons now). Beauty icons unchanged; 4 new
  ones added (bottle-6 pill bottle, gummy, suppository, patch).
- Goal is to wellness what role is to beauty. Same machinery, different axis.
