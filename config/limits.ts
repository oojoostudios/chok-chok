// How many routines a cabinet may hold.
//
// 999 = effectively off. Lower a value to turn that cabinet's limit on; the
// check lives in canCreateRoutine (app/routines.tsx) and needs no other change.
export const MAX_BEAUTY_ROUTINES = 999;
export const MAX_WELLNESS_ROUTINES = 999;

export function routineLimitFor(cabinet: 'beauty' | 'wellness'): number {
  return cabinet === 'wellness' ? MAX_WELLNESS_ROUTINES : MAX_BEAUTY_ROUTINES;
}
