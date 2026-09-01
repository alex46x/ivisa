import { AutomationBaseState, StateTransitionResult } from './baseState';
import { AutomationState, WorkflowStage } from '../../types/automation';

export class ErrorState implements AutomationBaseState {
  readonly name = 'ERROR';
  readonly stage: WorkflowStage = 1;
  readonly automationState: AutomationState = 'ERROR';

  enter(): void {}

  async execute(): Promise<StateTransitionResult> {
    return {
      nextStateName: 'ERROR',
      message: 'Workflow paused due to an error. Please inspect portal state.'
    };
  }

  exit(): void {}
  cancel(): void {}
}
