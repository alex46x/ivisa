import { AutomationState, WorkflowStage } from '../../types/automation';
import { AutomationSettings } from '../../types/settings';
import { ApplicantDocument } from '../../types/applicant';

export interface StateExecutionContext {
  settings: AutomationSettings;
  applicantDocs: ApplicantDocument[];
  doc: Document;
  location: Location;
  rotateOffset: number;
  failureCount: number;
  abortSignal?: AbortSignal;
}

export interface StateTransitionResult {
  nextStateName: string;
  stageOverride?: WorkflowStage;
  message?: string;
  delayMs?: number;
  updatedRotateOffset?: number;
  updatedFailureCount?: number;
  datesFound?: number;
}

export interface AutomationBaseState {
  readonly name: string;
  readonly stage: WorkflowStage;
  readonly automationState: AutomationState;

  enter(context: StateExecutionContext): Promise<void> | void;
  execute(context: StateExecutionContext): Promise<StateTransitionResult>;
  exit(context: StateExecutionContext): Promise<void> | void;
  cancel(): void;
}
