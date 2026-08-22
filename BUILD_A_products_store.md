# Dodam — Build A: Products Store + Add Card + Add Form

Turns products from a frozen hardcoded array into a real, persisted, editable
store. Adds the "Add product" card to the carousel and the add-product form.
This is the build that makes the cabinet real.

Depends on: the role taxonomy build (Role type, ROLE map) and the container
icon build (containerIcons.ts, Silhouette) already being in place.

## File included
- `productStore.ts` → put at project root next to `storage.ts`.

---

## Step 1 — Product type (types.ts)
Make brand + role + container + timing first-class. Beauty products are the
focus; keep wellness fields working.

```ts
import type { IconId } from './data/containerIcons';
import type { Role } from './types'; // Role already added by the role build

export type Product = {
  id: string;
  brand: string;          // REQUIRED now (was optional)
  name: string;           // product name, REQUIRED
  type: 'beauty' | 'wellness';
  role?: Role;            // beauty: required in the form; wellness may omit
  icon?: IconId;          // container icon id, e.g. 'dropper-1'
  timing: Frequency;      // reuse existing Frequency: 'AM'|'PM'|'AM+PM'|'weekly'|'as-needed'
  notes?: string;         // optional, max 300 chars (enforced in the form)

  // keep existing optional fields for wellness + later builds:
  category?: CategoryKey; // wellness still uses this
  concerns?: Concern[];
  frequency?: Frequency;  // legacy; timing is the new canonical field
  status?: 'have' | 'want';
  dosage?: string;
  photoUri?: string;
  buyUrl?: string;
  priceNote?: string;
};
```
Note: if `frequency` is used elsewhere, keep it; `timing` is the new field the
form writes. They can coexist; prefer `timing` going forward.

## Step 2 — Place the store
`productStore.ts` is provided. It mirrors storage.ts (load/save/upsert/delete)
and uses key `@chokchok:products`. `SEED_SAMPLES = false` → fresh installs start
empty. Do not change the key.

## Step 3 — Cabinet screen reads the store (index.tsx)
Replace the direct SAMPLE_PRODUCTS import with store state.

```ts
import { loadProducts } from '../productStore';
import { useFocusEffect } from 'expo-router';
// ...
const [products, setProducts] = useState<Product[]>([]);
useFocusEffect(
  React.useCallback(() => {
    loadProducts().then(setProducts);
  }, [])
);
```
Filter by the All/Beauty/Wellness tab as before, but from `products` (store),
not SAMPLE_PRODUCTS. Using useFocusEffect means the carousel refreshes when you
return from adding a product.

## Step 4 — Add card leads the carousel
The carousel should always show an "Add product" card FIRST, then the user's
products. Two options — pick the simplest for the current ProductRing:

Simplest: render the Add card as a special first item. In the ring's data, prepend
a sentinel (e.g. { id: '__add__' }) and in the item renderer, if id === '__add__',
draw the Add card (dashed border, centered +, "Add product" / "Start your cabinet",
no role color) and onPress → router.push('/add-product'). Otherwise render the
normal ProductCard.

If prepending into ProductRing is awkward, instead place a persistent Add card
to the LEFT of the ring, or a floating + button — but the design intent is the
Add card as the first carousel card, and it doubles as the empty state (when the
user has 0 products, the carousel shows only the Add card).

Add card style: dashed border #C3B7AE, rounded 20, transparent fill, a soft
circle (#E4DAD2) with a + (color #8A7D75), label "Add product" (ink), subtitle
"Start your cabinet" (sub). Same card dimensions as ProductCard.

## Step 5 — Add form screen (app/add-product.tsx)
New route. Header "Add product" with a Save action (like the routine builder).
Fields, in order:

1. BRAND — TextInput, required
2. PRODUCT — TextInput, required
3. ROLE — row of 8 pills from the ROLE map (Remove/Cleanse/Exfoliate/Prep/
   Treat/Seal/Protect/Targeted). Required. Selected pill uses that role's bg/ink.
4. CONTAINER — the family picker:
   - Show the 8 families (FAMILIES from containerIcons.ts), each rendered with
     <Silhouette icon={DEFAULT_ICON[family]} color={roleTint} size={44} /> in a tile.
   - Tap a family → set product.icon = DEFAULT_ICON[family].
   - (Variant "tap again to pick exact shape" refinement is Build B — for now,
     selecting a family sets its default icon. That's enough for Build A.)
   Required.
5. TIMING — pills: AM / PM / AM+PM / Weekly / As-needed. Required.
6. NOTES — multiline TextInput, optional. maxLength={300}. Show a live counter
   "n/300". Input stops at 300 (maxLength handles it).

Save logic:
```ts
const canSave = brand.trim() && name.trim() && role && icon && timing;
const onSave = async () => {
  if (!canSave) return; // optionally show which field is missing
  const product: Product = {
    id: String(Date.now()),
    brand: brand.trim(),
    name: name.trim(),
    type: 'beauty',
    role,
    icon,
    timing,
    notes: notes.trim() || undefined,
  };
  await upsertProduct(product);
  router.back();
};
```
Import: `import { upsertProduct } from '../productStore';`
Disable/grey the Save action until canSave is true.

## Step 6 — Routines picker reads the store too (routines.tsx)
The "Choose a product" picker currently maps SAMPLE_PRODUCTS. Change it to load
from the store:
```ts
const [products, setProducts] = useState<Product[]>([]);
useEffect(() => { loadProducts().then(setProducts); }, []);
// use `products` wherever SAMPLE_PRODUCTS was used, incl. productById()
```
So routines can reference the user's real cabinet, not the samples.

---

## Verify
1. `npx expo start -c`, then `r`.
2. First launch: carousel shows ONLY the Add card (empty cabinet).
3. Tap Add card → form opens. Fill brand, product, role, container, timing.
   Save is disabled until all five are set.
4. Save → returns to carousel, new product appears after the Add card.
5. Force-quit and reopen the app → the product is still there (persisted).
6. Routines → Add product picker shows your added product.

Commit:
```
git add -A && git commit -m "Build A: products store + add card + add form"
```

## Notes
- Samples are NOT deleted — they live in data/sampleProducts.ts behind
  SEED_SAMPLES=false. Flip to true to seed for testing.
- Edit, delete, autocomplete, and optional fields (concern/actives/price) are
  Build B. Build A intentionally ships the minimum that makes the cabinet real.
- brand is now required — if any code assumed brand could be missing, it still
  renders fine (it's a string now).
