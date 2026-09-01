import { describe, it, expect } from 'vitest';
import { normalizeDate, findBestMatchingDate } from '../src/utils/dateMatcher';

describe('DateMatcher Utility', () => {
  it('should normalize various date formats to standard YYYY-MM-DD', () => {
    expect(normalizeDate('2026-08-20')).toBe('2026-08-20');
    expect(normalizeDate('20-08-2026')).toBe('2026-08-20');
    expect(normalizeDate('20/08/2026')).toBe('2026-08-20');
  });

  it('should match first preferred date in Strict Priority mode', () => {
    const preferred = ['2026-08-20', '2026-08-21', '2026-08-25'];
    const available = ['2026-08-21', '2026-08-27', '2026-08-20'];

    const result = findBestMatchingDate(preferred, available, 'strict');
    expect(result.bestMatch).toBe('2026-08-20');
    expect(result.matchedPreferenceIndex).toBe(0);
  });

  it('should return null when no preferred date is available in Strict Priority mode', () => {
    const preferred = ['2026-08-20', '2026-08-21'];
    const available = ['2026-08-25', '2026-08-28'];

    const result = findBestMatchingDate(preferred, available, 'strict');
    expect(result.bestMatch).toBeNull();
    expect(result.matchedPreferenceIndex).toBe(-1);
  });

  it('should rotate priority order and match accordingly in Rotate mode', () => {
    const preferred = ['2026-08-20', '2026-08-21', '2026-08-25'];
    const available = ['2026-08-21', '2026-08-25'];

    // Start with offset 1 (focus on '2026-08-21')
    const result1 = findBestMatchingDate(preferred, available, 'rotate', 1);
    expect(result1.bestMatch).toBe('2026-08-21');
    expect(result1.matchedPreferenceIndex).toBe(1);
    expect(result1.newRotateOffset).toBe(2);

    // If offset is 2 and only 25 is available
    const result2 = findBestMatchingDate(preferred, ['2026-08-25'], 'rotate', 2);
    expect(result2.bestMatch).toBe('2026-08-25');
    expect(result2.matchedPreferenceIndex).toBe(2);
    expect(result2.newRotateOffset).toBe(0); // wraps around
  });
});
