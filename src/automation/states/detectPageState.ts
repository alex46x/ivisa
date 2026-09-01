import { AutomationBaseState, StateExecutionContext, StateTransitionResult } from './baseState';
import { AutomationState, WorkflowStage } from '../../types/automation';
import { pageDetector } from '../../content/pageDetector';
import { logger } from '../../utils/logger';

export class DetectPageState implements AutomationBaseState {
  readonly name = 'DETECT_PAGE';
  readonly stage: WorkflowStage = 1;
  readonly automationState: AutomationState = 'RUNNING';

  enter(): void {
    logger.info('Analyzing current page and workflow context...');
  }

  async execute(context: StateExecutionContext): Promise<StateTransitionResult> {
    const detection = pageDetector.detect(context.doc, context.location);
    logger.info(`Page detected: [${detection.pageType}] (Confidence: ${(detection.confidence * 100).toFixed(0)}%)`, {
      signals: detection.matchedSignals
    });

    switch (detection.pageType) {
      case 'LOGIN_PAGE':
        return { nextStateName: 'LOGIN', stageOverride: 1 };
      case 'WAITING_FOR_VERIFICATION':
        return { nextStateName: 'WAIT_FOR_USER_VERIFICATION', stageOverride: 2 };
      case 'OTP_PAGE':
        return { nextStateName: 'WAIT_FOR_OTP', stageOverride: 3 };
      case 'MISSION_SELECTION_PAGE':
        return { nextStateName: 'MISSION_SELECTION', stageOverride: 4 };
      case 'CENTER_SELECTION_PAGE':
        return { nextStateName: 'CENTER_SELECTION', stageOverride: 5 };
      case 'FILE_UPLOAD_PAGE':
        return { nextStateName: 'FILE_UPLOAD', stageOverride: 6 };
      case 'APPLICANT_CONFIRMATION_PAGE':
        return { nextStateName: 'APPLICANT_CONFIRMATION', stageOverride: 7 };
      case 'APPOINTMENT_PAGE':
        return { nextStateName: 'APPOINTMENT_CHECK', stageOverride: 8 };
      case 'DATE_SELECTION_PAGE':
        return { nextStateName: 'DATE_SELECTION', stageOverride: 8 };
      case 'PAYMENT_PAGE':
        return { nextStateName: 'PAYMENT_HANDOFF', stageOverride: 9 };
      case 'SUCCESS_PAGE':
        return { nextStateName: 'COMPLETED', stageOverride: 9 };
      default:
        // If unknown, wait a moment and re-check or guide user
        return {
          nextStateName: 'DETECT_PAGE',
          delayMs: 1500,
          message: 'Waiting for recognizable workflow page...'
        };
    }
  }

  exit(): void {}
  cancel(): void {}
}
