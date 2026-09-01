import { describe, it, expect } from 'vitest';
import { StateMachine } from '../src/automation/stateMachine';
import { DEFAULT_SETTINGS } from '../src/config/appConfig';
import { StateExecutionContext } from '../src/automation/states/baseState';

describe('StateMachine & Transitions', () => {
  const dummyContext: StateExecutionContext = {
    settings: DEFAULT_SETTINGS,
    applicantDocs: [],
    doc: {} as Document,
    location: { href: 'https://appointment.ivacbd.com/login' } as Location,
    rotateOffset: 0,
    failureCount: 0
  };

  it('should initialize in IDLE state with all stages not-started', () => {
    const sm = new StateMachine();
    const ctx = sm.getContext();

    expect(ctx.state).toBe('IDLE');
    expect(ctx.currentStage).toBe(1);
    expect(ctx.stageStatuses[1]).toBe('not-started');
    expect(ctx.stageStatuses[9]).toBe('not-started');
  });

  it('should transition to Login and update context and stage status', async () => {
    const sm = new StateMachine();
    await sm.transitionTo('LOGIN', dummyContext, 1);

    const ctx = sm.getContext();
    expect(ctx.state).toBe('RUNNING');
    expect(ctx.currentStage).toBe(1);
    expect(ctx.stageStatuses[1]).toBe('current');
  });

  it('should mark WAITING_FOR_USER state as waiting color state', async () => {
    const sm = new StateMachine();
    await sm.transitionTo('WAIT_FOR_USER_VERIFICATION', dummyContext, 2);

    const ctx = sm.getContext();
    expect(ctx.state).toBe('WAITING_FOR_USER');
    expect(ctx.currentStage).toBe(2);
    expect(ctx.stageStatuses[1]).toBe('completed');
    expect(ctx.stageStatuses[2]).toBe('waiting');
  });

  it('should immediately stop and cancel upon stop() command', async () => {
    const sm = new StateMachine();
    await sm.transitionTo('APPOINTMENT_CHECK', dummyContext, 8);

    sm.stop();
    const ctx = sm.getContext();
    expect(ctx.state).toBe('STOPPED');
    expect(sm.getCurrentState().name).toBe('IDLE');
    expect(ctx.activity.currentAction).toContain('stopped');
  });

  it('should handle pause and resume properly', async () => {
    const sm = new StateMachine();
    await sm.transitionTo('LOGIN', dummyContext, 1);

    sm.pause();
    expect(sm.getContext().state).toBe('PAUSED');

    sm.updateState('RUNNING');
    expect(sm.getContext().state).toBe('RUNNING');
  });
});
