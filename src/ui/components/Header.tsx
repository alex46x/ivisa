import React from 'react';
import { AutomationState } from '../../types/automation';

interface HeaderProps {
  status: AutomationState;
  minimized: boolean;
  onToggleMinimize: () => void;
  onClose: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  minimized,
  onToggleMinimize,
  onClose,
  onMouseDown
}) => {
  return (
    <div>
      {/* Top drag handle */}
      <div className="va-drag-bar" onMouseDown={onMouseDown}>
        <div className="va-drag-title">
          <span>⠿</span>
          <span>◆ VISA AUTOMATOR</span>
          <span style={{ fontSize: '9.5px', color: '#64748b' }}>drag me</span>
        </div>

        <div className="va-window-controls">
          <button
            className="va-control-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMinimize();
            }}
            title={minimized ? 'Expand' : 'Minimize'}
          >
            {minimized ? '□' : '—'}
          </button>
          <button
            className="va-control-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Close Panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Sub-header */}
      {!minimized && (
        <div className="va-subheader">
          <div className="va-brand-badge">
            <span className="va-brand-diamond">◆</span>
            <span>VISA AUTOMATOR</span>
            <span className="va-brand-version">Free</span>
          </div>

          <div className="va-engine-pill">
            <div className={`va-engine-dot ${status === 'RUNNING' ? 'running' : ''}`} />
            <span>{status === 'RUNNING' ? 'running' : 'engine ready'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
