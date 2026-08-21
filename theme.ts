import type { Role } from './types';

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

// Beauty products read from ROLE; wellness stays on CATEGORY above.
export const ROLE: Record<Role, CatStyle> = {
  Remove:    { bg: '#EDE4DE', tint: '#B7A79C', tintStrong: '#6E4E38', ink: '#6E4E38', label: 'Remove' },
  Cleanse:   { bg: '#E4EBE2', tint: '#9DB29A', tintStrong: '#4A5A46', ink: '#4A5A46', label: 'Cleanse' },
  Exfoliate: { bg: '#F3E4DA', tint: '#D0A98F', tintStrong: '#8A5238', ink: '#8A5238', label: 'Exfoliate' },
  Prep:      { bg: '#E4EEEC', tint: '#93B0AA', tintStrong: '#3F5E58', ink: '#3F5E58', label: 'Prep' },
  Treat:     { bg: '#F3E2DA', tint: '#C89B84', tintStrong: '#8A5238', ink: '#8A5238', label: 'Treat' },
  Seal:      { bg: '#F3E1E8', tint: '#C99DB0', tintStrong: '#8A4B60', ink: '#8A4B60', label: 'Seal' },
  Protect:   { bg: '#F5EAD6', tint: '#CBAE79', tintStrong: '#7A5A1E', ink: '#7A5A1E', label: 'Protect' },
  Targeted:  { bg: '#EDE7F1', tint: '#B3A6C2', tintStrong: '#5B4A72', ink: '#5B4A72', label: 'Targeted' },
};

// The one place that decides which taxonomy a product reads from.
export function styleFor(product: { type: 'beauty' | 'wellness'; role?: Role; category: CategoryKey }): CatStyle {
  if (product.type === 'beauty' && product.role) return ROLE[product.role];
  return CATEGORY[product.category] ?? CATEGORY.other;
}
