import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Routine } from './types';

const ROUTINES_KEY = '@chokchok:routines';

export async function loadRoutines(): Promise<Routine[]> {
  try {
    const raw = await AsyncStorage.getItem(ROUTINES_KEY);
    return raw ? (JSON.parse(raw) as Routine[]) : [];
  } catch {
    return [];
  }
}

export async function saveRoutines(routines: Routine[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
  } catch {}
}

export async function upsertRoutine(routine: Routine): Promise<Routine[]> {
  const all = await loadRoutines();
  const i = all.findIndex((r) => r.id === routine.id);
  if (i >= 0) all[i] = routine;
  else all.push(routine);
  await saveRoutines(all);
  return all;
}

export async function deleteRoutine(id: string): Promise<Routine[]> {
  const all = (await loadRoutines()).filter((r) => r.id !== id);
  await saveRoutines(all);
  return all;
}
