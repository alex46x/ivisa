export interface ApplicantDocument {
  id: string;
  isPrimary: boolean;
  applicantNumber: number;
  fileName: string;
  fileSize: number; // bytes
  fileType: string;
  fileData?: string; // base64 representation held in active memory during session
  validationStatus: 'valid' | 'invalid' | 'pending';
  validationMessage?: string;
  uploadedAt?: number;
}
