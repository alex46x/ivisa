export type PageType =
  | 'UNKNOWN'
  | 'LOGIN_PAGE'
  | 'WAITING_FOR_VERIFICATION'
  | 'OTP_PAGE'
  | 'DASHBOARD'
  | 'MISSION_SELECTION_PAGE'
  | 'CENTER_SELECTION_PAGE'
  | 'FILE_UPLOAD_PAGE'
  | 'APPLICANT_CONFIRMATION_PAGE'
  | 'APPOINTMENT_PAGE'
  | 'DATE_SELECTION_PAGE'
  | 'PAYMENT_PAGE'
  | 'SUCCESS_PAGE'
  | 'ERROR_PAGE';

export interface PageDetectionResult {
  pageType: PageType;
  confidence: number;
  matchedSignals: string[];
  title: string;
  url: string;
  timestamp: number;
}
