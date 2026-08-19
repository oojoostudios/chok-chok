import type { CategoryKey } from './theme';

export type Concern =
  | 'hydration' | 'acne' | 'brightening' | 'anti-aging'
  | 'texture' | 'redness' | 'pores' | 'barrier' | 'other';

export type Frequency = 'AM' | 'PM' | 'AM+PM' | 'weekly' | 'as-needed';

export type Product = {
  id: string;
  name: string;
  brand?: string;
  category: CategoryKey;
  concerns: Concern[];
  frequency: Frequency;
  status: 'have' | 'want';
  photoUri?: string;
  buyUrl?: string;
  priceNote?: string;
  notes?: string;
};
