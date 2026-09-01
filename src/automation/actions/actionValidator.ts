import { PageType } from '../../types/page';
import { isElementVisible, isElementEnabled } from '../../utils/domHelpers';

export interface ValidationCheckResult {
  canExecute: boolean;
  reason?: string;
}

export function canExecuteAction(
  actionName: string,
  isAutomationRunning: boolean,
  currentPage: PageType,
  expectedPage: PageType,
  targetElement?: Element | null
): ValidationCheckResult {
  if (!isAutomationRunning) {
    return {
      canExecute: false,
      reason: `Cannot execute [${actionName}]: Automation is paused or stopped.`
    };
  }

  if (currentPage !== expectedPage) {
    return {
      canExecute: false,
      reason: `Cannot execute [${actionName}]: Current page (${currentPage}) does not match expected page (${expectedPage}).`
    };
  }

  if (targetElement !== undefined) {
    if (!targetElement) {
      return {
        canExecute: false,
        reason: `Cannot execute [${actionName}]: Target element was not found in DOM.`
      };
    }

    if (!isElementVisible(targetElement)) {
      return {
        canExecute: false,
        reason: `Cannot execute [${actionName}]: Target element is hidden or not visible.`
      };
    }

    if (!isElementEnabled(targetElement)) {
      return {
        canExecute: false,
        reason: `Cannot execute [${actionName}]: Target element is currently disabled.`
      };
    }
  }

  return { canExecute: true };
}
