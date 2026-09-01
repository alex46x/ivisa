import { PriorityMode } from '../types/settings';

/**
 * Normalizes common date string formats into standard YYYY-MM-DD.
 */
export function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';
  const clean = dateStr.trim();

  // Format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  // Format: DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyy = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, '0');
    const month = ddmmyyyy[2].padStart(2, '0');
    const year = ddmmyyyy[3];
    return `${year}-${month}-${day}`;
  }

  // Try Date.parse for "20 Aug 2026", "August 20, 2026", etc.
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return clean;
}

export interface DateMatchResult {
  bestMatch: string | null;
  matchedPreferenceIndex: number;
  newRotateOffset: number;
}

/**
 * Evaluates available dates against configured preferred dates based on priority mode.
 */
export function findBestMatchingDate(
  preferredDates: string[],
  availableDates: string[],
  priorityMode: PriorityMode = 'strict',
  rotateOffset: number = 0
): DateMatchResult {
  if (!preferredDates || preferredDates.length === 0 || !availableDates || availableDates.length === 0) {
    return {
      bestMatch: null,
      matchedPreferenceIndex: -1,
      newRotateOffset: rotateOffset
    };
  }

  const normalizedAvailable = new Set(availableDates.map(normalizeDate));

  if (priorityMode === 'strict') {
    for (let i = 0; i < preferredDates.length; i++) {
      const normalizedPref = normalizeDate(preferredDates[i]);
      if (normalizedAvailable.has(normalizedPref)) {
        return {
          bestMatch: preferredDates[i],
          matchedPreferenceIndex: i,
          newRotateOffset: rotateOffset
        };
      }
    }
    return {
      bestMatch: null,
      matchedPreferenceIndex: -1,
      newRotateOffset: rotateOffset
    };
  }

  // Rotate Mode: start checking from current rotate offset and wrap around
  const len = preferredDates.length;
  const currentOffset = rotateOffset % len;

  for (let step = 0; step < len; step++) {
    const index = (currentOffset + step) % len;
    const normalizedPref = normalizeDate(preferredDates[index]);
    if (normalizedAvailable.has(normalizedPref)) {
      return {
        bestMatch: preferredDates[index],
        matchedPreferenceIndex: index,
        newRotateOffset: (index + 1) % len
      };
    }
  }

  // If no match found, advance rotation offset for the next cycle
  return {
    bestMatch: null,
    matchedPreferenceIndex: -1,
    newRotateOffset: (currentOffset + 1) % len
  };
}
