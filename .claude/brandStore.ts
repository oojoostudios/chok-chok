import AsyncStorage from '@react-native-async-storage/async-storage';
import { CURATED_BRANDS } from './data/brands';

const ADDED_BRANDS_KEY = '@chokchok:addedBrands';

// Load the user's own added brands (persisted).
export async function loadAddedBrands(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(ADDED_BRANDS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

// Remember a brand the user typed that isn't already known (case-insensitive).
export async function rememberBrand(brand: string): Promise<void> {
  const name = brand.trim();
  if (!name) return;
  const lower = name.toLowerCase();
  // already in curated list? do nothing
  if (CURATED_BRANDS.some((b) => b.toLowerCase() === lower)) return;
  const added = await loadAddedBrands();
  if (added.some((b) => b.toLowerCase() === lower)) return;
  added.push(name);
  try {
    await AsyncStorage.setItem(ADDED_BRANDS_KEY, JSON.stringify(added));
  } catch {}
}

// Merged, de-duped (case-insensitive) suggestion list for autocomplete.
export async function allBrands(): Promise<string[]> {
  const added = await loadAddedBrands();
  const seen = new Set<string>();
  const out: string[] = [];
  for (const b of [...CURATED_BRANDS, ...added]) {
    const k = b.toLowerCase();
    if (!seen.has(k)) { seen.add(k); out.push(b); }
  }
  return out.sort((a, b) => a.localeCompare(b));
}

// Filter suggestions by what the user has typed so far.
export function matchBrands(query: string, brands: string[], limit = 6): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts = brands.filter((b) => b.toLowerCase().startsWith(q));
  const contains = brands.filter(
    (b) => !b.toLowerCase().startsWith(q) && b.toLowerCase().includes(q)
  );
  return [...starts, ...contains].slice(0, limit);
}
