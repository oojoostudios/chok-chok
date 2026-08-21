# Dodam — Build Guide: Product Silhouettes

Replace the single hardcoded rounded-rectangle "bottle" with nine line-art
container silhouettes, chosen per product by a new `form` field. One shared
`<Silhouette>` component, wired into all four places a product shape is drawn.

**The nine forms (this order):** dropper, pump, cream jar, tube, capsule,
gummy, supplement, spray, air pump.

**What this changes visually:** every product currently renders the same tinted
rounded rectangle. After this, a serum shows a dropper, a vitamin shows a
capsule, a moisturizer shows a cream jar, etc. Color still comes from `category`
(unchanged). The silhouette is the stroke, colored per context.

**What this does NOT change:** color system, taxonomy, storage, routines. Only shape.

---

## Prereqs

```
npx expo install react-native-svg
```
(Use `npx expo install`, not `npm install`.)

---

## Step 1 — Add the `form` field to the Product type

In `types.ts`:

```ts
export type Form =
  | 'dropper' | 'pump' | 'creamjar' | 'tube' | 'capsule'
  | 'gummy' | 'supp' | 'spray' | 'airpump';

export type Product = {
  id: string;
  name: string;
  brand?: string;
  type: 'beauty' | 'wellness';
  category: CategoryKey;
  form?: Form;              // NEW — drives the silhouette. Optional; defaults from category.
  concerns: Concern[];
  frequency: Frequency;
  status: 'have' | 'want';
  dosage?: string;
  photoUri?: string;
  buyUrl?: string;
  priceNote?: string;
  notes?: string;
};
```

`form` is optional; when unset it derives from `category` (Step 3), so existing
products keep working with zero edits.

---

## Step 2 — Create the Silhouette component

New file: `components/Silhouette.tsx`. All nine share viewBox `0 0 100 150`.
`stroke` is a prop (category tint on carousel, white on a share card).

```tsx
import React from 'react';
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg';
import type { Form } from '../types';

const SHAPES: Record<Form, React.ReactNode> = {
  dropper: (<>
    <Path d="M43 31 C43 22 57 22 57 31 C57 37 53 41 50 42 C47 41 43 37 43 31 Z" />
    <Rect x="43" y="42" width="14" height="11" rx="1.5" />
    <Path d="M40 53 L40 120 Q40 130 50 130 Q60 130 60 120 L60 53 Z" />
  </>),
  pump: (<>
    <Path d="M36 62 C36 51 42 47 50 47 C58 47 64 51 64 62 L64 120 Q64 130 54 130 L46 130 Q36 130 36 120 Z" />
    <Rect x="44" y="37" width="12" height="10" rx="1" />
    <Rect x="42" y="30" width="16" height="7" rx="2" />
    <Line x1="47" y1="30" x2="47" y2="37" /><Line x1="53" y1="30" x2="53" y2="37" />
    <Path d="M50 30 L50 25 Q50 23 53 23 L76 23 Q80 23 78 27 L73 31" />
  </>),
  creamjar: (<>
    <Path d="M30 68 L30 116 Q30 124 38 124 L62 124 Q70 124 70 116 L70 68 Z" />
    <Path d="M27 56 Q27 54 29 54 L71 54 Q73 54 73 56 L73 68 Q73 70 71 70 L29 70 Q27 70 27 68 Z" />
    <Line x1="29" y1="62" x2="71" y2="62" />
  </>),
  tube: (<>
    <Rect x="43" y="22" width="14" height="11" rx="2" />
    <Path d="M42 33 C42 55 39 92 40 116 Q40 122 46 122 L54 122 Q60 122 60 116 C61 92 58 55 58 33 Z" />
    <Circle cx="50" cy="118" r="3.2" />
  </>),
  capsule: (<>
    <Rect x="26" y="60" width="48" height="30" rx="15" />
    <Line x1="46" y1="60" x2="46" y2="90" />
  </>),
  gummy: (<>
    <Rect x="41" y="30" width="18" height="10" rx="2" />
    <Line x1="45" y1="30" x2="45" y2="40" /><Line x1="55" y1="30" x2="55" y2="40" />
    <Path d="M34 56 C34 44 42 40 50 40 C58 40 66 44 66 56 L66 120 Q66 130 56 130 L44 130 Q34 130 34 120 Z" />
  </>),
  supp: (<>
    <Rect x="37" y="30" width="26" height="15" rx="2" />
    <Line x1="42" y1="30" x2="42" y2="45" /><Line x1="58" y1="30" x2="58" y2="45" />
    <Path d="M34 45 L66 45 L66 122 Q66 130 58 130 L42 130 Q34 130 34 122 Z" />
    <Line x1="34" y1="51" x2="66" y2="51" />
  </>),
  spray: (<>
    <Rect x="44" y="21" width="12" height="13" rx="1" />
    <Line x1="47" y1="25" x2="53" y2="25" />
    <Circle cx="50" cy="30" r="1.4" />
    <Rect x="46" y="34" width="8" height="8" />
    <Path d="M40 42 L40 122 Q40 130 48 130 L52 130 Q60 130 60 122 L60 42 Z" />
  </>),
  airpump: (<>
    <Path d="M42 30 L58 25 Q62 24 62 29 L62 40 L42 40 Z" />
    <Rect x="44" y="40" width="12" height="8" />
    <Path d="M36 60 C36 50 42 48 50 48 C58 48 64 50 64 60 L64 120 Q64 130 54 130 L46 130 Q36 130 36 120 Z" />
  </>),
};

export default function Silhouette({
  form, color, width = 46, height = 69, strokeWidth = 1.7,
}: {
  form: Form; color: string; width?: number; height?: number; strokeWidth?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 150"
      fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinejoin="round" strokeLinecap="round">
      {SHAPES[form]}
    </Svg>
  );
}
```

