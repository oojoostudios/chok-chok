import type { Routine } from '../types';

export type Preset = { name: string; kind: 'AM' | 'PM' | 'custom'; stepLabels: string[] };

export const PRESETS: Preset[] = [
  { name: 'Morning Routine', kind: 'AM', stepLabels: ['Cleanse', 'Brighten', 'Moisturize', 'Protect'] },
  { name: 'PM Routine',      kind: 'PM', stepLabels: ['Cleanse', 'Treat', 'Moisturize', 'Nourish'] },
  { name: 'Minimal',         kind: 'AM', stepLabels: ['Cleanse', 'Moisturize', 'Protect'] },
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
