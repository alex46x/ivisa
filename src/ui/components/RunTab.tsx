import React, { useState, useEffect } from 'react';
import { StateMachineContext } from '../../types/automation';
import { AutomationSettings } from '../../types/settings';
import { loginSelectors } from '../../selectors/loginSelectors';
import { findFirstMatchingElement, setNativeInputValue } from '../../utils/domHelpers';

interface RunTabProps {
  context: StateMachineContext;
  settings: AutomationSettings;
  onUpdateSettings: (settings: AutomationSettings) => void;
  onStart: () => void;
  onStop: () => void;
}

export const RunTab: React.FC<RunTabProps> = ({
  context,
  settings,
  onUpdateSettings,
  onStart,
  onStop
}) => {
  const isRunning = context.state === 'RUNNING';
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [turnstileToken, setTurnstileToken] = useState<string>('no token');

  // Check if Turnstile token is present on the real page
  useEffect(() => {
    const checkTurnstile = () => {
      const tokenInput = findFirstMatchingElement<HTMLInputElement>(loginSelectors.turnstileTokenInput);
      if (tokenInput && tokenInput.value) {
        setTurnstileToken(tokenInput.value.slice(0, 16) + '...');
      } else {
        const captchaEl = findFirstMatchingElement(loginSelectors.captchaContainer);
        if (captchaEl) {
          setTurnstileToken('waiting for solve...');
        } else {
          setTurnstileToken('no token');
        }
      }
    };

    checkTurnstile();
    const interval = setInterval(checkTurnstile, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = clean;
    setOtpDigits(updated);

    if (clean && index < 5) {
      const nextInput = document.getElementById(`va-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`va-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSendOtp = () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length === 6) {
      const pageOtpInputs = document.querySelectorAll<HTMLInputElement>('input.otp-digit, input[name^="otp"], .otp-input');
      if (pageOtpInputs.length >= 6) {
        otpDigits.forEach((digit, i) => {
          if (pageOtpInputs[i]) {
            setNativeInputValue(pageOtpInputs[i], digit);
          }
        });
      } else {
        const singleOtp = findFirstMatchingElement<HTMLInputElement>(['#otp', 'input[name="otp"]']);
        if (singleOtp) {
          setNativeInputValue(singleOtp, fullOtp);
        }
      }
    }
  };

  const getSubHelperText = () => {
    if (context.currentStage === 3) {
      return `Enter the 6-digit code sent to ${settings.phone || 'your mobile'}...`;
    }
    return 'OTP boxes unlock when the site asks for a code.';
  };

  return (
    <div>
      {/* Phone & Password Credentials Row */}
      <div className="va-creds-row">
        <div>
          <label className="va-field-label">PHONE</label>
          <input
            type="text"
            className="va-input-box"
            placeholder="01XXXXXXXXX"
            value={settings.phone}
            onChange={(e) => onUpdateSettings({ ...settings, phone: e.target.value })}
          />
        </div>

        <div>
          <label className="va-field-label">PASSWORD</label>
          <input
            type="password"
            className="va-input-box"
            placeholder="••••••••"
            value={settings.password || ''}
            onChange={(e) => onUpdateSettings({ ...settings, password: e.target.value })}
          />
        </div>
      </div>

      {/* 6 OTP digit inputs + SEND OTP button */}
      <div className="va-otp-row">
        <div className="va-otp-boxes-group">
          {otpDigits.map((digit, idx) => (
            <input
              key={idx}
              id={`va-otp-${idx}`}
              type="text"
              className="va-otp-box"
              maxLength={1}
              value={digit}
              autoComplete="off"
              onChange={(e) => handleOtpChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
            />
          ))}
        </div>
        <button
          type="button"
          className="va-btn-send-otp"
          onClick={handleSendOtp}
          disabled={otpDigits.join('').length !== 6}
        >
          SEND OTP
        </button>
      </div>
      <div className="va-sub-helper">{getSubHelperText()}</div>

      {/* Main Action Buttons */}
      <div className="va-action-buttons">
        {isRunning ? (
          <button type="button" className="va-main-btn va-btn-running" disabled>
            ● RUNNING
          </button>
        ) : (
          <button type="button" className="va-main-btn va-btn-start" onClick={onStart}>
            ▶ START
          </button>
        )}

        <button type="button" className="va-main-btn va-btn-stop-main" onClick={onStop}>
          ■ STOP
        </button>
      </div>

      {/* 4 Dashboard Metric Cards */}
      <div className="va-metrics-bar">
        <div className="va-metric-card">
          <div className="va-metric-num">{context.stats.attempts}</div>
          <div className="va-metric-label">ATTEMPTS</div>
        </div>

        <div className="va-metric-card">
          <div className="va-metric-num">{context.stats.cycles}</div>
          <div className="va-metric-label">CYCLE</div>
        </div>

        <div className="va-metric-card">
          <div className="va-metric-num">{context.stats.datesFound}</div>
          <div className="va-metric-label">DATES</div>
        </div>

        <div className="va-metric-card">
          <div className="va-metric-num" style={{ fontSize: '11px' }}>
            {context.activity.nextCheck === 'None' ? '—' : context.activity.nextCheck}
          </div>
          <div className="va-metric-label">NEXT IN</div>
        </div>
      </div>

      {/* Telemetry Status Table */}
      <div className="va-status-table">
        <div className="va-status-line">
          <span className="va-status-label">Trying</span>
          <span className="va-status-value">
            {settings.preferredDates.length > 0 ? settings.preferredDates.join(', ') : '—'}
          </span>
        </div>

        <div className="va-status-line">
          <span className="va-status-label">Available</span>
          <span className="va-status-value">
            {context.activity.availableDates === 'None' ? '—' : context.activity.availableDates}
          </span>
        </div>

        <div className="va-status-line">
          <span className="va-status-label">Turnstile</span>
          <span className="va-status-value" style={{ color: turnstileToken !== 'no token' && turnstileToken !== 'waiting for solve...' ? '#10b981' : '#64748b' }}>
            {turnstileToken}
          </span>
        </div>
      </div>

      {/* Payment Gateway Box */}
      <div className="va-payment-box">
        <div className="va-payment-header">
          <span>💳 Payment gateway</span>
          <button
            type="button"
            className="va-payment-link-btn"
            onClick={() => {
              window.open('https://appointment.ivacbd.com/payment', '_blank');
            }}
          >
            OPEN
          </button>
        </div>
        <input
          type="text"
          className="va-payment-url-input"
          readOnly
          placeholder="webview_url appears here on capture"
        />
      </div>
    </div>
  );
};
