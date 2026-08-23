import type { Goal, Routine } from '../types';

export type Preset = { name: string; kind: 'AM' | 'PM' | 'custom'; stepLabels: string[] };

export const PRESETS: Preset[] = [
  { name: 'Morning Routine', kind: 'AM', stepLabels: ['Cleanse', 'Treat', 'Seal', 'Protect'] },
  { name: 'PM Routine',      kind: 'PM', stepLabels: ['Cleanse', 'Treat', 'Seal', 'Targeted'] },
  { name: 'Minimal',         kind: 'AM', stepLabels: ['Cleanse', 'Seal', 'Protect'] },
];

export function routineFromPreset(preset: Preset): Routine {
  return {
    id: String(Date.now()),
    name: preset.name,
    kind: preset.kind,
    steps: preset.stepLabels.map((label) => ({ label })),
    dateCreated: new Date().toISOString(),
  };
}

export function blankCustomRoutine(): Routine {
  return {
    id: String(Date.now()),
    name: 'My Protocol',
    kind: 'custom',
    steps: [{ label: 'Step 1' }],
    dateCreated: new Date().toISOString(),
  };
}

// Wellness presets are goals, not schedules. Each starts empty — the user
// fills it with supplements from their cabinet. Names match the Goal values
// exactly so each preset can wear its GOAL color.
export type WellnessPreset = { id: string; name: Goal };

export const WELLNESS_PRESETS: WellnessPreset[] = [
  { id: 'w-daily',    name: 'Daily' },
  { id: 'w-sleep',    name: 'Sleep & Calm' },
  { id: 'w-energy',   name: 'Energy' },
  { id: 'w-gut',      name: 'Gut' },
  { id: 'w-immunity', name: 'Immunity' },
  { id: 'w-hormone',  name: 'Hormone' },
  { id: 'w-skinhair', name: 'Skin & Hair' },
  { id: 'w-targeted', name: 'Targeted' },
];

export function routineFromWellnessPreset(preset: WellnessPreset): Routine {
  return {
    id: String(Date.now()),
    name: preset.name,
    kind: 'wellness',
    steps: [],
    dateCreated: new Date().toISOString(),
  };
}

export function blankWellnessRoutine(): Routine {
  return {
    id: String(Date.now()),
    name: 'My Routine',
    kind: 'wellness',
    steps: [],
    dateCreated: new Date().toISOString(),
  };
}
