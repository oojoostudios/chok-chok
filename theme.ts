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
  | 'spf' | 'treatment' | 'mask' | 'eye' | 'lip' | 'other';

type CatStyle = { bg: string; tint: string; ink: string; label: string };

export const CATEGORY: Record<CategoryKey, CatStyle> = {
  cleanser:    { bg: '#E4EBE2', tint: '#A9BDA6', ink: '#4A5A46', label: 'Cleanse' },
  toner:       { bg: '#EAF0EC', tint: '#AFC6B7', ink: '#4A5A50', label: 'Tone' },
  essence:     { bg: '#EEF0E6', tint: '#BBC199', ink: '#5A5E3C', label: 'Essence' },
  serum:       { bg: '#F3E2DA', tint: '#D8A184', ink: '#8A5238', label: 'Brighten' },
  moisturizer: { bg: '#F3E1E8', tint: '#D89AAE', ink: '#8A4B60', label: 'Moisturize' },
  spf:         { bg: '#F5EAD6', tint: '#E0B877', ink: '#7A5A1E', label: 'Protect' },
  treatment:   { bg: '#E1EAF3', tint: '#9DB6D2', ink: '#3F5E82', label: 'Treat' },
  mask:        { bg: '#EDE7F1', tint: '#B9A6CF', ink: '#5B4A72', label: 'Mask' },
  eye:         { bg: '#F0EAE2', tint: '#CBB79A', ink: '#6E5A3C', label: 'Eye' },
  lip:         { bg: '#EFE6E2', tint: '#C6A79C', ink: '#6E5248', label: 'Lip' },
  other:       { bg: '#EAE5E0', tint: '#BBB0A6', ink: '#5A5048', label: 'Other' },
};
