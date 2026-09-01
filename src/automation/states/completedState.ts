import { AutomationBaseState, StateTransitionResult } from './baseState';
import { AutomationState, WorkflowStage } from '../../types/automation';
import { logger } from '../../utils/logger';

export class CompletedState implements AutomationBaseState {
  readonly name = 'COMPLETED';
  readonly stage: WorkflowStage = 9;
  readonly automationState: AutomationState = 'COMPLETED';

  enter(): void {
    logger.success('🏆 Visa Appointment Workflow Completed Successfully!');
  }

  async execute(): Promise<StateTransitionResult> {
    return {
      nextStateName: 'COMPLETED',
      message: 'Workflow completed.'
    };
  }

  exit(): void {}
  cancel(): void {}
}
