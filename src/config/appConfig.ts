import { AutomationSettings, MissionOption } from '../types/settings';
import { StageDefinition } from '../types/automation';

export const APP_CONFIG = {
  EXTENSION_NAME: 'VISA AUTOMATOR',
  VERSION: '1.0.0',
  TARGET_DOMAINS: [
    'appointment.ivacbd.com',
    'ivacbd.com'
  ],
  MIN_CHECK_INTERVAL_SECONDS: 60, // Enforced conservative minimum interval
  DEFAULT_CHECK_INTERVAL_SECONDS: 60,
  CHECK_JITTER_SECONDS: 5, // ± 5s random jitter
  MAX_FILE_SIZE_BYTES: 500 * 1024, // 500 KB limit for PDF
  ALLOWED_FILE_TYPES: ['application/pdf', '.pdf'],
  BACKOFF_STEPS_MINUTES: [1, 2, 5, 10], // Exponential backoff progression
  DEFAULT_MAX_BACKOFF_MINUTES: 10,
  DEFAULT_PANEL_POSITION: { x: 20, y: 20 },
  DEFAULT_PANEL_WIDTH: 460
};

export const DEFAULT_MISSIONS: MissionOption[] = [
  {
    value: 'dhaka',
    label: 'Dhaka',
    centers: [
      { value: 'dhaka_center', label: 'Dhaka (Jamuna Future Park)' },
      { value: 'dhaka_motijheel', label: 'Dhaka (Motijheel)' }
    ]
  },
  {
    value: 'chittagong',
    label: 'Chittagong',
    centers: [
      { value: 'ctg_center', label: 'Chittagong Center (Agrabad)' }
    ]
  },
  {
    value: 'sylhet',
    label: 'Sylhet',
    centers: [
      { value: 'sylhet_center', label: 'Sylhet Center (Subidbazar)' }
    ]
  },
  {
    value: 'rajshahi',
    label: 'Rajshahi',
    centers: [
      { value: 'rajshahi_center', label: 'Rajshahi Center (Kazihata)' }
    ]
  },
  {
    value: 'khulna',
    label: 'Khulna',
    centers: [
      { value: 'khulna_center', label: 'Khulna Center' }
    ]
  }
];

export const WORKFLOW_STAGES: StageDefinition[] = [
  { id: 1, label: 'Login & Authentication', shortName: 'Login', associatedPage: 'LOGIN_PAGE' },
  { id: 2, label: 'Security Verification', shortName: 'Verify', associatedPage: 'WAITING_FOR_VERIFICATION' },
  { id: 3, label: 'OTP Verification', shortName: 'OTP', associatedPage: 'OTP_PAGE' },
  { id: 4, label: 'Mission Selection', shortName: 'Mission', associatedPage: 'MISSION_SELECTION_PAGE' },
  { id: 5, label: 'Center Selection', shortName: 'Center', associatedPage: 'CENTER_SELECTION_PAGE' },
  { id: 6, label: 'Document Upload', shortName: 'Upload', associatedPage: 'FILE_UPLOAD_PAGE' },
  { id: 7, label: 'Applicant Confirmation', shortName: 'Confirm', associatedPage: 'APPLICANT_CONFIRMATION_PAGE' },
  { id: 8, label: 'Slot Availability Check', shortName: 'Slot Check', associatedPage: 'APPOINTMENT_PAGE' },
  { id: 9, label: 'Payment Handoff', shortName: 'Payment', associatedPage: 'PAYMENT_PAGE' }
];

export const DEFAULT_SETTINGS: AutomationSettings = {
  mission: 'dhaka',
  ivacCenter: 'dhaka_center',
  preferredDates: [],
  priorityMode: 'strict',
  checkInterval: 60,
  maxBackoffDelay: 10,
  autoSignIn: false,
  autoNavigation: true,
  autoClosePopups: true,
  autoUpload: false,
  autoMission: true,
  autoCenter: true,
  conservativeCheck: true,
  rememberCredentialsLocally: false,
  phone: ''
};
