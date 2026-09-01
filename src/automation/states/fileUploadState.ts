import { AutomationBaseState, StateExecutionContext, StateTransitionResult } from './baseState';
import { AutomationState, WorkflowStage } from '../../types/automation';
import { uploadSelectors } from '../../selectors/uploadSelectors';
import { findFirstMatchingElement, findAllMatchingElements } from '../../utils/domHelpers';
import { attachDocumentToInput, checkUploadStatus } from '../actions/uploadActions';
import { clickElementSafely } from '../actions/navigationActions';
import { pageDetector } from '../../content/pageDetector';
import { logger } from '../../utils/logger';

export class FileUploadState implements AutomationBaseState {
  readonly name = 'FILE_UPLOAD';
  readonly stage: WorkflowStage = 6;
  readonly automationState: AutomationState = 'RUNNING';

  enter(): void {
    logger.info('Stage 6: Document Upload processing...');
  }

  async execute(context: StateExecutionContext): Promise<StateTransitionResult> {
    const status = checkUploadStatus(context.doc);
    if (status === 'success') {
      logger.success('Documents confirmed uploaded.');
      if (context.settings.autoNavigation) {
        clickElementSafely(uploadSelectors.confirmProceedButton, context.doc);
      }
      return {
        nextStateName: 'APPLICANT_CONFIRMATION',
        stageOverride: 7,
        delayMs: 800
      };
    }

    if (status === 'error') {
      logger.error('Document upload error reported by portal.');
      return {
        nextStateName: 'FILE_UPLOAD',
        stageOverride: 6,
        delayMs: 2000,
        message: 'Upload failed. Please check document requirements.'
      };
    }

    // Auto upload files if enabled and files exist in queue
    if (context.settings.autoUpload && context.applicantDocs.length > 0) {
      const primaryDoc = context.applicantDocs.find((d) => d.isPrimary) || context.applicantDocs[0];
      const fileInput = findFirstMatchingElement<HTMLInputElement>(uploadSelectors.primaryFileInput, context.doc);

      if (fileInput && primaryDoc && primaryDoc.fileData) {
        attachDocumentToInput(fileInput, primaryDoc);
      }

      // Additional applicants
      const additionalDocs = context.applicantDocs.filter((d) => !d.isPrimary);
      const additionalInputs = findAllMatchingElements<HTMLInputElement>(uploadSelectors.additionalFileInput, context.doc);

      additionalDocs.forEach((doc, idx) => {
        if (additionalInputs[idx] && doc.fileData) {
          attachDocumentToInput(additionalInputs[idx], doc);
        }
      });

      if (context.settings.autoNavigation) {
        clickElementSafely(uploadSelectors.confirmProceedButton, context.doc);
      }
    }

    const detection = pageDetector.detect(context.doc, context.location);
    if (detection.pageType !== 'FILE_UPLOAD_PAGE') {
      return {
        nextStateName: 'DETECT_PAGE',
        delayMs: 600,
        message: 'File upload step completed.'
      };
    }

    return {
      nextStateName: 'APPLICANT_CONFIRMATION',
      stageOverride: 7,
      delayMs: 1200
    };
  }

  exit(): void {}
  cancel(): void {}
}
