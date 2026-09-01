import {
  AutomationState,
  WorkflowStage,
  StageColorState,
  StateMachineContext,
  ActivityInfo
} from '../types/automation';
import { PageType } from '../types/page';
import { AutomationBaseState, StateExecutionContext, StateTransitionResult } from './states/baseState';
import { IdleState } from './states/idleState';
import { DetectPageState } from './states/detectPageState';
import { LoginState } from './states/loginState';
import { WaitVerificationState } from './states/waitVerificationState';
import { WaitOtpState } from './states/waitOtpState';
import { MissionSelectionState } from './states/missionSelectionState';
import { CenterSelectionState } from './states/centerSelectionState';
import { FileUploadState } from './states/fileUploadState';
import { ConfirmationState } from './states/confirmationState';
import { AppointmentCheckState } from './states/appointmentCheckState';
import { DateSelectionState } from './states/dateSelectionState';
import { PaymentHandoffState } from './states/paymentHandoffState';
import { CompletedState } from './states/completedState';
import { ErrorState } from './states/errorState';
import { logger } from '../utils/logger';

export type StateMachineListener = (context: StateMachineContext) => void;

export class StateMachine {
  private states: Map<string, AutomationBaseState> = new Map();
  private currentState: AutomationBaseState;
  private executionTimer: number | null = null;
  private listeners: Set<StateMachineListener> = new Set();

  private context: StateMachineContext = {
    state: 'IDLE',
    currentStage: 1,
    stageStatuses: {
      1: 'not-started',
      2: 'not-started',
      3: 'not-started',
      4: 'not-started',
      5: 'not-started',
      6: 'not-started',
      7: 'not-started',
      8: 'not-started',
      9: 'not-started'
    },
    pageType: 'UNKNOWN',
    stats: {
      attempts: 0,
      cycles: 0,
      datesFound: 0,
      status: 'IDLE'
    },
    activity: {
      currentPage: 'Unknown',
      currentAction: 'Idle - Ready to start',
      preferredDate: 'None',
      availableDates: 'None',
      lastCheck: 'Never',
      nextCheck: 'None'
    }
  };

  constructor() {
    this.registerState(new IdleState());
    this.registerState(new DetectPageState());
    this.registerState(new LoginState());
    this.registerState(new WaitVerificationState());
    this.registerState(new WaitOtpState());
    this.registerState(new MissionSelectionState());
    this.registerState(new CenterSelectionState());
    this.registerState(new FileUploadState());
    this.registerState(new ConfirmationState());
    this.registerState(new AppointmentCheckState());
    this.registerState(new DateSelectionState());
    this.registerState(new PaymentHandoffState());
    this.registerState(new CompletedState());
    this.registerState(new ErrorState());

    this.currentState = this.states.get('IDLE')!;
  }

  private registerState(state: AutomationBaseState): void {
    this.states.set(state.name, state);
  }

  public getContext(): StateMachineContext {
    return JSON.parse(JSON.stringify(this.context));
  }

  public getCurrentState(): AutomationBaseState {
    return this.currentState;
  }

  public subscribe(listener: StateMachineListener): () => void {
    this.listeners.add(listener);
    listener(this.getContext());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const ctx = this.getContext();
    this.listeners.forEach((l) => {
      try {
        l(ctx);
      } catch (err) {
        console.error('Error in state machine listener:', err);
      }
    });
  }

  public updateActivity(partial: Partial<ActivityInfo>): void {
    this.context.activity = {
      ...this.context.activity,
      ...partial
    };
    this.notify();
  }

  public updatePageType(pageType: PageType): void {
    this.context.pageType = pageType;
    this.context.activity.currentPage = pageType.replace(/_/g, ' ');
    this.notify();
  }

  public updateStageStatus(stage: WorkflowStage, status: StageColorState): void {
    this.context.stageStatuses[stage] = status;
    this.notify();
  }

  public updateState(state: AutomationState): void {
    this.context.state = state;
    this.context.stats.status = state;
    this.notify();
  }

