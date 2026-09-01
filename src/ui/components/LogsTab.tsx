import React, { useState, useEffect } from 'react';
import { LogEntry } from '../../types/automation';
import { logger } from '../../utils/logger';

export const LogsTab: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const unsubscribe = logger.subscribe((updated) => {
      setLogs(updated);
    });
    return () => unsubscribe();
  }, []);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(logger.exportJSON());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `visa-automator-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportTXT = () => {
    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(logger.exportTXT());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `visa-automator-logs-${Date.now()}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredLogs = logs.filter((log) => {
    if (levelFilter !== 'ALL' && log.level !== levelFilter) {
      return false;
    }
    if (searchQuery) {
      return log.message.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div>
      {/* Logs Controls */}
      <div className="va-logs-toolbar">
        <select
          className="va-select"
          style={{ width: '110px' }}
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
        >
          <option value="ALL">All Levels</option>
          <option value="INFO">INFO</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="WARNING">WARNING</option>
          <option value="ERROR">ERROR</option>
          <option value="ACTION">ACTION</option>
        </select>

        <input
          type="text"
          className="va-input"
          style={{ flex: 1 }}
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        <button
          type="button"
          className="va-btn va-btn-secondary"
          style={{ flex: 1, padding: '5px 8px', fontSize: '11px' }}
          onClick={handleExportJSON}
        >
          ⬇ Export JSON
        </button>
        <button
          type="button"
          className="va-btn va-btn-secondary"
          style={{ flex: 1, padding: '5px 8px', fontSize: '11px' }}
          onClick={handleExportTXT}
        >
          ⬇ Export TXT
        </button>
        <button
          type="button"
          className="va-btn va-btn-secondary"
          style={{ padding: '5px 8px', fontSize: '11px', color: '#ef4444' }}
          onClick={() => logger.clear()}
        >
          Clear
        </button>
      </div>

      {/* Logs Scrollable Stream */}
      <div className="va-logs-container">
        {filteredLogs.length === 0 ? (
          <div style={{ color: '#64748b', textAlign: 'center', paddingTop: '40px' }}>
            No logs available
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="va-log-item">
              <span className="va-log-time">{log.timestamp}</span>
              <span className={`va-log-level ${log.level}`}>[{log.level}]</span>
              <span className="va-log-msg">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
