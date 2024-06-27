export const errorCodes = {
  AUTHENTICATION_ERROR: {
    code: 1,
    message: "Authentication failed. Wrong credential. Please log in.",
  },
  VALIDATION_ERROR: {
    code: 2,
    message: "Validation failed. Please check your input.",
  },
  NOT_FOUND: {
    code: 3,
    message: "Resource not found.",
  },
  INTERNAL_SERVER_ERROR: {
    code: 4,
    message: "Internal server error. Please try again later.",
  },
  ACCOUNT_RESTRICTED_ERROR: {
    code: 5,
    message: "You can not log in, Your account is restricted.",
  },
  EMAIL_NOT_VERIFIED: {
    code: 6,
    message: "You can not log in, Your email is not verified.",
  },
  MAXIMUM_LOGIN_EXCEEDED: {
    code: 7,
    message: "You can not log in, Maximum login attempt exceeded.",
  },
  ACCOUNT_IS_NOT_VAlID: {
    code: 8,
    message: "You can not post, Your account is not valid.",
  },
  NID_NOT_VERIFIED: {
    code: 9,
    message: "You can not post, Your NID is not verified.",
  },
};
