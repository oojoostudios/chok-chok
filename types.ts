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

// Wellness taxonomy: what you're taking it FOR. Goal is to wellness what role
// is to beauty — same machinery, different axis.
export type Goal =
  | 'Daily' | 'Sleep & Calm' | 'Energy' | 'Gut'
  | 'Immunity' | 'Hormone' | 'Skin & Hair' | 'Targeted';

export type Form =
  | 'dropper' | 'pump' | 'creamjar' | 'tube' | 'capsule'
  | 'gummy' | 'supp' | 'spray' | 'airpump';

export type Product = {
  id: string;
  brand: string;            // REQUIRED
  name: string;             // REQUIRED
  type: 'beauty' | 'wellness';
  role?: Role;              // beauty: required in the form; wellness omits it
  goal?: Goal;              // wellness: required in the form; beauty omits it
  icon?: IconId;            // container icon id, e.g. 'dropper-1'
  timing: Frequency;        // canonical timing field the form writes
  dosage?: string;          // wellness: optional. NEVER rendered on a shared card.
  notes?: string;           // max 300 chars (enforced in the form)

  // Kept for older products + later builds:
  category?: CategoryKey;   // pre-goal wellness taxonomy; also drives icon defaults
  form?: Form;              // legacy form hint
  concerns?: Concern[];
  frequency?: Frequency;    // legacy; prefer `timing`
  status?: 'have' | 'want';
  photoUri?: string;
  buyUrl?: string;
  priceNote?: string;
};

// Beauty steps carry a role label ("Cleanse"); a wellness step is just a
// supplement, so the label is optional.
export type RoutineStep = { label?: string; productId?: string };

export type Routine = {
  id: string;
  name: string;
  // 'AM' | 'PM' | 'custom' are the beauty schedules this field has always
  // carried; 'wellness' marks the wellness cabinet. Anything that isn't
  // 'wellness' is a beauty routine, so routines saved before this existed
  // keep reading as beauty with no migration.
  kind: 'AM' | 'PM' | 'custom' | 'wellness';
  steps: RoutineStep[];
  dateCreated: string;
};
