import { PageType, PageDetectionResult } from '../types/page';
import { loginSelectors } from '../selectors/loginSelectors';
import { otpSelectors } from '../selectors/otpSelectors';
import { uploadSelectors } from '../selectors/uploadSelectors';
import { appointmentSelectors, missionCenterSelectors, paymentSelectors } from '../selectors/appointmentSelectors';
import { findFirstMatchingElement } from '../utils/domHelpers';

interface PageRule {
  type: PageType;
  urlKeywords: string[];
  titleKeywords: string[];
  elementSelectors: string[][];
  headingKeywords: string[];
}

const PAGE_RULES: PageRule[] = [
  {
    type: 'WAITING_FOR_VERIFICATION',
    urlKeywords: ['challenge', 'turnstile', 'recaptcha', 'cloudflare'],
    titleKeywords: ['just a moment', 'security check', 'verification'],
    elementSelectors: [loginSelectors.captchaContainer],
    headingKeywords: ['verify you are human', 'security verification', 'verifying']
  },
  {
    type: 'OTP_PAGE',
    urlKeywords: ['verify-login-phone-otp', 'verify-otp', 'otp', 'verification-code', '2fa'],
    titleKeywords: ['verify otp', 'otp', 'verification'],
    elementSelectors: [otpSelectors.otpDigits, otpSelectors.otpSingleInput, otpSelectors.otpSubmitButton],
    headingKeywords: ['verify otp', 'enter otp', 'verification code']
  },
  {
    type: 'LOGIN_PAGE',
    urlKeywords: ['/signin', '/login', 'auth', 'sign-in'],
    titleKeywords: ['sign in', 'login', 'ivac login', 'indian visa application'],
    elementSelectors: [loginSelectors.phoneInput, loginSelectors.passwordInput],
    headingKeywords: ['sign in', 'login', 'your contact number']
  },
  {
    type: 'MISSION_SELECTION_PAGE',
    urlKeywords: ['mission', 'select-mission', 'embassy'],
    titleKeywords: ['select mission', 'high commission'],
    elementSelectors: [missionCenterSelectors.missionSelect],
    headingKeywords: ['select mission', 'high commission selection']
  },
  {
    type: 'CENTER_SELECTION_PAGE',
    urlKeywords: ['center', 'ivac-center', 'location'],
    titleKeywords: ['select center', 'ivac center'],
    elementSelectors: [missionCenterSelectors.centerSelect],
    headingKeywords: ['select ivac center', 'select location', 'ivac center']
  },
  {
    type: 'FILE_UPLOAD_PAGE',
    urlKeywords: ['file-upload', 'upload', 'documents', 'passport-upload'],
    titleKeywords: ['file upload', 'document upload', 'upload documents'],
    elementSelectors: [uploadSelectors.primaryFileInput, uploadSelectors.confirmProceedButton],
    headingKeywords: ['total number of applicants', 'upload your primary web file', 'document upload', 'upload']
  },
  {
    type: 'APPLICANT_CONFIRMATION_PAGE',
    urlKeywords: ['confirmation', 'review-applicant', 'applicant-details', 'confirm'],
    titleKeywords: ['confirm details', 'applicant summary', 'review application'],
    elementSelectors: [uploadSelectors.confirmCheckbox, uploadSelectors.confirmProceedButton],
    headingKeywords: ['confirm applicant details', 'application review', 'summary of details']
  },
  {
    type: 'DATE_SELECTION_PAGE',
    urlKeywords: ['time-slot', 'date-selection', 'choose-date', 'select-time'],
    titleKeywords: ['time slot', 'select date', 'select appointment time'],
    elementSelectors: [appointmentSelectors.timeSlotButtons],
    headingKeywords: ['time slot', 'select appointment slot', 'choose available time']
  },
  {
    type: 'APPOINTMENT_PAGE',
    urlKeywords: ['appointment', 'calendar', 'slots', 'schedule', 'book-slot'],
    titleKeywords: ['appointment', 'calendar', 'available dates', 'schedule appointment'],
    elementSelectors: [appointmentSelectors.calendarContainer, appointmentSelectors.availableDateCells],
    headingKeywords: ['appointment availability', 'select appointment date', 'available slots']
  },
  {
    type: 'PAYMENT_PAGE',
    urlKeywords: ['payment', 'checkout', 'pay-fee', 'sslcommerz', 'bkash'],
    titleKeywords: ['payment', 'checkout', 'pay visa fee'],
    elementSelectors: [paymentSelectors.paymentContainer, paymentSelectors.paymentIframe],
    headingKeywords: ['payment details', 'visa fee payment', 'billing information', 'pay online']
  },
  {
    type: 'SUCCESS_PAGE',
    urlKeywords: ['success', 'confirmation-receipt', 'confirmed', 'booking-receipt'],
    titleKeywords: ['appointment confirmed', 'success', 'booking confirmation'],
    elementSelectors: [paymentSelectors.successMarker],
    headingKeywords: ['appointment confirmed', 'booking successful', 'payment successful']
  }
];

export class PageDetector {
  public detect(doc: Document = document, locationObj: Location = window.location): PageDetectionResult {
    const url = (locationObj.pathname + locationObj.search + locationObj.hash).toLowerCase();
    const fullUrl = locationObj.href.toLowerCase();
    const title = (doc.title || '').toLowerCase();
    
    const headings: string[] = [];
    doc.querySelectorAll('h1, h2, h3, .page-title, .title, strong').forEach((el) => {
      if (el.textContent) {
        headings.push(el.textContent.trim().toLowerCase());
      }
    });
    const headingText = headings.join(' ');

    let bestMatch: PageType = 'UNKNOWN';
    let highestScore = 0;
    let bestSignals: string[] = [];

    for (const rule of PAGE_RULES) {
      let score = 0;
      const matchedSignals: string[] = [];

      for (const kw of rule.urlKeywords) {
        if (url.includes(kw) || fullUrl.includes(kw)) {
          score += 35;
          matchedSignals.push(`URL match: "${kw}"`);
          break;
        }
      }

      for (const kw of rule.titleKeywords) {
        if (title.includes(kw)) {
          score += 20;
          matchedSignals.push(`Title match: "${kw}"`);
          break;
        }
      }

      for (const kw of rule.headingKeywords) {
        if (headingText.includes(kw)) {
          score += 25;
          matchedSignals.push(`Heading match: "${kw}"`);
          break;
        }
      }

      for (const selectorGroup of rule.elementSelectors) {
        const found = findFirstMatchingElement(selectorGroup, doc);
        if (found) {
          score += 35;
          matchedSignals.push(`DOM match: [${selectorGroup[0]}]`);
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = rule.type;
        bestSignals = matchedSignals;
      }
    }

    const confidence = Math.min(1.0, Math.round((highestScore / 80) * 100) / 100);
    const finalType = confidence >= 0.2 ? bestMatch : 'UNKNOWN';

    return {
      pageType: finalType,
      confidence,
      matchedSignals: bestSignals,
      title: doc.title || '',
      url: locationObj.href,
      timestamp: Date.now()
    };
  }
}

export const pageDetector = new PageDetector();
