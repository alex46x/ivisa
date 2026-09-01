import { AutomationSettings } from '../types/settings';
import { DEFAULT_SETTINGS, APP_CONFIG } from '../config/appConfig';
import { storageAdapter } from './storageAdapter';

const SETTINGS_KEY = 'visa_automator_settings';
const POSITION_KEY = 'visa_automator_panel_pos';

export interface PanelPosition {
  x: number;
  y: number;
}

export const settingsStorage = {
  async getSettings(): Promise<AutomationSettings> {
    const saved = await storageAdapter.get<Partial<AutomationSettings>>(SETTINGS_KEY, {});
    return {
      ...DEFAULT_SETTINGS,
      ...saved
    };
  },

  async saveSettings(settings: AutomationSettings): Promise<void> {
    // If rememberCredentialsLocally is false, avoid persisting sensitive password to storage
    const toSave = { ...settings };
    if (!toSave.rememberCredentialsLocally) {
      delete toSave.password;
    }
    await storageAdapter.set(SETTINGS_KEY, toSave);
  },

  async getPanelPosition(): Promise<PanelPosition> {
    return await storageAdapter.get<PanelPosition>(POSITION_KEY, APP_CONFIG.DEFAULT_PANEL_POSITION);
  },

  async savePanelPosition(position: PanelPosition): Promise<void> {
    await storageAdapter.set(POSITION_KEY, position);
  },

  async clearAllData(): Promise<void> {
    await storageAdapter.clear();
  }
};
