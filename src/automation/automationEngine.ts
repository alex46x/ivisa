import { StateMachine, stateMachine } from './stateMachine';
import { StateExecutionContext } from './states/baseState';
import { AutomationSettings } from '../types/settings';
import { ApplicantDocument } from '../types/applicant';
import { DEFAULT_SETTINGS } from '../config/appConfig';
import { domObserver } from '../content/domObserver';
import { pageDetector } from '../content/pageDetector';
import { logger } from '../utils/logger';

export class AutomationEngine {
  private sm: StateMachine;
  private settings: AutomationSettings = DEFAULT_SETTINGS;
  private applicantDocs: ApplicantDocument[] = [];
  private isRunning = false;
  private isPaused = false;
  private loopTimer: number | null = null;
  private unsubscribeObserver: (() => void) | null = null;
  private rotateOffset = 0;
  private failureCount = 0;

  constructor(sm: StateMachine = stateMachine) {
    this.sm = sm;
    this.handleDOMChange = this.handleDOMChange.bind(this);
  }

  public init(settings: AutomationSettings, docs: ApplicantDocument[] = []): void {
    this.settings = settings;
    this.applicantDocs = docs;
    this.updateActivityPreferences();
  }

  public setSettings(settings: AutomationSettings): void {
    this.settings = settings;
    this.updateActivityPreferences();
  }

  public getSettings(): AutomationSettings {
    return this.settings;
  }

  public setApplicantDocs(docs: ApplicantDocument[]): void {
    this.applicantDocs = docs;
  }

  public getApplicantDocs(): ApplicantDocument[] {
    return this.applicantDocs;
  }

  private updateActivityPreferences(): void {
    const prefStr = this.settings.preferredDates.length > 0
      ? this.settings.preferredDates.join(', ')
      : 'Any Available Date';
    this.sm.updateActivity({ preferredDate: prefStr });
  }

  public async start(): Promise<void> {
    if (this.isRunning && !this.isPaused) return;

    this.isRunning = true;
    this.isPaused = false;
    this.updateActivityPreferences();

    logger.info('🚀 Starting VISA AUTOMATOR workflow...');

    // Start DOM & URL observer
    domObserver.start();
    this.unsubscribeObserver = domObserver.subscribe(this.handleDOMChange);

    const execContext = this.createExecutionContext();
    await this.sm.transitionTo('DETECT_PAGE', execContext, 1, 'Initializing workflow engine...');

    this.scheduleNextStep(100);
  }

  public stop(): void {
    this.isRunning = false;
    this.isPaused = false;

    if (this.loopTimer !== null) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }

    if (this.unsubscribeObserver) {
      this.unsubscribeObserver();
      this.unsubscribeObserver = null;
    }

    this.sm.stop();
  }

  public pause(): void {
    if (!this.isRunning || this.isPaused) return;
    this.isPaused = true;

    if (this.loopTimer !== null) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }

    this.sm.pause();
  }

  public resume(): void {
    if (!this.isRunning || !this.isPaused) return;
    this.isPaused = false;

    this.sm.updateState('RUNNING');
    logger.info('▶ Resuming VISA AUTOMATOR workflow...');
    this.scheduleNextStep(200);
  }

  private handleDOMChange(): void {
    if (!this.isRunning || this.isPaused) return;

    // Detect page update on DOM mutation
    const detection = pageDetector.detect();
    this.sm.updatePageType(detection.pageType);

    // If waiting for user or in detect state, trigger faster loop iteration
    const stateName = this.sm.getCurrentState().name;
    if (stateName === 'WAIT_FOR_USER_VERIFICATION' || stateName === 'WAIT_FOR_OTP' || stateName === 'PAYMENT_HANDOFF') {
      if (this.loopTimer !== null) {
        clearTimeout(this.loopTimer);
      }
      this.scheduleNextStep(300);
    }
  }

  private scheduleNextStep(delayMs: number): void {
    if (!this.isRunning || this.isPaused) return;

    if (this.loopTimer !== null) {
      clearTimeout(this.loopTimer);
    }

    if (delayMs > 2000) {
      const nextTime = new Date(Date.now() + delayMs).toLocaleTimeString();
      this.sm.updateActivity({ nextCheck: nextTime });
    } else {
      this.sm.updateActivity({ nextCheck: 'Imminent' });
    }

    this.loopTimer = window.setTimeout(async () => {
      await this.runStep();
    }, delayMs);
  }

  private async runStep(): Promise<void> {
    if (!this.isRunning || this.isPaused) return;

    const execContext = this.createExecutionContext();
    const result = await this.sm.step(execContext);

    if (!this.isRunning || this.isPaused) return;

    if (result.nextStateName === 'COMPLETED' || result.nextStateName === 'ERROR') {
      if (result.nextStateName === 'COMPLETED') {
        this.isRunning = false;
      }
      return;
    }

    // If state transition requested
    if (result.nextStateName && result.nextStateName !== this.sm.getCurrentState().name) {
      await this.sm.transitionTo(
        result.nextStateName,
        execContext,
        result.stageOverride,
        result.message
      );
    }

    const nextDelay = result.delayMs !== undefined ? result.delayMs : 1000;
    this.scheduleNextStep(nextDelay);
  }

  private createExecutionContext(): StateExecutionContext {
    return {
      settings: this.settings,
      applicantDocs: this.applicantDocs,
      doc: document,
      location: window.location,
      rotateOffset: this.rotateOffset,
      failureCount: this.failureCount
    };
  }
}

export const automationEngine = new AutomationEngine();
