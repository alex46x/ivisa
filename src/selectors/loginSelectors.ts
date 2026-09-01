/**
 * Real IVAC Sign-In Selectors
 * Target: https://appointment.ivacbd.com/signin
 */

export const loginSelectors = {
  // Mobile / Contact number input field
  phoneInput: [
    'input[placeholder*="Contact Number"]',
    'input[placeholder*="01"]',
    '#phone',
    'input[name="phone"]',
    'input[name="mobile"]',
    'input[name="contact_number"]',
    'input[type="tel"]'
    // TODO: VERIFY ON REAL WEBSITE
  ],

  // Password input field
  passwordInput: [
    'input[placeholder*="password" i]',
    'input[placeholder*="Enter your password" i]',
    '#password',
    'input[name="password"]',
    'input[type="password"]'
    // TODO: VERIFY ON REAL WEBSITE
  ],

  // Sign In submit button ("Sign In Now ->")
  submitButton: [
    'button:has-text("Sign In Now")',
    'button:has-text("Sign In")',
    'button[type="submit"]',
    '#login-btn',
    '.btn-signin'
    // TODO: VERIFY ON REAL WEBSITE
  ],

  // Cloudflare Turnstile challenge box
  captchaContainer: [
    '.cf-turnstile',
    'iframe[src*="challenges.cloudflare.com"]',
    'iframe[src*="turnstile"]',
    '#cf-turnstile',
    'div[data-sitekey]'
  ],

  // Turnstile token response input
  turnstileTokenInput: [
    'input[name="cf-turnstile-response"]',
    'input[name="g-recaptcha-response"]'
  ]
};
