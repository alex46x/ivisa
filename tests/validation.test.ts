import { describe, it, expect } from 'vitest';
import { validateApplicantDocument, validatePhoneNumber } from '../src/utils/validation';

describe('Validation Utility', () => {
  it('should validate PDF document under 500 KB limit', () => {
    const validFile = {
      name: 'passport_scan.pdf',
      size: 320 * 1024,
      type: 'application/pdf'
    };

    const result = validateApplicantDocument(validFile, 500 * 1024);
    expect(result.isValid).toBe(true);
    expect(result.fileSizeFormatted).toBe('320 KB');
  });

  it('should reject non-PDF file formats', () => {
    const invalidFormat = {
      name: 'photo.jpg',
      size: 150 * 1024,
      type: 'image/jpeg'
    };

    const result = validateApplicantDocument(invalidFormat, 500 * 1024);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Only PDF files are accepted');
  });

  it('should reject PDF files exceeding the 500 KB size limit', () => {
    const oversizedFile = {
      name: 'large_scanned_doc.pdf',
      size: 750 * 1024, // 750 KB
      type: 'application/pdf'
    };

    const result = validateApplicantDocument(oversizedFile, 500 * 1024);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('exceeds maximum size limit');
  });

  it('should validate phone numbers properly', () => {
    expect(validatePhoneNumber('01712345678')).toBe(true);
    expect(validatePhoneNumber('+8801712345678')).toBe(true);
    expect(validatePhoneNumber('123')).toBe(false);
    expect(validatePhoneNumber('')).toBe(false);
  });
});
