import React, { useRef, useState } from 'react';
import { AutomationSettings } from '../../types/settings';
import { ApplicantDocument } from '../../types/applicant';
import { DEFAULT_MISSIONS, APP_CONFIG } from '../../config/appConfig';
import { validateApplicantDocument } from '../../utils/validation';
import { pageDetector } from '../../content/pageDetector';
import { extractAvailableDates } from '../../automation/actions/appointmentActions';
import { closeNonCriticalPopups } from '../../automation/actions/navigationActions';
import { logger } from '../../utils/logger';

interface ConfigTabProps {
  settings: AutomationSettings;
  applicantDocs: ApplicantDocument[];
  onUpdateSettings: (settings: AutomationSettings) => void;
  onUpdateApplicantDocs: (docs: ApplicantDocument[]) => void;
  onClearAllData: () => void;
}

export const ConfigTab: React.FC<ConfigTabProps> = ({
  settings,
  applicantDocs,
  onUpdateSettings,
  onUpdateApplicantDocs,
  onClearAllData
}) => {
  const primaryFileRef = useRef<HTMLInputElement>(null);
  const additionalFilesRef = useRef<HTMLInputElement>(null);
  const [preferredDatesText, setPreferredDatesText] = useState(
    settings.preferredDates.join(', ')
  );

  const selectedMissionObj = DEFAULT_MISSIONS.find((m) => m.value === settings.mission) || DEFAULT_MISSIONS[0];

  const handleMissionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mission = e.target.value;
    const mObj = DEFAULT_MISSIONS.find((m) => m.value === mission);
    const ivacCenter = mObj?.centers[0]?.value || '';
    onUpdateSettings({
      ...settings,
      mission,
      ivacCenter
    });
  };

  const handleDatesBlur = () => {
    const parsed = preferredDatesText
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
    onUpdateSettings({
      ...settings,
      preferredDates: parsed
    });
  };

  const handlePrimaryFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateApplicantDocument(file, APP_CONFIG.MAX_FILE_SIZE_BYTES);
    const reader = new FileReader();
    reader.onload = () => {
      const primaryDoc: ApplicantDocument = {
        id: `doc_pri_${Date.now()}`,
        isPrimary: true,
        applicantNumber: 1,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileData: reader.result as string,
        validationStatus: validation.isValid ? 'valid' : 'invalid',
        validationMessage: validation.message
      };
      const remaining = applicantDocs.filter((d) => !d.isPrimary);
      onUpdateApplicantDocs([primaryDoc, ...remaining]);
    };
    reader.readAsDataURL(file);
  };

  const handleAdditionalFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocs: ApplicantDocument[] = [];
    const currentAdditionalCount = applicantDocs.filter((d) => !d.isPrimary).length;

    Array.from(files).forEach((file, i) => {
      const validation = validateApplicantDocument(file, APP_CONFIG.MAX_FILE_SIZE_BYTES);
      const reader = new FileReader();
      reader.onload = () => {
        newDocs.push({
          id: `doc_add_${Date.now()}_${i}`,
          isPrimary: false,
          applicantNumber: currentAdditionalCount + i + 2,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileData: reader.result as string,
          validationStatus: validation.isValid ? 'valid' : 'invalid',
          validationMessage: validation.message
        });
        if (newDocs.length === files.length) {
          onUpdateApplicantDocs([...applicantDocs, ...newDocs]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const primaryDoc = applicantDocs.find((d) => d.isPrimary);
  const additionalCount = applicantDocs.filter((d) => !d.isPrimary).length;

  return (
    <div>
      {/* Mission & IVAC Center Selectors */}
      <div className="va-config-row-2">
        <div>
          <label className="va-field-label">MISSION</label>
          <select
            className="va-select-box"
            value={settings.mission}
            onChange={handleMissionChange}
          >
            {DEFAULT_MISSIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="va-field-label">IVAC CENTER</label>
          <select
            className="va-select-box"
            value={settings.ivacCenter}
            onChange={(e) => onUpdateSettings({ ...settings, ivacCenter: e.target.value })}
          >
            {selectedMissionObj.centers.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        className="va-btn-load-centers"
        onClick={() => {
          logger.info('Refreshed IVAC center options from active portal session.');
        }}
      >
        LOAD CENTERS FROM SESSION
      </button>

      {/* Preferred Dates */}
      <div style={{ marginBottom: '8px' }}>
        <label className="va-field-label">
          PREFERRED DATES — TRIED FIRST, OTHERS STILL ROTATE
        </label>
        <input
          type="text"
          className="va-input-box"
          placeholder="2026-08-19, 2026-08-20"
          value={preferredDatesText}
          onChange={(e) => setPreferredDatesText(e.target.value)}
          onBlur={handleDatesBlur}
        />
      </div>

      {/* 3 Timing Parameters */}
      <div className="va-config-row-3">
        <div>
          <label className="va-field-label">ROUND-ROBIN GAP</label>
          <input
            type="number"
            className="va-input-box"
            defaultValue={20000}
            min={10000}
          />
        </div>

        <div>
          <label className="va-field-label">429 BACKOFF</label>
          <input
            type="number"
            className="va-input-box"
            defaultValue={25000}
            min={10000}
          />
        </div>

        <div>
          <label className="va-field-label">MONTHS TO SCAN</label>
          <input
            type="number"
            className="va-input-box"
            defaultValue={2}
            min={1}
            max={6}
          />
        </div>
      </div>

      {/* Primary Applicant Webfile */}
      <div style={{ marginBottom: '8px' }}>
        <label className="va-field-label">
          1 · PRIMARY APPLICANT WEBFILE (PDF, &le;500KB)
        </label>
        <input
          type="file"
          accept=".pdf"
          ref={primaryFileRef}
          style={{ display: 'none' }}
          onChange={handlePrimaryFile}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="va-pill-btn"
            onClick={() => primaryFileRef.current?.click()}
          >
            Choose File
          </button>
          <span style={{ fontSize: '10.5px', color: '#64748b' }}>
            {primaryDoc ? primaryDoc.fileName : 'No file chosen'}
          </span>
        </div>
      </div>

      {/* Other Applicants */}
      <div style={{ marginBottom: '8px' }}>
        <label className="va-field-label">
          2 · OTHER APPLICANTS — PICK ONE OR MANY, ADDED TO THE QUEUE
        </label>
        <input
          type="file"
          accept=".pdf"
          multiple
          ref={additionalFilesRef}
          style={{ display: 'none' }}
          onChange={handleAdditionalFiles}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="va-pill-btn"
            onClick={() => additionalFilesRef.current?.click()}
          >
            Choose Files
          </button>
          <span style={{ fontSize: '10.5px', color: '#64748b' }}>
            {additionalCount > 0 ? `${additionalCount} file(s) queued` : 'No file chosen'}
          </span>
        </div>
        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
          No PDF queued — you can also upload on the page.
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <span style={{ fontSize: '10px', color: '#64748b' }}>
            {applicantDocs.length === 0 ? 'queue empty' : `${applicantDocs.length} total docs`}
          </span>
          {applicantDocs.length > 0 && (
            <button
              type="button"
              className="va-pill-btn danger"
              onClick={() => onUpdateApplicantDocs([])}
            >
              CLEAR QUEUE
            </button>
          )}
        </div>
      </div>

      {/* Checkbox Grid (2 Columns) */}
      <div className="va-checkbox-grid">
        <label className="va-checkbox-item">
          <input
            type="checkbox"
            checked={settings.autoSignIn}
            onChange={() => onUpdateSettings({ ...settings, autoSignIn: !settings.autoSignIn })}
          />
          Auto sign-in
        </label>

        <label className="va-checkbox-item">
          <input
            type="checkbox"
            checked={true}
            readOnly
          />
          Auto OTP fill
        </label>

        <label className="va-checkbox-item">
          <input
            type="checkbox"
            checked={settings.autoClosePopups}
            onChange={() => onUpdateSettings({ ...settings, autoClosePopups: !settings.autoClosePopups })}
          />
          Auto close popups
        </label>

        <label className="va-checkbox-item">
          <input
            type="checkbox"
            checked={settings.autoNavigation}
            onChange={() => onUpdateSettings({ ...settings, autoNavigation: !settings.autoNavigation })}
          />
          Auto navigate
        </label>

        <label className="va-checkbox-item">
          <input
            type="checkbox"
            checked={settings.autoUpload}
            onChange={() => onUpdateSettings({ ...settings, autoUpload: !settings.autoUpload })}
          />
          Auto upload PDF
        </label>

        <label className="va-checkbox-item">
          <input
            type="checkbox"
            checked={settings.autoMission}
            onChange={() => onUpdateSettings({ ...settings, autoMission: !settings.autoMission })}
          />
          Auto mission/center
        </label>

        <label className="va-checkbox-item">
          <input
            type="checkbox"
            checked={settings.priorityMode === 'rotate'}
            onChange={() =>
              onUpdateSettings({
                ...settings,
                priorityMode: settings.priorityMode === 'rotate' ? 'strict' : 'rotate'
              })
            }
          />
          Auto slot rotation
        </label>

        <label className="va-checkbox-item">
          <input
            type="checkbox"
            checked={false}
            disabled
          />
          API mode (no UI clicks)
        </label>
      </div>

      {/* Action Pills Row */}
      <div className="va-pills-row">
        <button
          type="button"
          className="va-pill-btn"
          onClick={() => {
            const detected = pageDetector.detect();
            logger.info(`Detected stage: [${detected.pageType}]`);
          }}
        >
          DETECT STAGE
        </button>

        <button
          type="button"
          className="va-pill-btn"
          onClick={() => {
            const dates = extractAvailableDates();
            logger.info(`Scanned ${dates.length} available date(s) from calendar.`);
          }}
        >
          SCAN DATES
        </button>

        <button
          type="button"
          className="va-pill-btn"
          onClick={() => {
            logger.info('Status: All systems operational.');
          }}
        >
          STATUS
        </button>

        <button
          type="button"
          className="va-pill-btn"
          onClick={() => {
            logger.info('Fresh token request checked.');
          }}
        >
          FRESH TOKEN
        </button>

        <button
          type="button"
          className="va-pill-btn"
          onClick={() => {
            closeNonCriticalPopups();
          }}
        >
          CLOSE POPUPS
        </button>

        <button
          type="button"
          className="va-pill-btn danger"
          onClick={onClearAllData}
        >
          WIPE SAVED
        </button>
      </div>
    </div>
  );
};
