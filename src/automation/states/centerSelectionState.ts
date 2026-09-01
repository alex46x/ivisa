import { AutomationBaseState, StateExecutionContext, StateTransitionResult } from './baseState';
import { AutomationState, WorkflowStage } from '../../types/automation';
import { autoSelectCenter, clickElementSafely } from '../actions/navigationActions';
import { missionCenterSelectors } from '../../selectors/appointmentSelectors';
import { pageDetector } from '../../content/pageDetector';
import { logger } from '../../utils/logger';

export class CenterSelectionState implements AutomationBaseState {
  readonly name = 'CENTER_SELECTION';
  readonly stage: WorkflowStage = 5;
  readonly automationState: AutomationState = 'RUNNING';

  enter(): void {
    logger.info('Stage 5: IVAC Center Selection...');
  }

  async execute(context: StateExecutionContext): Promise<StateTransitionResult> {
    if (context.settings.autoCenter && context.settings.ivacCenter) {
      autoSelectCenter(context.settings.ivacCenter, context.doc);
    }

    if (context.settings.autoNavigation) {
      clickElementSafely(missionCenterSelectors.continueButton, context.doc);
    }

    const detection = pageDetector.detect(context.doc, context.location);
    if (detection.pageType !== 'CENTER_SELECTION_PAGE') {
      return {
        nextStateName: 'DETECT_PAGE',
        delayMs: 600,
        message: 'Center selection completed. Advancing to Document Upload...'
      };
    }

    return {
      nextStateName: 'FILE_UPLOAD',
      stageOverride: 6,
      delayMs: 800
    };
  }

  exit(): void {}
  cancel(): void {}
}
