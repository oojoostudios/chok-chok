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
