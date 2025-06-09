// App-wide constants for better maintainability

export const APP_CONSTANTS = {
  // Session timeout settings
  DEFAULT_SESSION_TIMEOUT: 15 * 60, // 15 minutes in seconds
  DEFAULT_MNEMONIC_VERIFICATION_INTERVAL: 30, // 30 days

  // Validation constants
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,

  // Generator constants
  MIN_WORDS: 8,
  MAX_WORDS: 24,
  DEFAULT_WORDS_COUNT: 15,
  DEFAULT_PASSWORD_LENGTH: 12,

  // Character sets
  CHARACTER_SETS: {
    UPPERCASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    LOWERCASE: "abcdefghijklmnopqrstuvwxyz",
    NUMBERS: "0123456789",
    SPECIAL: "!@#$%^&*",
    AMBIGUOUS: "B8G6I1l0OQDS5Z2",
    ALPHANUMERIC: "abcdefghijklmnopqrstuvwxyz0123456789",
  },
} as const;

// Route constants for navigation
export const ROUTES = {
  ROOT: "/",
  GUEST: {
    LANDING: "/landing",
    RECOVER_VAULT: "/recovervault",
    CREATE_ACCOUNT: {
      INDEX: "/createaccount",
      GET_STARTED: "/createaccount/getstarted",
      OTP: "/createaccount/otp",
      PASSKEY: "/createaccount/passkey",
      SECURE_VAULT: "/createaccount/securevault",
      SEED_PHRASE: {
        INDEX: "/createaccount/seedphrase",
        VERIFY: "/createaccount/seedphrase/verify"
      },
      CONGRATS: "/createaccount/congrats",
    },
  },
  USER: {
    MY_VAULT: {
      INDEX: "/myvault",
      TYPES: {
        LOGIN: "/myvault/types/Login",
        SSH_KEY: "/myvault/types/SSH+key",
      },
      FOLDER: "/myvault/folders",
      TRASH: "/myvault/trash",
    },
    SETTINGS: "/settings",
    LOCKED: "/locked",
    GENERATOR: "/generator",
  },
} as const;
