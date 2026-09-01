import { AutomationBaseState, StateExecutionContext, StateTransitionResult } from './baseState';
import { AutomationState, WorkflowStage } from '../../types/automation';
import { uploadSelectors } from '../../selectors/uploadSelectors';
import { findFirstMatchingElement, isElementEnabled } from '../../utils/domHelpers';
import { clickElementSafely } from '../actions/navigationActions';
import { pageDetector } from '../../content/pageDetector';
import { logger } from '../../utils/logger';

export class ConfirmationState implements AutomationBaseState {
  readonly name = 'APPLICANT_CONFIRMATION';
  readonly stage: WorkflowStage = 7;
  readonly automationState: AutomationState = 'RUNNING';

  enter(): void {
    logger.info('Stage 7: Applicant Confirmation review...');
  }

  async execute(context: StateExecutionContext): Promise<StateTransitionResult> {
    const checkbox = findFirstMatchingElement<HTMLInputElement>(
      uploadSelectors.confirmCheckbox,
      context.doc
    );

    if (checkbox && !checkbox.checked && isElementEnabled(checkbox)) {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      logger.action('Accepted applicant details confirmation checkbox.');
    }

    if (context.settings.autoNavigation) {
      clickElementSafely(uploadSelectors.confirmProceedButton, context.doc);
    }

    const detection = pageDetector.detect(context.doc, context.location);
    if (detection.pageType !== 'APPLICANT_CONFIRMATION_PAGE') {
      return {
        nextStateName: 'DETECT_PAGE',
        delayMs: 600,
        message: 'Applicant confirmed. Moving to Appointment calendar...'
      };
    }

    return {
      nextStateName: 'APPOINTMENT_CHECK',
      stageOverride: 8,
      delayMs: 1000
    };
  }

  exit(): void {}
  cancel(): void {}
}
