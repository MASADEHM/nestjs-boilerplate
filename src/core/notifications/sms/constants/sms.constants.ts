export const SMS_CONSTANTS = {
  PROVIDERS: {
    MIDDLEWARE: 'middleware',
    TWILIO: 'twilio',
    AWS_SNS: 'aws-sns',
    NEXMO: 'nexmo',
  },
  OTP: {
    LENGTH: 6,
    EXPIRY_MINUTES: 5,
    MAX_ATTEMPTS: 3,
    RATE_LIMIT_WINDOW_MINUTES: 1,
    RATE_LIMIT_MAX_REQUESTS: 2,
  },
  TEMPLATES: {
    OTP_VERIFICATION: 'otp-verification',
    PASSWORD_RESET: 'password-reset', // eslint-disable-line sonarjs/no-hardcoded-passwords
    TWO_FACTOR_AUTH: '2fa-verification',
  },
} as const;

export const SMS_ERRORS = {
  PROVIDER_NOT_FOUND: 'SMS provider not found',
  INVALID_PHONE_NUMBER: 'Invalid phone number format',
  OTP_EXPIRED: 'OTP has expired',
  OTP_INVALID: 'Invalid OTP code',
  MAX_ATTEMPTS_EXCEEDED: 'Maximum verification attempts exceeded',
  RATE_LIMIT_EXCEEDED: 'Too many SMS requests, please try again later',
  SEND_FAILED: 'Failed to send SMS',
} as const;