**Small-size stroke:** at tiny sizes (the 16px routine chip) bump `strokeWidth`
to ~3 so the line stays visible. The prop exists for this.

---

## Step 3 — Category → default form map

New file: `data/formDefaults.ts`.

```ts
import type { CategoryKey } from '../theme';
import type { Form } from '../types';

export const DEFAULT_FORM: Record<CategoryKey, Form> = {
  cleanser:    'pump',
  toner:       'spray',
  essence:     'dropper',
  serum:       'dropper',
  moisturizer: 'creamjar',
  spf:         'tube',
  treatment:   'dropper',
  mask:        'creamjar',
  eye:         'tube',
  lip:         'tube',
  other:       'creamjar',
  supplement:  'supp',
  vitamin:     'capsule',
  mineral:     'capsule',
};

export function formFor(product: { form?: Form; category: CategoryKey }): Form {
  return product.form ?? DEFAULT_FORM[product.category] ?? 'creamjar';
}
```

---

## Step 4 — Wire into all FOUR render spots

Import at the top of each file (adjust relative path):

```ts
import Silhouette from '../components/Silhouette';
import { formFor } from '../data/formDefaults';
```

### 4a. `components/ProductCard.tsx`
Replace the fallback bottle View; keep the `photoUri` branch:

```tsx
{product.photoUri ? (
  <Image source={{ uri: product.photoUri }} style={styles.image} resizeMode="contain" />
) : (
  <Silhouette form={formFor(product)} color={cat.tint} width={64} height={96} />
)}
```
Delete the unused `bottle` style.

### 4b. `components/ProductDetailSheet.tsx`
Inside `styles.thumb`:

```tsx
<View style={[styles.thumb, { backgroundColor: cat.bg }]}>
  <Silhouette form={formFor(product)} color={cat.tint} width={34} height={51} />
</View>
```
Delete the `bottle` style.

### 4c. `app/routines.tsx` — filled step chip (small → strokeWidth 3)

```tsx
<Silhouette form={formFor(product)} color={cat.ink} width={16} height={24} strokeWidth={3} />
```

### 4d. `app/routines.tsx` — picker thumbnail

```tsx
<View style={[styles.pickThumb, { backgroundColor: cat.bg }]}>
  <Silhouette form={formFor(p)} color={cat.tint} width={28} height={42} />
</View>
```
Delete the `chipBottle` style once both routines.tsx usages are replaced.

---

## Step 5 — (Optional) add `form` to sample data

Defaults already give good shapes from category. Override only where you want a
specific one, e.g. a serum in a pump bottle: `form: 'pump'`.

Valid form values: `dropper, pump, creamjar, tube, capsule, gummy, supp, spray, airpump`.

---

## Verify

1. `npx expo start -c`, then `r`.
2. Carousel: each product shows a container shape in its category tint.
3. Detail sheet, routine chip, picker: same shapes.
4. Any faint small shape → raise its `strokeWidth`.

```
git add -A && git commit -m "Add line-art product silhouettes (form field + Silhouette component)"
```

---

## Later (not this build)
- Add-product form should show a **Form picker**, pre-filled with
  `DEFAULT_FORM[category]`, overridable.
- Refine shapes anytime by editing path data in `Silhouette.tsx`.
- Monochrome share card: pass `color="#FFFFFF"` (or ink) instead of `cat.tint`.
