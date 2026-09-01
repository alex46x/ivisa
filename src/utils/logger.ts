import { LogEntry, LogLevel } from '../types/automation';

type LogListener = (logs: LogEntry[]) => void;

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 500;
  private listeners: Set<LogListener> = new Set();

  private maskSensitiveText(text: string): string {
    if (!text) return '';
    // Mask passwords, tokens, OTP codes, card numbers
    return text
      .replace(/(password\s*[:=]\s*)([^\s,]+)/gi, '$1********')
      .replace(/(otp\s*[:=]\s*)(\d{3,8})/gi, '$1***')
      .replace(/(card|cvv|token\s*[:=]\s*)([^\s,]+)/gi, '$1********')
      .replace(/(\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b)/g, '****-****-****-****');
  }

  private addEntry(level: LogLevel, message: string, details?: Record<string, unknown>): LogEntry {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString(),
      isoTime: Date.now(),
      level,
      message: this.maskSensitiveText(message),
      details: details ? JSON.parse(JSON.stringify(details)) : undefined
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    this.notify();
    return entry;
  }

  public info(message: string, details?: Record<string, unknown>): LogEntry {
    return this.addEntry('INFO', message, details);
  }

  public success(message: string, details?: Record<string, unknown>): LogEntry {
    return this.addEntry('SUCCESS', message, details);
  }

  public warning(message: string, details?: Record<string, unknown>): LogEntry {
    return this.addEntry('WARNING', message, details);
  }

  public error(message: string, details?: Record<string, unknown>): LogEntry {
    return this.addEntry('ERROR', message, details);
  }

  public action(message: string, details?: Record<string, unknown>): LogEntry {
    return this.addEntry('ACTION', message, details);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clear(): void {
    this.logs = [];
    this.notify();
  }

  public subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    listener(this.getLogs());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const current = this.getLogs();
    this.listeners.forEach((listener) => {
      try {
        listener(current);
      } catch (err) {
        console.error('Error in log listener:', err);
      }
    });
  }

  public exportJSON(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  public exportTXT(): string {
    return this.logs
      .map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`)
      .join('\n');
  }
}

export const logger = new Logger();
