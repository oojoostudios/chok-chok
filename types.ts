import type { CategoryKey } from './theme';
import type { IconId } from './data/containerIcons';

export type Concern =
  | 'hydration' | 'acne' | 'brightening' | 'anti-aging'
  | 'texture' | 'redness' | 'pores' | 'barrier' | 'other';

export type Frequency = 'AM' | 'PM' | 'AM+PM' | 'weekly' | 'as-needed';

export type Form =
  | 'dropper' | 'pump' | 'creamjar' | 'tube' | 'capsule'
  | 'gummy' | 'supp' | 'spray' | 'airpump';

export type Product = {
  id: string;
  name: string;
  brand?: string;
  type: 'beauty' | 'wellness';
  category: CategoryKey;
  form?: Form;              // legacy form hint. Optional; defaults from category.
  icon?: IconId;            // container icon, e.g. 'bottle-3'. Defaults from category.
  concerns: Concern[];
  frequency: Frequency;
  status: 'have' | 'want';
  dosage?: string;
  photoUri?: string;
  buyUrl?: string;
  priceNote?: string;
  notes?: string;
};

export type RoutineStep = { label: string; productId?: string };

export type Routine = {
  id: string;
  name: string;
  kind: 'AM' | 'PM' | 'custom';
  steps: RoutineStep[];
  dateCreated: string;
};
