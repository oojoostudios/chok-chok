import type { Goal, Role } from './types';

export const COLORS = {
  bg: '#EDE6E1',
  card: '#FBF8F6',
  ink: '#3A322E',
  sub: '#8A7D75',
  line: '#E3D9D2',
  chip: '#DCD2CB',
};

export type CategoryKey =
  | 'cleanser' | 'toner' | 'essence' | 'serum' | 'moisturizer'
  | 'spf' | 'treatment' | 'mask' | 'eye' | 'lip' | 'other'
  | 'supplement' | 'vitamin' | 'mineral';

// `tint` is the muted container-icon color used at normal sizes (card, sheet,
// picker). `tintStrong` is one step darker, for tiny contexts (16-18px chips)
// where the muted value would fade out.
type CatStyle = { bg: string; tint: string; tintStrong: string; ink: string; label: string };

export const CATEGORY: Record<CategoryKey, CatStyle> = {
  cleanser:    { bg: '#E4EBE2', tint: '#9DB29A', tintStrong: '#6E8469', ink: '#4A5A46', label: 'Cleanse' },
  toner:       { bg: '#EAF0EC', tint: '#93B0AA', tintStrong: '#63847E', ink: '#4A5A50', label: 'Tone' },
  essence:     { bg: '#EEF0E6', tint: '#AEB78C', tintStrong: '#7C8556', ink: '#5A5E3C', label: 'Essence' },
  serum:       { bg: '#F3E2DA', tint: '#C89B84', tintStrong: '#A66C4C', ink: '#8A5238', label: 'Brighten' },
  moisturizer: { bg: '#F3E1E8', tint: '#C99DB0', tintStrong: '#A96A83', ink: '#8A4B60', label: 'Moisturize' },
  spf:         { bg: '#F5EAD6', tint: '#CBAE79', tintStrong: '#A8873F', ink: '#7A5A1E', label: 'Protect' },
  treatment:   { bg: '#E1EAF3', tint: '#9DB0C8', tintStrong: '#6A88AC', ink: '#3F5E82', label: 'Treat' },
  mask:        { bg: '#EDE7F1', tint: '#B3A6C2', tintStrong: '#8A79A2', ink: '#5B4A72', label: 'Mask' },
  eye:         { bg: '#F0EAE2', tint: '#C0AC91', tintStrong: '#967C57', ink: '#6E5A3C', label: 'Eye' },
  lip:         { bg: '#EFE6E2', tint: '#C6A79C', tintStrong: '#9E7A6D', ink: '#6E5248', label: 'Lip' },
  other:       { bg: '#EAE5E0', tint: '#B7A79C', tintStrong: '#8B7A6E', ink: '#5A5048', label: 'Other' },
  supplement:  { bg: '#E7EEE4', tint: '#A5BA97', tintStrong: '#74905F', ink: '#4C5A42', label: 'Supplement' },
  vitamin:     { bg: '#F3EAD3', tint: '#D2BE87', tintStrong: '#A88F4C', ink: '#6E5A28', label: 'Vitamin' },
  mineral:     { bg: '#E5E9EC', tint: '#A6B4BC', tintStrong: '#718189', ink: '#465158', label: 'Mineral' },
};

// The two cabinets read by temperature: beauty is WARM (ROLE), wellness is
// COOL (GOAL). Same shape, opposite half of the wheel.
export const ROLE: Record<Role, CatStyle> = {
  Remove:    { bg: '#EAD9CC', tint: '#B08A6E', tintStrong: '#896C56', ink: '#6A5342', label: 'Remove' },
  Cleanse:   { bg: '#F0E7D6', tint: '#CBA875', tintStrong: '#9E835B', ink: '#766144', label: 'Cleanse' },
  Exfoliate: { bg: '#F3E2D2', tint: '#D6A074', tintStrong: '#A77D5A', ink: '#785A41', label: 'Exfoliate' },
  Prep:      { bg: '#EEE8DF', tint: '#C4AE98', tintStrong: '#958474', ink: '#6C6054', label: 'Prep' },
  Treat:     { bg: '#F3DED3', tint: '#D6926F', tintStrong: '#A77257', ink: '#76503D', label: 'Treat' },
  Seal:      { bg: '#F4DEE3', tint: '#D48EA0', tintStrong: '#A56F7D', ink: '#754E58', label: 'Seal' },
  Protect:   { bg: '#F5EAD2', tint: '#DDB56E', tintStrong: '#A88A54', ink: '#7A643D', label: 'Protect' },
  Targeted:  { bg: '#ECDAE0', tint: '#BE8CA0', tintStrong: '#946D7D', ink: '#694D58', label: 'Targeted' },
};

// Wellness products read from GOAL — what you're taking it for.
export const GOAL: Record<Goal, CatStyle> = {
  'Daily':        { bg: '#E6EBE2', tint: '#A7BA9A', tintStrong: '#7F8D75', ink: '#5C6655', label: 'Daily' },
  'Sleep & Calm': { bg: '#E2E8EC', tint: '#9DAFBC', tintStrong: '#77858F', ink: '#566067', label: 'Sleep & Calm' },
  'Energy':       { bg: '#E4EDE6', tint: '#9CC0A6', tintStrong: '#738E7B', ink: '#54685A', label: 'Energy' },
  'Gut':          { bg: '#E7EDE3', tint: '#A9BE94', tintStrong: '#7D8D6E', ink: '#5B6750', label: 'Gut' },
  'Immunity':     { bg: '#E0EAEA', tint: '#95B4B0', tintStrong: '#6E8582', ink: '#50615F', label: 'Immunity' },
  'Hormone':      { bg: '#E6E6EE', tint: '#A6A2C0', tintStrong: '#7B788E', ink: '#5A5768', label: 'Hormone' },
  'Skin & Hair':  { bg: '#E2ECEC', tint: '#93B4B0', tintStrong: '#6D8582', ink: '#4F615F', label: 'Skin & Hair' },
  'Targeted':     { bg: '#E4E8EC', tint: '#9AAAB8', tintStrong: '#727E88', ink: '#535C63', label: 'Targeted' },
};

// The one place that decides which taxonomy a product reads from.
// CATEGORY is the fallback for products saved before goal/role existed.
export function styleFor(
  product: { type: 'beauty' | 'wellness'; role?: Role; goal?: Goal; category?: CategoryKey }
): CatStyle {
  if (product.type === 'wellness' && product.goal) return GOAL[product.goal];
  if (product.type === 'beauty' && product.role) return ROLE[product.role];
  return (product.category ? CATEGORY[product.category] : undefined) ?? CATEGORY.other;
}
