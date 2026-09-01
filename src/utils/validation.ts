import { APP_CONFIG } from '../config/appConfig';

export interface FileValidationResult {
  isValid: boolean;
  message?: string;
  fileSizeFormatted: string;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Validates selected applicant document file
 */
export function validateApplicantDocument(
  file: File | { name: string; size: number; type: string },
  maxSizeBytes: number = APP_CONFIG.MAX_FILE_SIZE_BYTES
): FileValidationResult {
  const sizeFormatted = formatBytes(file.size);

  // Check file type
  const isPdf =
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    return {
      isValid: false,
      message: 'Invalid file format. Only PDF files are accepted.',
      fileSizeFormatted: sizeFormatted
    };
  }

  // Check file size limit
  if (file.size > maxSizeBytes) {
    const maxFormatted = formatBytes(maxSizeBytes);
    return {
      isValid: false,
      message: `File exceeds maximum size limit of ${maxFormatted} (Selected: ${sizeFormatted}).`,
      fileSizeFormatted: sizeFormatted
    };
  }

  return {
    isValid: true,
    message: 'File verified successfully.',
    fileSizeFormatted: sizeFormatted
  };
}

/**
 * Validates phone format
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[\s\-()]/g, '');
  // Basic validation: 8 to 15 digits
  return /^\+?\d{8,15}$/.test(clean);
}
