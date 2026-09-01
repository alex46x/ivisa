import { describe, it, expect } from 'vitest';
import { calculateIntervalWithJitter, calculateBackoffDelayMs } from '../src/utils/backoff';

describe('Backoff & Jitter Timing Utility', () => {
  it('should enforce safe minimum interval of at least 60 seconds with jitter', () => {
    for (let i = 0; i < 20; i++) {
      const delayMs = calculateIntervalWithJitter(60, 5);
      // Expected between 55,000ms and 65,000ms
      expect(delayMs).toBeGreaterThanOrEqual(54000);
      expect(delayMs).toBeLessThanOrEqual(66000);
    }
  });

  it('should enforce minimum 60s even if a lower value is requested', () => {
    const delayMs = calculateIntervalWithJitter(10, 5);
    // Even if requested 10s, base is clamped to 60s -> min ~55s
    expect(delayMs).toBeGreaterThanOrEqual(54000);
  });

  it('should calculate exponential backoff progression for failure counts', () => {
    const step1 = calculateBackoffDelayMs(1, 10);
    const step2 = calculateBackoffDelayMs(2, 10);
    const step3 = calculateBackoffDelayMs(3, 10);
    const step4 = calculateBackoffDelayMs(4, 10);

    // 1 min ~ 60,000ms (±10% jitter)
    expect(step1).toBeGreaterThanOrEqual(50000);
    expect(step1).toBeLessThanOrEqual(70000);

    // 2 min ~ 120,000ms
    expect(step2).toBeGreaterThanOrEqual(100000);
    expect(step2).toBeLessThanOrEqual(140000);

    // 5 min ~ 300,000ms
    expect(step3).toBeGreaterThanOrEqual(260000);
    expect(step3).toBeLessThanOrEqual(340000);

    // 10 min ~ 600,000ms
    expect(step4).toBeGreaterThanOrEqual(520000);
    expect(step4).toBeLessThanOrEqual(680000);
  });
});
