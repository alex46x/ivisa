import { missionCenterSelectors, generalSelectors } from '../../selectors/appointmentSelectors';
import { findFirstMatchingElement, findAllMatchingElements, setNativeInputValue, isElementEnabled } from '../../utils/domHelpers';
import { logger } from '../../utils/logger';

export function selectDropdownOption(
  selectElement: HTMLSelectElement,
  valueOrText: string
): boolean {
  if (!selectElement || !valueOrText) return false;

  const targetLower = valueOrText.toLowerCase().trim();
  let matchedIndex = -1;

  for (let i = 0; i < selectElement.options.length; i++) {
    const opt = selectElement.options[i];
    if (
      opt.value.toLowerCase() === targetLower ||
      opt.text.toLowerCase().includes(targetLower)
    ) {
      matchedIndex = i;
      break;
    }
  }

  if (matchedIndex >= 0) {
    selectElement.selectedIndex = matchedIndex;
    setNativeInputValue(selectElement, selectElement.options[matchedIndex].value);
    return true;
  }

  return false;
}

export function autoSelectMission(missionValue: string, doc: Document = document): boolean {
  const missionSelect = findFirstMatchingElement<HTMLSelectElement>(
    missionCenterSelectors.missionSelect,
    doc
  );
  if (missionSelect && isElementEnabled(missionSelect)) {
    const success = selectDropdownOption(missionSelect, missionValue);
    if (success) {
      logger.action(`Selected Mission: "${missionValue}"`);
      return true;
    }
  }
  return false;
}

export function autoSelectCenter(centerValue: string, doc: Document = document): boolean {
  const centerSelect = findFirstMatchingElement<HTMLSelectElement>(
    missionCenterSelectors.centerSelect,
    doc
  );
  if (centerSelect && isElementEnabled(centerSelect)) {
    const success = selectDropdownOption(centerSelect, centerValue);
    if (success) {
      logger.action(`Selected IVAC Center: "${centerValue}"`);
      return true;
    }
  }
  return false;
}

export function clickElementSafely(selectors: string[], doc: Document = document): boolean {
  const btn = findFirstMatchingElement<HTMLElement>(selectors, doc);
  if (btn && isElementEnabled(btn)) {
    btn.click();
    return true;
  }
  return false;
}

export function closeNonCriticalPopups(doc: Document = document): number {
  const closeButtons = findAllMatchingElements<HTMLElement>(
    generalSelectors.popupCloseButtons,
    doc
  );
  let closedCount = 0;
  for (const btn of closeButtons) {
    if (isElementEnabled(btn)) {
      btn.click();
      closedCount++;
    }
  }
  if (closedCount > 0) {
    logger.info(`Dismissed ${closedCount} non-critical modal popup(s).`);
  }
  return closedCount;
}
