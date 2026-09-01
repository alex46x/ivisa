/**
 * DOM Helper Utilities for Defensive Element Querying & Interaction
 */

/**
 * Custom selector matcher supporting standard CSS selectors and text pseudo-selectors like :has-text("...")
 */
function querySelectorWithPolyfill(selector: string, root: Document | Element = document): Element | null {
  const hasTextMatch = selector.match(/^(.*?):has-text\("([^"]+)"\)$/);
  if (hasTextMatch) {
    const baseSelector = hasTextMatch[1].trim() || '*';
    const targetText = hasTextMatch[2].trim().toLowerCase();
    const candidates = root.querySelectorAll(baseSelector);
    for (const el of Array.from(candidates)) {
      if (el.textContent && el.textContent.toLowerCase().includes(targetText)) {
        return el;
      }
    }
    return null;
  }

  try {
    return root.querySelector(selector);
  } catch {
    return null;
  }
}

function querySelectorAllWithPolyfill(selector: string, root: Document | Element = document): Element[] {
  const hasTextMatch = selector.match(/^(.*?):has-text\("([^"]+)"\)$/);
  if (hasTextMatch) {
    const baseSelector = hasTextMatch[1].trim() || '*';
    const targetText = hasTextMatch[2].trim().toLowerCase();
    const candidates = root.querySelectorAll(baseSelector);
    return Array.from(candidates).filter(
      (el) => el.textContent && el.textContent.toLowerCase().includes(targetText)
    );
  }

  try {
    return Array.from(root.querySelectorAll(selector));
  } catch {
    return [];
  }
}

/**
 * Searches for the first matching element using a prioritized array of fallback selectors.
 */
export function findFirstMatchingElement<T extends Element = HTMLElement>(
  selectors: string[],
  root: Document | Element = document
): T | null {
  for (const selector of selectors) {
    const el = querySelectorWithPolyfill(selector, root);
    if (el) {
      return el as T;
    }
  }
  return null;
}

/**
 * Searches for all matching elements using a list of selectors, deduplicated.
 */
export function findAllMatchingElements<T extends Element = HTMLElement>(
  selectors: string[],
  root: Document | Element = document
): T[] {
  const found = new Set<T>();
  for (const selector of selectors) {
    const elements = querySelectorAllWithPolyfill(selector, root);
    elements.forEach((el) => found.add(el as T));
  }
  return Array.from(found);
}

/**
 * Checks if an element is visible in the viewport and not hidden by styles.
 */
export function isElementVisible(element: Element | null): boolean {
  if (!element || !(element instanceof HTMLElement)) return false;
  
  const style = window.getComputedStyle(element);
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0' ||
    element.offsetParent === null && style.position !== 'fixed'
  ) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/**
 * Checks if an interactive element is enabled and not marked as disabled or aria-disabled.
 */
export function isElementEnabled(element: Element | null): boolean {
  if (!element) return false;
  if (!isElementVisible(element)) return false;

  if (element instanceof HTMLInputElement ||
      element instanceof HTMLButtonElement ||
      element instanceof HTMLSelectElement ||
      element instanceof HTMLTextAreaElement) {
    if (element.disabled) return false;
  }

  const ariaDisabled = element.getAttribute('aria-disabled');
  if (ariaDisabled === 'true') return false;

  if (element.classList.contains('disabled') || element.classList.contains('btn-disabled')) {
    return false;
  }

  return true;
}

/**
 * Safely dispatches input and change events for React/Angular/Vue controlled inputs.
 */
export function setNativeInputValue(
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string
): void {
  const lastValue = input.value;
  input.value = value;

  // React 16+ input tracker trigger
  const tracker = (input as any)._valueTracker;
  if (tracker) {
    tracker.setValue(lastValue);
  }

  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
