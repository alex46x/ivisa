import { APP_CONFIG } from '../config/appConfig';

/**
 * Computes interval with random jitter in milliseconds.
 * E.g., 60s ± 5s -> random duration between 55,000ms and 65,000ms.
 */
export function calculateIntervalWithJitter(
  baseIntervalSeconds: number,
  jitterSeconds: number = APP_CONFIG.CHECK_JITTER_SECONDS
): number {
  // Enforce conservative minimum
  const enforcedBase = Math.max(baseIntervalSeconds, APP_CONFIG.MIN_CHECK_INTERVAL_SECONDS);
  const minSeconds = Math.max(10, enforcedBase - jitterSeconds);
  const maxSeconds = enforcedBase + jitterSeconds;
  
  const randomizedSeconds = minSeconds + Math.random() * (maxSeconds - minSeconds);
  return Math.round(randomizedSeconds * 1000);
}

/**
 * Calculates exponential backoff delay in milliseconds based on consecutive failures/rate limits.
 */
export function calculateBackoffDelayMs(
  failureCount: number,
  maxBackoffMinutes: number = APP_CONFIG.DEFAULT_MAX_BACKOFF_MINUTES
): number {
  if (failureCount <= 0) return 0;

  const steps = APP_CONFIG.BACKOFF_STEPS_MINUTES;
  const stepIndex = Math.min(failureCount - 1, steps.length - 1);
  const minutes = Math.min(steps[stepIndex], maxBackoffMinutes);

  // Add 10% random jitter to avoid thundering herd
  const jitterMs = (Math.random() * 0.2 - 0.1) * (minutes * 60 * 1000);
  const totalMs = minutes * 60 * 1000 + jitterMs;

  return Math.max(10000, Math.round(totalMs));
}
