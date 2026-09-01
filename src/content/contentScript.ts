import { panelInjector } from './injectPanel';
import { logger } from '../utils/logger';

function isIvacTargetWebsite(): boolean {
  const host = window.location.hostname.toLowerCase();
  return host === 'appointment.ivacbd.com' || host.endsWith('.ivacbd.com');
}

function bootstrapExtensionContentScript(): void {
  if (!isIvacTargetWebsite()) {
    return;
  }

  logger.info(`[VISA AUTOMATOR] Content script loaded on live website: ${window.location.href}`);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      panelInjector.inject();
    });
  } else {
    panelInjector.inject();
  }
}

// Execute immediately when content script loads
bootstrapExtensionContentScript();
