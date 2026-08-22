import type { CategoryKey } from './theme';
import type { IconId } from './data/containerIcons';

export type Concern =
  | 'hydration' | 'acne' | 'brightening' | 'anti-aging'
  | 'texture' | 'redness' | 'pores' | 'barrier' | 'other';

export type Frequency = 'AM' | 'PM' | 'AM+PM' | 'weekly' | 'as-needed';

// Beauty taxonomy: what a product DOES in a routine, not what it is.
export type Role =
  | 'Remove' | 'Cleanse' | 'Exfoliate' | 'Prep'
  | 'Treat' | 'Seal' | 'Protect' | 'Targeted';

export type Form =
  | 'dropper' | 'pump' | 'creamjar' | 'tube' | 'capsule'
  | 'gummy' | 'supp' | 'spray' | 'airpump';

export type Product = {
  id: string;
  brand: string;            // REQUIRED
  name: string;             // REQUIRED
  type: 'beauty' | 'wellness';
  role?: Role;              // beauty: required in the form; wellness may omit
  icon?: IconId;            // container icon id, e.g. 'dropper-1'
  timing: Frequency;        // canonical timing field the form writes
  notes?: string;           // max 300 chars (enforced in the form)

  // Kept for wellness + later builds:
  category?: CategoryKey;   // wellness taxonomy; also drives icon defaults
  form?: Form;              // legacy form hint
  concerns?: Concern[];
  frequency?: Frequency;    // legacy; prefer `timing`
  status?: 'have' | 'want';
  dosage?: string;
  photoUri?: string;
  buyUrl?: string;
  priceNote?: string;
};

export type RoutineStep = { label: string; productId?: string };

export type Routine = {
  id: string;
  name: string;
  kind: 'AM' | 'PM' | 'custom';
  steps: RoutineStep[];
  dateCreated: string;
};
