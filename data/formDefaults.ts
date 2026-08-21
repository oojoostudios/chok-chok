import type { CategoryKey } from '../theme';
import type { Form } from '../types';
import { DEFAULT_ICON, type Family, type IconId } from './containerIcons';

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

// A product with no icon of its own still shows something on-brand.
export const CATEGORY_DEFAULT_FAMILY: Record<CategoryKey, Family> = {
  cleanser:    'bottle',
  toner:       'spray',
  essence:     'dropper',
  serum:       'dropper',
  moisturizer: 'pot',
  spf:         'tube',
  treatment:   'dropper',
  mask:        'sachet',
  eye:         'tube',
  lip:         'tube',
  other:       'bottle',
  supplement:  'capsule',
  vitamin:     'capsule',
  mineral:     'capsule',
};

export function iconFor(product: { icon?: IconId; category: CategoryKey }): IconId {
  if (product.icon) return product.icon;
  const family = CATEGORY_DEFAULT_FAMILY[product.category];
  return family ? DEFAULT_ICON[family] : 'bottle-1';
}