  public async transitionTo(
    nextStateName: string,
    execContext: StateExecutionContext,
    overrideStage?: WorkflowStage,
    customMessage?: string
  ): Promise<void> {
    const nextState = this.states.get(nextStateName);
    if (!nextState) {
      logger.error(`Unknown state transition target: "${nextStateName}"`);
      return;
    }

    // Exit old state
    await this.currentState.exit(execContext);

    this.currentState = nextState;

    // Update context
    const activeStage = overrideStage || nextState.stage;
    this.context.currentStage = activeStage;
    this.context.state = nextState.automationState;
    this.context.stats.status = nextState.automationState;

    // Update stepper visual colors
    for (let s = 1; s <= 9; s++) {
      const stageNum = s as WorkflowStage;
      if (stageNum < activeStage) {
        this.context.stageStatuses[stageNum] = 'completed';
      } else if (stageNum === activeStage) {
        if (nextState.automationState === 'WAITING_FOR_USER') {
          this.context.stageStatuses[stageNum] = 'waiting';
        } else if (nextState.automationState === 'ERROR') {
          this.context.stageStatuses[stageNum] = 'error';
        } else {
          this.context.stageStatuses[stageNum] = 'current';
        }
      } else {
        this.context.stageStatuses[stageNum] = 'not-started';
      }
    }

    if (customMessage) {
      this.context.activity.currentAction = customMessage;
    }

    this.notify();
    await this.currentState.enter(execContext);
  }

  public async step(execContext: StateExecutionContext): Promise<StateTransitionResult> {
    if (this.context.state === 'STOPPED' || this.context.state === 'PAUSED') {
      return { nextStateName: this.currentState.name };
    }

    this.context.stats.attempts += 1;
    this.context.activity.lastCheck = new Date().toLocaleTimeString();
    this.notify();

    try {
      const result = await this.currentState.execute(execContext);

      if (result.datesFound !== undefined) {
        this.context.stats.datesFound = result.datesFound;
      }

      if (result.message) {
        this.context.activity.currentAction = result.message;
      }

      this.notify();
      return result;
    } catch (err: any) {
      logger.error(`Error in state [${this.currentState.name}]: ${err?.message || err}`);
      this.context.errorMessage = err?.message || 'An unexpected execution error occurred.';
      this.context.suggestedAction = 'Check internet connection or refresh the page and restart.';
      await this.transitionTo('ERROR', execContext, this.currentState.stage);
      return { nextStateName: 'ERROR' };
    }
  }

  public stop(): void {
    if (this.executionTimer !== null) {
      clearTimeout(this.executionTimer);
      this.executionTimer = null;
    }
    this.currentState.cancel();
    this.currentState = this.states.get('IDLE')!;
    this.context.state = 'STOPPED';
    this.context.stats.status = 'STOPPED';
    this.context.activity.currentAction = 'Automation stopped by user.';
    this.context.activity.nextCheck = 'None';
    logger.warning('🛑 Automation stopped immediately by user. All active timers and routines cancelled.');
    this.notify();
  }

  public pause(): void {
    if (this.executionTimer !== null) {
      clearTimeout(this.executionTimer);
      this.executionTimer = null;
    }
    this.context.state = 'PAUSED';
    this.context.stats.status = 'PAUSED';
    this.context.activity.currentAction = 'Automation paused by user.';
    logger.info('⏸ Automation paused.');
    this.notify();
  }

  public reset(): void {
    this.stop();
    this.context.state = 'IDLE';
    this.context.stats = {
      attempts: 0,
      cycles: 0,
      datesFound: 0,
      status: 'IDLE'
    };
    for (let s = 1; s <= 9; s++) {
      this.context.stageStatuses[s as WorkflowStage] = 'not-started';
    }
    this.context.currentStage = 1;
    this.context.activity = {
      currentPage: 'Idle',
      currentAction: 'Engine ready to start',
      preferredDate: 'None',
      availableDates: 'None',
      lastCheck: 'Never',
      nextCheck: 'None'
    };
    this.notify();
  }
}

export const stateMachine = new StateMachine();
