/**
 * Real IVAC Appointment Calendar & Slot Selectors
 * Target: https://appointment.ivacbd.com/appointment/time-slot
 */

export const appointmentSelectors = {
  // Calendar Container
  calendarContainer: [
    '#appointment-calendar',
    '.calendar-container',
    '.date-picker-grid',
    '.slot-grid'
    // TODO: VERIFY ON REAL WEBSITE
  ],

  // Available Date Buttons / Cells
  availableDateCells: [
    '.date-cell.available',
    '.calendar-day:not(.disabled):not(.booked)',
    '[data-available="true"]',
    'button.slot-available',
    'button.slot-btn:not([disabled])'
    // TODO: VERIFY ON REAL WEBSITE
  ],

  dateCellByValue: (dateStr: string) => [
    `[data-date="${dateStr}"]`,
    `[data-day="${dateStr}"]`,
    `button:has-text("${dateStr}")`,
    `td[data-date="${dateStr}"]`
  ],

  // Time slot buttons
  timeSlotButtons: [
    '.time-slot-btn:not([disabled])',
    'input[type="radio"][name="time_slot"]',
    '.slot-pill.available'
    // TODO: VERIFY ON REAL WEBSITE
  ],

  // Refresh slots button
  refreshSlotsButton: [
    '#refresh-slots-btn',
    'button:has-text("Refresh Dates")',
    'button:has-text("Check Again")'
    // TODO: VERIFY ON REAL WEBSITE
  ],

  // Book / Confirm appointment button
  bookSlotButton: [
    'button:has-text("Book Appointment")',
    'button:has-text("Confirm Slot")',
    'button:has-text("Proceed to Payment")',
    '#book-slot-btn'
    // TODO: VERIFY ON REAL WEBSITE
  ]
};

export const missionCenterSelectors = {
  missionSelect: [
    'select[name="mission"]',
    '#mission',
    'select[name="embassy"]',
    '[data-testid="mission-select"]'
    // TODO: VERIFY ON REAL WEBSITE
  ],
  centerSelect: [
    'select[name="ivac_center"]',
    'select[name="center"]',
    '#ivac_center',
    '#center',
    '[data-testid="center-select"]'
    // TODO: VERIFY ON REAL WEBSITE
  ],
  continueButton: [
    'button:has-text("Continue")',
    'button:has-text("Next")',
    '#proceed-btn',
    'button[type="submit"]'
    // TODO: VERIFY ON REAL WEBSITE
  ]
};

export const paymentSelectors = {
  paymentContainer: [
    '#payment-gateway-container',
    '.payment-methods',
    '#checkout-form',
    '.billing-section'
  ],
  paymentIframe: [
    'iframe[src*="sslcommerz"]',
    'iframe[src*="bkash"]',
    'iframe[src*="nagad"]',
    'iframe[src*="payment"]'
  ],
  successMarker: [
    '#appointment-success',
    '.success-receipt',
    'h1:has-text("Appointment Confirmed")',
    '.booking-reference'
  ]
};

export const generalSelectors = {
  popupCloseButtons: [
    '.modal .close',
    'button.modal-close',
    'button[data-dismiss="modal"]',
    '.popup-dismiss-btn',
    'button[aria-label="Close"]'
  ],
  rateLimitWarning: [
    '.rate-limit-warning',
    '.alert-warning:has-text("Too many requests")',
    ':has-text("Rate limit exceeded")',
    ':has-text("Please wait before trying again")'
  ]
};
