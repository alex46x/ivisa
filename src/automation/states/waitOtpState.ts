import { AutomationBaseState, StateExecutionContext, StateTransitionResult } from './baseState';
import { AutomationState, WorkflowStage } from '../../types/automation';
import { pageDetector } from '../../content/pageDetector';
import { logger } from '../../utils/logger';

export class WaitOtpState implements AutomationBaseState {
  readonly name = 'WAIT_FOR_OTP';
  readonly stage: WorkflowStage = 3;
  readonly automationState: AutomationState = 'WAITING_FOR_USER';

  enter(): void {
    logger.warning('Stage 3: ACTION REQUIRED - Please enter the OTP code received on your phone directly into the page.');
  }

  async execute(context: StateExecutionContext): Promise<StateTransitionResult> {
    const detection = pageDetector.detect(context.doc, context.location);

    if (detection.pageType === 'OTP_PAGE') {
      return {
        nextStateName: 'WAIT_FOR_OTP',
        stageOverride: 3,
        delayMs: 1200,
        message: 'Awaiting manual OTP entry and submission by user...'
      };
    }

    logger.success('OTP verified successfully. Resuming workflow.');
    return {
      nextStateName: 'DETECT_PAGE',
      delayMs: 500,
      message: 'OTP verification passed.'
    };
  }

  exit(): void {}
  cancel(): void {}
}
