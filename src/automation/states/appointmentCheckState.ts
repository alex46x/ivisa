import { AutomationBaseState, StateExecutionContext, StateTransitionResult } from './baseState';
import { AutomationState, WorkflowStage } from '../../types/automation';
import { extractAvailableDates, refreshSlotAvailability } from '../actions/appointmentActions';
import { findBestMatchingDate } from '../../utils/dateMatcher';
import { calculateIntervalWithJitter, calculateBackoffDelayMs } from '../../utils/backoff';
import { generalSelectors } from '../../selectors/appointmentSelectors';
import { findFirstMatchingElement } from '../../utils/domHelpers';
import { pageDetector } from '../../content/pageDetector';
import { logger } from '../../utils/logger';

export class AppointmentCheckState implements AutomationBaseState {
  readonly name = 'APPOINTMENT_CHECK';
  readonly stage: WorkflowStage = 8;
  readonly automationState: AutomationState = 'RUNNING';

  enter(): void {
    logger.info('Stage 8: Inspecting appointment slot availability on live portal...');
  }

  async execute(context: StateExecutionContext): Promise<StateTransitionResult> {
    // Check rate limit warnings
    const rateLimitBanner = findFirstMatchingElement(generalSelectors.rateLimitWarning, context.doc);
    if (rateLimitBanner) {
      const newFailureCount = context.failureCount + 1;
      const backoffMs = calculateBackoffDelayMs(newFailureCount, context.settings.maxBackoffDelay);
      logger.warning(`Rate limit / warning detected. Backing off safely for ${(backoffMs / 1000 / 60).toFixed(1)} minutes.`);
      return {
        nextStateName: 'APPOINTMENT_CHECK',
        delayMs: backoffMs,
        updatedFailureCount: newFailureCount,
        message: `Rate limit backoff in progress (${(backoffMs / 1000).toFixed(0)}s)`
      };
    }

    // Extract visible dates from real portal DOM
    const availableDates = extractAvailableDates(context.doc);
    const dateCount = availableDates.length;

    if (dateCount > 0) {
      logger.info(`Found ${dateCount} available appointment date(s): [${availableDates.slice(0, 5).join(', ')}${dateCount > 5 ? '...' : ''}]`);
    } else {
      logger.info('No appointment dates currently open on portal.');
    }

    // Match against user's preferences
    const matchResult = findBestMatchingDate(
      context.settings.preferredDates,
      availableDates,
      context.settings.priorityMode,
      context.rotateOffset
    );

    if (matchResult.bestMatch) {
      logger.success(`🎉 MATCHING APPOINTMENT DATE FOUND: ${matchResult.bestMatch}`);
      return {
        nextStateName: 'DATE_SELECTION',
        stageOverride: 8,
        delayMs: 300,
        datesFound: dateCount,
        message: `Preferred slot available: ${matchResult.bestMatch}`
      };
    }

    if (context.settings.preferredDates.length === 0 && availableDates.length > 0) {
      const firstDate = availableDates[0];
      logger.success(`Available date found (no preference specified): ${firstDate}`);
      return {
        nextStateName: 'DATE_SELECTION',
        stageOverride: 8,
        delayMs: 300,
        datesFound: dateCount,
        message: `Available date: ${firstDate}`
      };
    }

    // Wait conservative interval with jitter
    const delayMs = calculateIntervalWithJitter(context.settings.checkInterval);
    logger.info(`No matching slot. Waiting ${(delayMs / 1000).toFixed(0)}s before next check.`);

    if (context.settings.autoNavigation) {
      refreshSlotAvailability(context.doc);
    }

    const detection = pageDetector.detect(context.doc, context.location);
    if (detection.pageType === 'PAYMENT_PAGE') {
      return { nextStateName: 'PAYMENT_HANDOFF', stageOverride: 9 };
    }

    return {
      nextStateName: 'APPOINTMENT_CHECK',
      stageOverride: 8,
      delayMs,
      datesFound: dateCount,
      updatedRotateOffset: matchResult.newRotateOffset,
      updatedFailureCount: 0,
      message: `Checked availability (${dateCount} dates found). Next check in ${(delayMs / 1000).toFixed(0)}s`
    };
  }

  exit(): void {}
  cancel(): void {}
}
