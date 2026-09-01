import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '../ui/App';
import stylesText from '../ui/styles.css?inline';

const HOST_ELEMENT_ID = 'visa-automator-shadow-host';

export class PanelInjector {
  private hostElement: HTMLElement | null = null;
  private reactRoot: ReactDOM.Root | null = null;

  public inject(): void {
    // Prevent duplicate injection
    if (document.getElementById(HOST_ELEMENT_ID)) {
      return;
    }

    // Create transparent host container attached to root DOM
    this.hostElement = document.createElement('div');
    this.hostElement.id = HOST_ELEMENT_ID;
    this.hostElement.style.position = 'fixed';
    this.hostElement.style.top = '0';
    this.hostElement.style.left = '0';
    this.hostElement.style.width = '0';
    this.hostElement.style.height = '0';
    this.hostElement.style.zIndex = '2147483647';
    this.hostElement.style.pointerEvents = 'none';

    // Create isolated Shadow Root to protect against website stylesheet conflicts
    const shadowRoot = this.hostElement.attachShadow({ mode: 'open' });

    // Inject compiled CSS directly into Shadow DOM
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      ${stylesText}
      .va-panel-container, button, input, select, a {
        pointer-events: auto !important;
      }
    `;
    shadowRoot.appendChild(styleTag);

    // Create mount point for React App
    const appMount = document.createElement('div');
    appMount.id = 'visa-automator-app-root';
    shadowRoot.appendChild(appMount);

    // Append to live website document body
    (document.body || document.documentElement).appendChild(this.hostElement);

    // Mount React floating dashboard
    this.reactRoot = ReactDOM.createRoot(appMount);
    this.reactRoot.render(React.createElement(App));
  }

  public remove(): void {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    if (this.hostElement && this.hostElement.parentNode) {
      this.hostElement.parentNode.removeChild(this.hostElement);
      this.hostElement = null;
    }
  }
}

export const panelInjector = new PanelInjector();
