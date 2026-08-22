import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from './types';
import { SAMPLE_PRODUCTS } from './data/sampleProducts';

const PRODUCTS_KEY = '@chokchok:products';

// Fresh installs start empty. Flip to true only to seed the demo products (dev/testing).
const SEED_SAMPLES = false;

let seeded = false;

export async function loadProducts(): Promise<Product[]> {
  try {
    const raw = await AsyncStorage.getItem(PRODUCTS_KEY);
    if (raw !== null) return JSON.parse(raw) as Product[];
    // key doesn't exist yet = first launch
    if (SEED_SAMPLES && !seeded) {
      seeded = true;
      await saveProducts(SAMPLE_PRODUCTS);
      return SAMPLE_PRODUCTS;
    }
    return [];
  } catch {
    return [];
  }
}

export async function saveProducts(products: Product[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch {}
}

export async function upsertProduct(product: Product): Promise<Product[]> {
  const all = await loadProducts();
  const i = all.findIndex((p) => p.id === product.id);
  if (i >= 0) all[i] = product;
  else all.push(product);
  await saveProducts(all);
  return all;
}

export async function deleteProduct(id: string): Promise<Product[]> {
  const all = (await loadProducts()).filter((p) => p.id !== id);
  await saveProducts(all);
  return all;
}
