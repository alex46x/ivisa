import { AutomationBaseState, StateTransitionResult } from './baseState';
import { AutomationState, WorkflowStage } from '../../types/automation';

export class IdleState implements AutomationBaseState {
  readonly name = 'IDLE';
  readonly stage: WorkflowStage = 1;
  readonly automationState: AutomationState = 'IDLE';

  enter(): void {}
  
  async execute(): Promise<StateTransitionResult> {
    return {
      nextStateName: 'IDLE',
      message: 'Engine is idle. Awaiting user start command.'
    };
  }

  exit(): void {}
  cancel(): void {}
}
