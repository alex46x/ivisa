import { AutomationBaseState, StateExecutionContext, StateTransitionResult } from './baseState';
import { AutomationState, WorkflowStage } from '../../types/automation';
import { pageDetector } from '../../content/pageDetector';
import { checkCaptchaPresent } from '../actions/loginActions';
import { logger } from '../../utils/logger';

export class WaitVerificationState implements AutomationBaseState {
  readonly name = 'WAIT_FOR_USER_VERIFICATION';
  readonly stage: WorkflowStage = 2;
  readonly automationState: AutomationState = 'WAITING_FOR_USER';

  enter(): void {
    logger.warning('Stage 2: ACTION REQUIRED - Please complete security verification manually on the page.');
  }

  async execute(context: StateExecutionContext): Promise<StateTransitionResult> {
    const detection = pageDetector.detect(context.doc, context.location);
    const captchaActive = checkCaptchaPresent(context.doc);

    if (detection.pageType === 'WAITING_FOR_VERIFICATION' || (detection.pageType === 'LOGIN_PAGE' && captchaActive)) {
      return {
        nextStateName: 'WAIT_FOR_USER_VERIFICATION',
        stageOverride: 2,
        delayMs: 1200,
        message: 'Awaiting manual security verification completion by user...'
      };
    }

    logger.success('Security verification completed / page transitioned. Resuming automated workflow.');
    return {
      nextStateName: 'DETECT_PAGE',
      delayMs: 500,
      message: 'Security verification passed. Detecting next workflow stage...'
    };
  }

  exit(): void {}
  cancel(): void {}
}
