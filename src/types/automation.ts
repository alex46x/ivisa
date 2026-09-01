import { PageType } from './page';

export type AutomationState =
  | 'IDLE'
  | 'RUNNING'
  | 'PAUSED'
  | 'WAITING_FOR_USER'
  | 'STOPPED'
  | 'ERROR'
  | 'COMPLETED';

export type WorkflowStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type StageColorState =
  | 'not-started'
  | 'current'
  | 'completed'
  | 'waiting'
  | 'error';

export interface StageDefinition {
  id: WorkflowStage;
  label: string;
  shortName: string;
  associatedPage: PageType;
}

export interface AutomationStats {
  attempts: number;
  cycles: number;
  datesFound: number;
  status: AutomationState;
}

export interface ActivityInfo {
  currentPage: string;
  currentAction: string;
  preferredDate: string;
  availableDates: string;
  lastCheck: string;
  nextCheck: string;
}

export type LogLevel = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ACTION';

export interface LogEntry {
  id: string;
  timestamp: string;
  isoTime: number;
  level: LogLevel;
  message: string;
  details?: Record<string, unknown>;
}

export interface StateMachineContext {
  state: AutomationState;
  currentStage: WorkflowStage;
  stageStatuses: Record<WorkflowStage, StageColorState>;
  pageType: PageType;
  stats: AutomationStats;
  activity: ActivityInfo;
  errorMessage?: string;
  suggestedAction?: string;
}
