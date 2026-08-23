# Dodam — Fixes: Required markers + Wellness brand list

Two changes.

## Files included
- `data/supplementBrands.ts` → NEW. The curated supplement brand list.
- `brandStore.ts` → REPLACE the existing one at project root. Now type-aware:
  allBrands('beauty') vs allBrands('wellness') pull from different curated lists;
  rememberBrand checks both; added brands stay shared.

## Change 1 — Required-field markers (app/add-product.tsx)

Brand and Product are required (Save already disabled without them) but nothing
signals it. Add markers and missing-field feedback.

1. Label the required fields with an asterisk:
   "BRAND *" and "PRODUCT *"  (use COLORS.ink for the text, and the * can be
   COLORS.sub or a soft accent). Role/Goal, Container, Timing are also required
   for a valid product — you may mark those too if you like, but Brand/Product
   are the priority.

2. When the user taps Save while it's disabled (or on a save attempt with
   missing required fields), briefly highlight the empty required fields — e.g.
   set a thin border in a warning tone (a muted terracotta like #C97A5A) on any
   required field left blank, so they see WHAT is missing. Clear the highlight
   once the field is filled.

   Simple approach: track a `showErrors` boolean set true on a failed save,
   and conditionally style each required field's border when showErrors && empty.

## Change 2 — Wellness uses supplement brands (app/add-product.tsx)

The brand autocomplete currently always pulls beauty brands. Make it follow the
product TYPE.

1. Import stays: `import { allBrands, matchBrands, rememberBrand } from '../brandStore';`
2. Reload the brand pool whenever the type toggle changes:
   ```ts
   useEffect(() => {
     allBrands(type === 'wellness' ? 'wellness' : 'beauty').then(setBrandPool);
   }, [type]);
   ```
   (Replaces the old one-time allBrands() call. `type` is the Beauty/Wellness
   toggle state from the wellness build.)
3. Everything else stays: matchBrands filters brandPool as they type;
   rememberBrand on save is unchanged (it checks both lists).

Now: adding a Beauty product suggests COSRX, Beauty of Joseon, etc.; adding a
Wellness product suggests Thorne, Ritual, Nordic Naturals, etc.

---

## Verify
1. `npx expo start -c`, then `r`.
2. Add product, Beauty: Brand and Product show "*". Tap Save empty → the empty
   required fields highlight.
3. Type "cos" in Brand (Beauty) → COSRX suggests.
4. Toggle to Wellness → type "thor" → Thorne suggests (not beauty brands).
5. Type a new supplement brand, save, add another wellness product, type it →
   it's remembered.

Commit:
```
git add -A && git commit -m "Required markers + wellness supplement brand list"
```

## Note
Only edit app/add-product.tsx. data/supplementBrands.ts and brandStore.ts are
provided — place them, don't recreate. data/brands.ts (beauty) is unchanged.
