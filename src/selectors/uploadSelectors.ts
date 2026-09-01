/**
 * Real IVAC Document Upload & Confirmation Selectors
 * Target: https://appointment.ivacbd.com/appointment/file-upload
 */

export const uploadSelectors = {
  // Primary applicant PDF file input
  primaryFileInput: [
    'input[type="file"][name="primary_doc"]',
    'input[type="file"][name="passport_copy"]',
    'input[type="file"]#primary_document',
    'input[type="file"]'
    // TODO: VERIFY ON REAL WEBSITE
  ],

  // Additional applicants file inputs
  additionalFileInput: [
    'input[type="file"][name*="additional"]',
    'input[type="file"][name*="applicant"]',
    '.additional-applicant input[type="file"]'
    // TODO: VERIFY ON REAL WEBSITE
  ],

  // Confirmation Checkbox ("Maximum file size: 500KB. Only PDF files are accepted")
  confirmCheckbox: [
    'input[type="checkbox"]#confirm-info',
    'input[type="checkbox"][name="confirm_correct"]',
    'input[type="checkbox"]#terms-confirm',
    'input[type="checkbox"]'
    // TODO: VERIFY ON REAL WEBSITE
  ],

  // Confirm and Proceed Button ("Confirm All Information is Correct ->")
  confirmProceedButton: [
    'button:has-text("Confirm All Information is Correct")',
    'button:has-text("Upload & Continue")',
    'button:has-text("Confirm & Continue")',
    '#upload-confirm-btn',
    'button[type="submit"]'
    // TODO: VERIFY ON REAL WEBSITE
  ],

  // Upload status indicators
  uploadSuccessIndicator: [
    '.upload-success',
    '.file-uploaded-badge',
    '[data-status="uploaded"]'
  ],

  uploadErrorIndicator: [
    '.upload-error',
    '.text-danger',
    '.alert-danger'
  ]
};
