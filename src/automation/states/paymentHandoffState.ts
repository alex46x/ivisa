import { AutomationBaseState, StateExecutionContext, StateTransitionResult } from './baseState';
import { AutomationState, WorkflowStage } from '../../types/automation';
import { pageDetector } from '../../content/pageDetector';
import { logger } from '../../utils/logger';

export class PaymentHandoffState implements AutomationBaseState {
  readonly name = 'PAYMENT_HANDOFF';
  readonly stage: WorkflowStage = 9;
  readonly automationState: AutomationState = 'WAITING_FOR_USER';

  enter(): void {
    logger.warning('Stage 9: SECURE PAYMENT HANDOFF - All automation halted. Please complete payment manually.');
  }

  async execute(context: StateExecutionContext): Promise<StateTransitionResult> {
    const detection = pageDetector.detect(context.doc, context.location);

    if (detection.pageType === 'SUCCESS_PAGE') {
      logger.success('Payment completed & appointment confirmed! Workflow finished.');
      return {
        nextStateName: 'COMPLETED',
        stageOverride: 9,
        message: 'Appointment booking confirmed successfully.'
      };
    }

    if (detection.pageType === 'PAYMENT_PAGE') {
      return {
        nextStateName: 'PAYMENT_HANDOFF',
        stageOverride: 9,
        delayMs: 1500,
        message: 'Awaiting manual payment completion by user...'
      };
    }

    return {
      nextStateName: 'DETECT_PAGE',
      delayMs: 1000
    };
  }

  exit(): void {}
  cancel(): void {}
}
