import { appointmentSelectors } from '../../selectors/appointmentSelectors';
import { findAllMatchingElements, findFirstMatchingElement, isElementEnabled, isElementVisible } from '../../utils/domHelpers';
import { normalizeDate } from '../../utils/dateMatcher';
import { logger } from '../../utils/logger';

export function extractAvailableDates(doc: Document = document): string[] {
  const dateCells = findAllMatchingElements(appointmentSelectors.availableDateCells, doc);
  const foundDates: Set<string> = new Set();

  for (const cell of dateCells) {
    if (!isElementVisible(cell)) continue;

    const dataDate = cell.getAttribute('data-date') || cell.getAttribute('data-day');
    if (dataDate) {
      foundDates.add(normalizeDate(dataDate));
      continue;
    }

    const text = cell.textContent?.trim();
    if (text) {
      const normalized = normalizeDate(text);
      if (normalized) {
        foundDates.add(normalized);
      }
    }
  }

  return Array.from(foundDates);
}

export function highlightAndSelectDate(dateStr: string, doc: Document = document): boolean {
  const selectors = appointmentSelectors.dateCellByValue(dateStr);
  const cell = findFirstMatchingElement<HTMLElement>(selectors, doc);

  if (cell && isElementEnabled(cell)) {
    cell.style.outline = '3px solid #f59e0b';
    cell.style.boxShadow = '0 0 12px rgba(245, 158, 11, 0.6)';
    cell.click();
    logger.action(`Selected available appointment date: ${dateStr}`);
    return true;
  }

  const allCells = findAllMatchingElements<HTMLElement>(appointmentSelectors.availableDateCells, doc);
  for (const c of allCells) {
    const d = c.getAttribute('data-date') || c.getAttribute('data-day') || c.textContent?.trim() || '';
    if (normalizeDate(d) === normalizeDate(dateStr) && isElementEnabled(c)) {
      c.style.outline = '3px solid #f59e0b';
      c.click();
      logger.action(`Selected available appointment date (fallback): ${dateStr}`);
      return true;
    }
  }

  return false;
}

export function selectAvailableTimeSlot(doc: Document = document): boolean {
  const slotButtons = findAllMatchingElements<HTMLElement>(appointmentSelectors.timeSlotButtons, doc);
  for (const btn of slotButtons) {
    if (isElementEnabled(btn)) {
      btn.click();
      logger.action(`Selected time slot: "${btn.textContent?.trim() || 'Default Slot'}"`);
      return true;
    }
  }
  return false;
}

export function refreshSlotAvailability(doc: Document = document): boolean {
  const refreshBtn = findFirstMatchingElement<HTMLElement>(appointmentSelectors.refreshSlotsButton, doc);
  if (refreshBtn && isElementEnabled(refreshBtn)) {
    refreshBtn.click();
    logger.action('Triggered appointment slots refresh');
    return true;
  }
  return false;
}
