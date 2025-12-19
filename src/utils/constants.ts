export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  VERIFY_OTP: '/verify-otp',
  SET_PASSWORD: '/set-password',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  TESTS: '/tests',
  SET_TEST: '/set-test',
  PREDEFINED_TESTS: '/predefined-tests',
  TAKE_TEST: '/tests/:testId',
  TEST_RESULT: '/tests/:testId/result',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_PREDEFINED_TESTS: '/admin/predefined-tests',
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.VERIFY_OTP,
  ROUTES.SET_PASSWORD,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];

export const VALIDATION = {
  FULL_NAME_MIN: 2,
  FULL_NAME_MAX: 100,
  PASSWORD_MIN: 8,
  OTP_LENGTH: 6,
};

export const RATE_LIMIT_MESSAGE = 'Too many requests. Please wait a moment before trying again.';
