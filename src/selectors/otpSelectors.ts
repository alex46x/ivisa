/**
 * Real IVAC OTP Verification Selectors
 * Target: https://appointment.ivacbd.com/verify-login-phone-otp
 */

export const otpSelectors = {
  // 6 Individual OTP Digit Inputs
  otpDigits: [
    'input.otp-digit',
    'input[name^="otp"]',
    '.otp-input',
    'input[type="text"][maxlength="1"]'
    // TODO: VERIFY ON REAL WEBSITE
  ],

  // Single OTP Input fallback
  otpSingleInput: [
    '#otp',
    'input[name="otp"]',
    'input[name="verification_code"]',
    'input[placeholder*="OTP"]'
    // TODO: VERIFY ON REAL WEBSITE
  ],

  // Submit / Verify OTP Button ("Verify OTP ->")
  otpSubmitButton: [
    'button:has-text("Verify OTP")',
    'button:has-text("Confirm OTP")',
    '#verify-otp',
    'button[type="submit"]'
    // TODO: VERIFY ON REAL WEBSITE
  ],

  // Resend OTP Link / Button
  resendButton: [
    'button:has-text("Resend OTP")',
    '#resend-otp',
    'a:has-text("Resend")'
    // TODO: VERIFY ON REAL WEBSITE
  ]
};
