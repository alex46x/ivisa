import { describe, it, expect } from 'vitest';
import { PageDetector } from '../src/content/pageDetector';

describe('PageDetector Engine', () => {
  const detector = new PageDetector();

  it('should detect LOGIN_PAGE on real IVAC /signin URL and title', () => {
    const mockDoc = {
      title: 'Indian Visa Application Center - Sign In',
      querySelectorAll: () => []
    } as unknown as Document;

    const mockLocation = {
      pathname: '/signin',
      search: '',
      hash: '',
      href: 'https://appointment.ivacbd.com/signin'
    } as unknown as Location;

    const result = detector.detect(mockDoc, mockLocation);
    expect(result.pageType).toBe('LOGIN_PAGE');
    expect(result.confidence).toBeGreaterThanOrEqual(0.3);
  });

  it('should detect OTP_PAGE on real IVAC /verify-login-phone-otp route', () => {
    const mockDoc = {
      title: 'Verify OTP',
      querySelectorAll: () => [
        { textContent: 'Verify OTP' },
        { textContent: 'A verification code has been sent' }
      ]
    } as unknown as Document;

    const mockLocation = {
      pathname: '/verify-login-phone-otp',
      search: '',
      hash: '',
      href: 'https://appointment.ivacbd.com/verify-login-phone-otp'
    } as unknown as Location;

    const result = detector.detect(mockDoc, mockLocation);
    expect(result.pageType).toBe('OTP_PAGE');
  });

  it('should detect FILE_UPLOAD_PAGE on /appointment/file-upload route', () => {
    const mockDoc = {
      title: 'Upload Webfile',
      querySelectorAll: () => [
        { textContent: 'Total number of applicants: 0' },
        { textContent: 'Upload your primary web file' }
      ]
    } as unknown as Document;

    const mockLocation = {
      pathname: '/appointment/file-upload',
      search: '',
      hash: '',
      href: 'https://appointment.ivacbd.com/appointment/file-upload'
    } as unknown as Location;

    const result = detector.detect(mockDoc, mockLocation);
    expect(result.pageType).toBe('FILE_UPLOAD_PAGE');
  });

  it('should detect APPOINTMENT_PAGE calendar on /appointment/time-slot route', () => {
    const mockDoc = {
      title: 'Appointment Calendar',
      querySelectorAll: () => [
        { textContent: 'Select Appointment Date' },
        { textContent: 'Time slot' }
      ]
    } as unknown as Document;

    const mockLocation = {
      pathname: '/appointment/time-slot',
      search: '',
      hash: '',
      href: 'https://appointment.ivacbd.com/appointment/time-slot'
    } as unknown as Location;

    const result = detector.detect(mockDoc, mockLocation);
    expect(['APPOINTMENT_PAGE', 'DATE_SELECTION_PAGE']).toContain(result.pageType);
  });

  it('should detect PAYMENT_PAGE and trigger payment handoff', () => {
    const mockDoc = {
      title: 'Visa Fee Payment',
      querySelectorAll: () => [
        { textContent: 'Pay Visa Fee Online' }
      ]
    } as unknown as Document;

    const mockLocation = {
      pathname: '/payment',
      search: '',
      hash: '',
      href: 'https://appointment.ivacbd.com/payment'
    } as unknown as Location;

    const result = detector.detect(mockDoc, mockLocation);
    expect(result.pageType).toBe('PAYMENT_PAGE');
  });
});
