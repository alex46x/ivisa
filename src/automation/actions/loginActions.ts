import { loginSelectors } from '../../selectors/loginSelectors';
import { findFirstMatchingElement, setNativeInputValue } from '../../utils/domHelpers';
import { logger } from '../../utils/logger';

export interface LoginFillResult {
  filledPhone: boolean;
  filledPassword: boolean;
  captchaPresent: boolean;
}

export function checkCaptchaPresent(doc: Document = document): boolean {
  const captcha = findFirstMatchingElement(loginSelectors.captchaContainer, doc);
  return Boolean(captcha);
}

export function fillLoginFields(phone: string, password?: string, doc: Document = document): LoginFillResult {
  let filledPhone = false;
  let filledPassword = false;

  const phoneInput = findFirstMatchingElement<HTMLInputElement>(loginSelectors.phoneInput, doc);
  if (phoneInput && phone) {
    setNativeInputValue(phoneInput, phone);
    filledPhone = true;
    logger.action(`Populated phone field with user-configured number (${phone.slice(0, 3)}****)`);
  }

  const passwordInput = findFirstMatchingElement<HTMLInputElement>(loginSelectors.passwordInput, doc);
  if (passwordInput && password) {
    setNativeInputValue(passwordInput, password);
    filledPassword = true;
    logger.action('Populated password field from local session');
  }

  const captchaPresent = checkCaptchaPresent(doc);
  if (captchaPresent) {
    logger.warning('Security verification / CAPTCHA detected on login page. Halting automation for manual user solve.');
  }

  return {
    filledPhone,
    filledPassword,
    captchaPresent
  };
}
