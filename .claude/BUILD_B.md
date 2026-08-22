# Dodam — Build B: Routine view + Share image + Edit/Delete + Buy-search

Four things. The routine card renderer is the big one. Depends on: role
taxonomy, container icons, and products store (Build A) all being in place.

## File included
- `RoutineCard.tsx` → put in `components/`. Read-only finished display of a
  routine; reused for both viewing and image capture.

## Prereqs (install both)
```
npx expo install react-native-view-shot
npx expo install expo-sharing
```

---

## PART 1 — Routine card view (the "finished" screen)

Right now tapping a saved routine opens the BUILDER (edit mode). Add a VIEW
mode that shows the finished RoutineCard first, with Edit and Share actions.

In `app/routines.tsx`:
1. Add a third mode: `mode: 'list' | 'view' | 'builder'`.
2. Tapping a saved routine (openSaved) should go to `'view'`, not `'builder'`.
3. The view screen shows:
   - top bar: back button, routine name, and an "Edit" action (top right)
   - <RoutineCard routine={draft} products={products} /> (load products from
     the store via loadProducts — the picker already needs this)
   - below the card: a "Share" button (see PART 2)
4. "Edit" from the view switches mode to 'builder' (the existing builder UI).
5. Preset routines (from the presets list) can open straight into 'builder'
   as they do now, since they have no products yet — OR open into 'view' which
   will show empty "—" steps. Either is fine; view is more consistent.

Import RoutineCard and loadProducts at the top:
```ts
import RoutineCard from '../components/RoutineCard';
import { loadProducts } from '../productStore';
```
Load products in the view (and picker) with useEffect/useFocusEffect.

## PART 2 — Share as image

On the routine VIEW screen, wrap the RoutineCard in a ViewShot ref and add a
Share button that captures it and opens the share sheet.

```tsx
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useRef } from 'react';

const shotRef = useRef<ViewShot>(null);

const onShare = async () => {
  try {
    const uri = await shotRef.current?.capture?.();
    if (uri && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(uri);
    }
  } catch (e) {
    // no-op; optionally show a toast
  }
};
```

Render (note forShare so it uses the fixed capture width):
```tsx
<ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }}>
  <RoutineCard routine={draft} products={products} forShare />
</ViewShot>
// ...
<Pressable style={styles.shareBtn} onPress={onShare}>
  <Text style={styles.shareBtnText}>Share routine</Text>
</Pressable>
```
The captured image is the RoutineCard exactly as shown — steps, silhouettes,
names, brands, timing, the Dodam wordmark, and (if any wellness step) the
disclaimer. Wellness dosage is intentionally NOT rendered on the card.

## PART 3 — Edit + Delete on a product

The product detail sheet (ProductDetailSheet.tsx) currently shows Buy + share
and no way to edit/delete. Add:

1. EDIT: an "Edit" action (e.g. a pencil or text button in the sheet header).
   On tap: close the sheet and navigate to the add-product form in EDIT mode,
   passing the product id. The add form should, if given an existing id,
   pre-fill all fields and upsert (not create) on Save. Reuse app/add-product.tsx:
   - Read an optional route param `id`.
   - If id present, load that product from the store, pre-fill state, and on
     Save call upsertProduct with the same id (edits in place).
   - Header title: "Edit product" when editing, "Add product" when new.

2. DELETE: a "Delete" action in the detail sheet (subtle, e.g. small red text).
   On tap: confirm (Alert.alert with Cancel/Delete), then:
   ```ts
   import { deleteProduct } from '../productStore';
   await deleteProduct(product.id);
   ```
   Close the sheet and refresh the carousel (the cabinet screen's
   useFocusEffect will reload on return, or call a passed onDeleted callback).

## PART 4 — Buy button → search link

In ProductDetailSheet.tsx, the Buy button currently does nothing useful.
Change it to open a web search for the product (brand + name), so the friend
can find it and choose where/price themselves. No live pricing.

```ts
import { Linking } from 'react-native';

const onBuy = () => {
  const q = encodeURIComponent(`${product.brand} ${product.name}`.trim());
  Linking.openURL(`https://www.google.com/search?q=${q}`);
};
```
Relabel the button "Find it" (or keep "Buy") — it now opens a search, not a
store. If a product has an explicit buyUrl set, prefer that:
```ts
const onBuy = () => {
  if (product.buyUrl) return Linking.openURL(product.buyUrl);
  const q = encodeURIComponent(`${product.brand} ${product.name}`.trim());
  Linking.openURL(`https://www.google.com/search?q=${q}`);
};
```

---

## Verify
1. `npx expo start -c`, then `r`.
2. Routines → tap a saved routine → see the finished RoutineCard (not the
   editor). Steps show silhouette + name + brand + timing.
3. Tap "Share routine" → the share sheet opens with a PNG of the card.
   Send it to yourself; confirm it looks right and wellness dosage is absent.
4. Tap a product → detail sheet → Edit opens the form pre-filled; Save updates
   the same product. Delete asks to confirm, then removes it from the cabinet.
5. Detail sheet → Buy/Find it opens a web search for "<brand> <name>".

Commit:
```
git add -A && git commit -m "Build B: routine view + share + edit/delete + search buy"
```

## Notes
- Importable sharing (friend opens your routine INTO their app) is deferred
  until the app is distributed via TestFlight — friends can't install yet.
  The image share here is the shareable artifact for now, and RoutineCard is
  the exact layout the importable version will reuse later.
- If capture produces a cut-off image, ensure the ViewShot wraps only the
  RoutineCard (not a scroll view) and the card uses the forShare fixed width.
