import AsyncStorage from '@react-native-async-storage/async-storage';
import { CURATED_BRANDS } from './data/brands';
import { SUPPLEMENT_BRANDS } from './data/supplementBrands';

const ADDED_BRANDS_KEY = '@chokchok:addedBrands';

type Kind = 'beauty' | 'wellness';

export async function loadAddedBrands(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(ADDED_BRANDS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

// Remember a typed brand not already known (checks BOTH curated lists + added).
export async function rememberBrand(brand: string): Promise<void> {
  const name = brand.trim();
  if (!name) return;
  const lower = name.toLowerCase();
  const known = [...CURATED_BRANDS, ...SUPPLEMENT_BRANDS];
  if (known.some((b) => b.toLowerCase() === lower)) return;
  const added = await loadAddedBrands();
  if (added.some((b) => b.toLowerCase() === lower)) return;
  added.push(name);
  try {
    await AsyncStorage.setItem(ADDED_BRANDS_KEY, JSON.stringify(added));
  } catch {}
}

// Merged, de-duped suggestion list for the given cabinet type.
// Beauty -> beauty curated + added. Wellness -> supplement curated + added.
export async function allBrands(kind: Kind = 'beauty'): Promise<string[]> {
  const added = await loadAddedBrands();
  const base = kind === 'wellness' ? SUPPLEMENT_BRANDS : CURATED_BRANDS;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const b of [...base, ...added]) {
    const k = b.toLowerCase();
    if (!seen.has(k)) { seen.add(k); out.push(b); }
  }
  return out.sort((a, b) => a.localeCompare(b));
}

export function matchBrands(query: string, brands: string[], limit = 6): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts = brands.filter((b) => b.toLowerCase().startsWith(q));
  const contains = brands.filter(
    (b) => !b.toLowerCase().startsWith(q) && b.toLowerCase().includes(q)
  );
  return [...starts, ...contains].slice(0, limit);
}
