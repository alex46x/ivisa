export type PriorityMode = 'strict' | 'rotate';

export interface MissionOption {
  value: string;
  label: string;
  centers: Array<{ value: string; label: string }>;
}

export interface AutomationSettings {
  mission: string;
  ivacCenter: string;
  preferredDates: string[];
  priorityMode: PriorityMode;
  checkInterval: number; // in seconds (minimum 60s safe default)
  maxBackoffDelay: number; // in minutes (default: 10m)
  
  // Feature toggles
  autoSignIn: boolean;
  autoNavigation: boolean;
  autoClosePopups: boolean;
  autoUpload: boolean;
  autoMission: boolean;
  autoCenter: boolean;
  conservativeCheck: boolean;

  // Credential storage preference
  rememberCredentialsLocally: boolean;
  phone: string;
  password?: string;
}

export interface StoredSessionData {
  lastActiveStage: number;
  lastKnownUrl: string;
  savedAt: number;
  attemptsCount: number;
  cyclesCount: number;
}
