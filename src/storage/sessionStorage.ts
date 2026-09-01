import { StoredSessionData } from '../types/settings';
import { storageAdapter } from './storageAdapter';

const SESSION_KEY = 'visa_automator_session';

export const sessionStorageManager = {
  async getSession(): Promise<StoredSessionData | null> {
    return await storageAdapter.get<StoredSessionData | null>(SESSION_KEY, null);
  },

  async saveSession(session: StoredSessionData): Promise<void> {
    await storageAdapter.set(SESSION_KEY, session);
  },

  async clearSession(): Promise<void> {
    await storageAdapter.remove(SESSION_KEY);
  }
};
