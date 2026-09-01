import { AutomationBaseState, StateExecutionContext, StateTransitionResult } from './baseState';
import { AutomationState, WorkflowStage } from '../../types/automation';
import { extractAvailableDates, highlightAndSelectDate, selectAvailableTimeSlot } from '../actions/appointmentActions';
import { clickElementSafely } from '../actions/navigationActions';
import { appointmentSelectors } from '../../selectors/appointmentSelectors';
import { findBestMatchingDate } from '../../utils/dateMatcher';
import { pageDetector } from '../../content/pageDetector';
import { logger } from '../../utils/logger';

export class DateSelectionState implements AutomationBaseState {
  readonly name = 'DATE_SELECTION';
  readonly stage: WorkflowStage = 8;
  readonly automationState: AutomationState = 'RUNNING';

  enter(): void {
    logger.info('Stage 8: Locking and selecting appointment date...');
  }

  async execute(context: StateExecutionContext): Promise<StateTransitionResult> {
    const availableDates = extractAvailableDates(context.doc);
    const match = findBestMatchingDate(
      context.settings.preferredDates,
      availableDates,
      context.settings.priorityMode,
      context.rotateOffset
    );

    const targetDate = match.bestMatch || (availableDates.length > 0 ? availableDates[0] : null);

    if (targetDate) {
      highlightAndSelectDate(targetDate, context.doc);
      
      if (context.settings.autoNavigation) {
        selectAvailableTimeSlot(context.doc);
        clickElementSafely(appointmentSelectors.bookSlotButton, context.doc);
      }
    }

    const detection = pageDetector.detect(context.doc, context.location);
    if (detection.pageType === 'PAYMENT_PAGE') {
      return {
        nextStateName: 'PAYMENT_HANDOFF',
        stageOverride: 9,
        delayMs: 500,
        message: 'Slot selected! Handing off to secure payment...'
      };
    }

    return {
      nextStateName: 'PAYMENT_HANDOFF',
      stageOverride: 9,
      delayMs: 1200
    };
  }

  exit(): void {}
  cancel(): void {}
}
