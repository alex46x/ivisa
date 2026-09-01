type DOMChangeCallback = () => void;

export class DOMObserver {
  private observer: MutationObserver | null = null;
  private listeners: Set<DOMChangeCallback> = new Set();
  private debounceTimer: number | null = null;
  private lastUrl: string = '';
  private isListening = false;

  constructor() {
    this.handleMutation = this.handleMutation.bind(this);
    this.checkUrlChange = this.checkUrlChange.bind(this);
  }

  public start(): void {
    if (this.isListening) return;
    this.isListening = true;
    this.lastUrl = window.location.href;

    // Start MutationObserver on document.body
    if (typeof document !== 'undefined' && document.body) {
      this.observer = new MutationObserver(this.handleMutation);
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'disabled', 'data-status']
      });
    }

    // Monitor URL / Navigation changes
    window.addEventListener('popstate', this.checkUrlChange);
    window.addEventListener('hashchange', this.checkUrlChange);

    // Intercept pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      originalPushState.apply(history, args);
      this.checkUrlChange();
    };

    history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
      originalReplaceState.apply(history, args);
      this.checkUrlChange();
    };
  }

  public subscribe(callback: DOMChangeCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private handleMutation(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
    // Debounce 250ms to avoid hammering during bulk DOM updates
    this.debounceTimer = window.setTimeout(() => {
      this.notify();
    }, 250);
  }

  private checkUrlChange(): void {
    if (window.location.href !== this.lastUrl) {
      this.lastUrl = window.location.href;
      this.notify();
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in DOMObserver listener:', err);
      }
    });
  }

  public stop(): void {
    if (!this.isListening) return;
    this.isListening = false;

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    window.removeEventListener('popstate', this.checkUrlChange);
    window.removeEventListener('hashchange', this.checkUrlChange);
  }
}

export const domObserver = new DOMObserver();
