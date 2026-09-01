import React, { useState, useEffect, useRef } from 'react';
import { StateMachineContext, LogEntry } from '../types/automation';
import { AutomationSettings } from '../types/settings';
import { ApplicantDocument } from '../types/applicant';
import { stateMachine } from '../automation/stateMachine';
import { automationEngine } from '../automation/automationEngine';
import { settingsStorage, PanelPosition } from '../storage/settingsStorage';
import { DEFAULT_SETTINGS, APP_CONFIG } from '../config/appConfig';
import { logger } from '../utils/logger';
import { Header } from './components/Header';
import { ProgressTracker } from './components/ProgressTracker';
import { RunTab } from './components/RunTab';
import { ConfigTab } from './components/ConfigTab';
import { LogsTab } from './components/LogsTab';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RUN' | 'CONFIG' | 'LOGS'>('RUN');
  const [minimized, setMinimized] = useState(false);
  const [closed, setClosed] = useState(false);
  const [position, setPosition] = useState<PanelPosition>(APP_CONFIG.DEFAULT_PANEL_POSITION);
  const [context, setContext] = useState<StateMachineContext>(stateMachine.getContext());
  const [settings, setSettings] = useState<AutomationSettings>(DEFAULT_SETTINGS);
  const [applicantDocs, setApplicantDocs] = useState<ApplicantDocument[]>([]);
  const [logCount, setLogCount] = useState<number>(0);

  const isDragging = useRef(false);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    async function loadInitial() {
      const savedSettings = await settingsStorage.getSettings();
      const savedPos = await settingsStorage.getPanelPosition();
      setSettings(savedSettings);
      setPosition(savedPos);
      automationEngine.init(savedSettings);
    }
    loadInitial();

    const unsubscribeSM = stateMachine.subscribe((ctx) => {
      setContext(ctx);
    });

    const unsubscribeLogs = logger.subscribe((logs: LogEntry[]) => {
      setLogCount(logs.length);
    });

    return () => {
      unsubscribeSM();
      unsubscribeLogs();
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 320, ev.clientX - dragOffset.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 60, ev.clientY - dragOffset.current.y));
      const newPos = { x: newX, y: newY };
      setPosition(newPos);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        settingsStorage.savePanelPosition(position);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleUpdateSettings = async (newSettings: AutomationSettings) => {
    setSettings(newSettings);
    automationEngine.setSettings(newSettings);
    await settingsStorage.saveSettings(newSettings);
  };

  const handleUpdateApplicantDocs = (docs: ApplicantDocument[]) => {
    setApplicantDocs(docs);
    automationEngine.setApplicantDocs(docs);
  };

  const handleClearAllData = async () => {
    automationEngine.stop();
    await settingsStorage.clearAllData();
    stateMachine.reset();
    setSettings(DEFAULT_SETTINGS);
    setApplicantDocs([]);
    logger.info('All saved data, queue, and settings wiped.');
  };

  const getStepperSubText = () => {
    if (context.activity.currentAction && context.activity.currentAction !== 'Idle - Ready to start') {
      return context.activity.currentAction;
    }
    switch (context.currentStage) {
      case 1: return `Detected: ${context.pageType === 'LOGIN_PAGE' ? 'login' : 'unknown'}`;
      case 2: return 'Waiting for security verification...';
      case 3: return 'Waiting for the SMS OTP...';
      case 4: return 'Selecting mission...';
      case 5: return 'Selecting IVAC center...';
      case 6: return 'Uploading the webfile PDF...';
      case 7: return 'Confirming applicant details...';
      case 8: return 'Checking slot availability...';
      case 9: return 'Secure payment handoff...';
      default: return 'Detected: unknown';
    }
  };

  if (closed) {
    return (
      <button
        onClick={() => setClosed(false)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 2147483647,
          background: '#0f172a',
          color: '#f59e0b',
          border: '1px solid #334155',
          borderRadius: '20px',
          padding: '6px 12px',
          fontSize: '11px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <span>◆</span>
        <span>VISA AUTOMATOR</span>
      </button>
    );
  }

  return (
    <div
      className={`va-panel-container ${minimized ? 'minimized' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <Header
        status={context.state}
        minimized={minimized}
        onToggleMinimize={() => setMinimized(!minimized)}
        onClose={() => setClosed(true)}
        onMouseDown={handleMouseDown}
      />

      {!minimized && (
        <>
          <ProgressTracker
            currentStage={context.currentStage}
            stageStatuses={context.stageStatuses}
            subText={getStepperSubText()}
          />

          <div className="va-tabs">
            <button
              className={`va-tab ${activeTab === 'RUN' ? 'active' : ''}`}
              onClick={() => setActiveTab('RUN')}
            >
              RUN
            </button>
            <button
              className={`va-tab ${activeTab === 'CONFIG' ? 'active' : ''}`}
              onClick={() => setActiveTab('CONFIG')}
            >
              CONFIG
            </button>
            <button
              className={`va-tab ${activeTab === 'LOGS' ? 'active' : ''}`}
              onClick={() => setActiveTab('LOGS')}
            >
              LOG {logCount > 0 ? `(${logCount})` : ''}
            </button>
          </div>

          <div className="va-body">
            {activeTab === 'RUN' && (
              <RunTab
                context={context}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onStart={() => automationEngine.start()}
                onStop={() => automationEngine.stop()}
              />
            )}

            {activeTab === 'CONFIG' && (
              <ConfigTab
                settings={settings}
                applicantDocs={applicantDocs}
                onUpdateSettings={handleUpdateSettings}
                onUpdateApplicantDocs={handleUpdateApplicantDocs}
                onClearAllData={handleClearAllData}
              />
            )}

            {activeTab === 'LOGS' && <LogsTab />}
          </div>
        </>
      )}
    </div>
  );
};
