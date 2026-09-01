import { AutomationBaseState, StateExecutionContext, StateTransitionResult } from './baseState';
import { AutomationState, WorkflowStage } from '../../types/automation';
import { autoSelectMission, clickElementSafely, closeNonCriticalPopups } from '../actions/navigationActions';
import { missionCenterSelectors } from '../../selectors/appointmentSelectors';
import { pageDetector } from '../../content/pageDetector';
import { logger } from '../../utils/logger';

export class MissionSelectionState implements AutomationBaseState {
  readonly name = 'MISSION_SELECTION';
  readonly stage: WorkflowStage = 4;
  readonly automationState: AutomationState = 'RUNNING';

  enter(): void {
    logger.info('Stage 4: Mission Selection...');
  }

  async execute(context: StateExecutionContext): Promise<StateTransitionResult> {
    if (context.settings.autoClosePopups) {
      closeNonCriticalPopups(context.doc);
    }

    if (context.settings.autoMission && context.settings.mission) {
      autoSelectMission(context.settings.mission, context.doc);
    }

    if (context.settings.autoNavigation) {
      clickElementSafely(missionCenterSelectors.continueButton, context.doc);
    }

    const detection = pageDetector.detect(context.doc, context.location);
    if (detection.pageType !== 'MISSION_SELECTION_PAGE') {
      return {
        nextStateName: 'DETECT_PAGE',
        delayMs: 600,
        message: 'Mission selection completed. Proceeding to Center selection...'
      };
    }

    return {
      nextStateName: 'CENTER_SELECTION',
      stageOverride: 5,
      delayMs: 800
    };
  }

  exit(): void {}
  cancel(): void {}
}
