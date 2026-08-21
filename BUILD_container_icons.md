# Dodam — Build Guide: Container Icons (family + variant picker)

Replaces the old drawn silhouettes with 21 filled container icons across 8
families. Each product stores a specific icon id (e.g. "bottle-3"); the card
shows that icon, tinted with the muted role color. When adding/editing a
product the user picks a family, gets the family default, and can tap to swap
to another variant in that family.

## Files included in this folder
- `containerIcons.ts`  → the icon path data + family map. Put in `data/`.
- `Silhouette.tsx`      → the render component. Put in `components/`.

## Placement
1. Move `containerIcons.ts` to `data/containerIcons.ts`.
2. Move `Silhouette.tsx` to `components/Silhouette.tsx` (OVERWRITE the old one).

## Prereq
`react-native-svg` is already installed from the previous build. If not:
`npx expo install react-native-svg`

---

## Step 1 — Product type (types.ts)
Add an icon field. Keep existing fields.

```ts
import type { IconId } from './data/containerIcons';

export type Product = {
  // ...existing fields...
  icon?: IconId;   // NEW: specific container icon, e.g. 'bottle-3'
  // form?: string; // if a `form` text field exists, keep it; icon is separate
};
```

## Step 2 — Muted role tints (theme.ts)
Update the ROLE map so the silhouette color (`tint`) is the MUTED value, not
the dark saturated one. Backgrounds (`bg`) stay. Example muted tints:

```
Remove   bg #EDE4DE  tint #B7A79C  ink #6E4E38
Cleanse  bg #E4EBE2  tint #9DB29A  ink #4A5A46
Exfoliate bg #F3E4DA tint #D0A98F  ink #8A5238
Prep     bg #E4EEEC  tint #93B0AA  ink #3F5E58
Treat    bg #F3E2DA  tint #C89B84  ink #8A5238
Seal     bg #F3E1E8  tint #C99DB0  ink #8A4B60
Protect  bg #F5EAD6  tint #CBAE79  ink #7A5A1E
Targeted bg #EDE7F1  tint #B3A6C2  ink #5B4A72
```

Add a slightly STRONGER tint for tiny (16px chip) contexts so the icon doesn't
fade — one step darker than `tint`:

```
tintStrong per role ≈ the old darker value (#8A5238 etc). Add as ROLE[x].tintStrong.
```

## Step 3 — Render the icon everywhere (4 spots)
Import in each file:
```ts
import Silhouette from '../components/Silhouette';
import { familyOf } from '../data/containerIcons';
```

Pick the icon: `product.icon` if set, else the family default from the product's
role (map role -> a default family, see Step 5), else 'bottle-1'.

- **ProductCard** (carousel): `<Silhouette icon={product.icon} color={roleStyle.tint} size={64} />`
- **ProductDetailSheet** thumbnail: `<Silhouette icon={product.icon} color={roleStyle.tint} size={40} />`
- **routines.tsx step chip** (small): use `roleStyle.tintStrong` and `size={18}`:
  `<Silhouette icon={product.icon} color={roleStyle.tintStrong} size={18} />`
- **routines.tsx picker** row: `<Silhouette icon={p.icon} color={roleStyle.tint} size={28} />`

(For wellness products that still use category, keep their existing color lookup;
just render Silhouette with a sensible default icon like 'capsule-1' for supplements.)

## Step 4 — The family + variant picker (add / edit product)
When choosing the container for a product:

1. Show the 8 FAMILIES (from `containerIcons.ts`) as a grid. Each shows its
   default icon (DEFAULT_ICON[family]) tinted in the role color.
2. On tapping a family, set `product.icon = DEFAULT_ICON[family]`.
3. If that family has more than one variant, show the variants row
   (FAMILIES[i].variants) so the user can tap to swap. Selecting sets
   `product.icon` to that variant id. Mark the selected one.

Minimal data to drive it is already exported:
```ts
import { FAMILIES, DEFAULT_ICON, type IconId, type Family } from '../data/containerIcons';
// FAMILIES: [{ family, label, variants: [{id, label}] }]
```

The picker should render each option as:
`<Silhouette icon={variant.id} color={tint} size={44} />` inside a tappable tile,
highlighting the currently selected `product.icon`.

## Step 5 — Role -> default family (so new products get a sensible icon)
Add a small map so a product with no icon still shows something on-brand:

```ts
export const ROLE_DEFAULT_FAMILY = {
  Remove: 'bottle', Cleanse: 'bottle', Exfoliate: 'dropper', Prep: 'spray',
  Treat: 'dropper', Seal: 'pot', Protect: 'tube', Targeted: 'tube',
} as const;
// icon fallback = DEFAULT_ICON[ROLE_DEFAULT_FAMILY[product.role]]
```

## Step 6 — Sample data (optional)
Give the seed beauty products an icon so they show variety immediately:
```
Gel Cleanser    icon:'bottle-4'   (foaming pump)
Vitamin C Serum icon:'dropper-1'
Rich Moisturizer icon:'pot-4'     (jar)
Niacinamide 10% icon:'dropper-1'
Daily SPF 50    icon:'tube-3'     (SPF tube)
Lip Butter Balm icon:'compact-1'  (or 'pot-1')
```

---

## Verify
1. `npx expo start -c`, then `r`.
2. Carousel shows the container icons in muted role tints.
3. Detail sheet + routine chip + picker show the same icon.
4. Add/edit a product → pick a family → swap variants → card updates.

Commit:
```
git add -A && git commit -m "Container icon system (families + variants, muted tints)"
```

## Notes
- Icons are filled shapes; color = the `fill` prop. No stroke width to tune.
- `familyOf('bottle-3')` returns 'bottle' if you ever need the family from an id.
- To refine any icon later, edit its path string in `data/containerIcons.ts`.
