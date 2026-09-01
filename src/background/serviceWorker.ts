/**
 * VISA AUTOMATOR - Background Service Worker (Manifest V3)
 * Manages extension lifecycle, message routing, and tab communication.
 */

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[VISA AUTOMATOR] Extension installed successfully.');
  } else if (details.reason === 'update') {
    console.log(`[VISA AUTOMATOR] Extension updated to version ${chrome.runtime.getManifest().version}.`);
  }
});

// Optional action click listener to focus or inject panel into target tab
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url) return;

  const isTargetSite = tab.url.includes('ivacbd.com') || tab.url.includes('localhost') || tab.url.includes('127.0.0.1');

  if (isTargetSite) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const host = document.getElementById('visa-automator-shadow-host');
          if (host) {
            host.style.display = host.style.display === 'none' ? 'block' : 'none';
          }
        }
      });
    } catch (err) {
      console.warn('[VISA AUTOMATOR] Script injection error:', err);
    }
  }
});

// Runtime messaging router
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ status: 'PONG', timestamp: Date.now() });
  }
  return true;
});
