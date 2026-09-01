import { AutomationBaseState, StateExecutionContext, StateTransitionResult } from './baseState';
import { AutomationState, WorkflowStage } from '../../types/automation';
import { fillLoginFields, checkCaptchaPresent } from '../actions/loginActions';
import { pageDetector } from '../../content/pageDetector';
import { logger } from '../../utils/logger';

export class LoginState implements AutomationBaseState {
  readonly name = 'LOGIN';
  readonly stage: WorkflowStage = 1;
  readonly automationState: AutomationState = 'RUNNING';

  enter(): void {
    logger.info('Stage 1: Processing Login page...');
  }

  async execute(context: StateExecutionContext): Promise<StateTransitionResult> {
    const isCaptcha = checkCaptchaPresent(context.doc);
    if (isCaptcha) {
      return {
        nextStateName: 'WAIT_FOR_USER_VERIFICATION',
        stageOverride: 2,
        message: 'Security challenge detected. Please complete verification manually.'
      };
    }

    if (context.settings.autoSignIn && context.settings.phone) {
      fillLoginFields(context.settings.phone, context.settings.password, context.doc);
      
      if (checkCaptchaPresent(context.doc)) {
        return {
          nextStateName: 'WAIT_FOR_USER_VERIFICATION',
          stageOverride: 2,
          message: 'Security verification appeared. Please complete manually.'
        };
      }
    }

    const detection = pageDetector.detect(context.doc, context.location);
    if (detection.pageType !== 'LOGIN_PAGE') {
      return {
        nextStateName: 'DETECT_PAGE',
        message: `Navigated from Login to [${detection.pageType}]`
      };
    }

    return {
      nextStateName: 'WAIT_FOR_USER_VERIFICATION',
      stageOverride: 2,
      delayMs: 1000,
      message: 'Please complete login credentials & verification manually.'
    };
  }

  exit(): void {}
  cancel(): void {}
}
