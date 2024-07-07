import {
  emailVerificationByLinkService,
  emailVerificationByOtpService,
  resetPasswordByLinkService,
  resetPasswordByOtpService,
  sendResetPasswordEmailService,
  sendVerificationEmailService,
  userAllSessionService,
  userAvatarUpdateService,
  userLoginService,
  userLogoutFromSessionService,
  userNidUpdateRequestService,
  userProfileDetailsService,
  userProfileUpdateService,
  userRegistrationService,
} from "./../services/UserServices.js";
export const userRegistration = async (req, res, next) => {
  const result = await userRegistrationService(req, next);
  res.status(200).json(result);
};

export const userLogin = async (req, res, next) => {
  const result = await userLoginService(req, next);
  if (result.status === "success") {
    let cookieOption = {
      maxAge: Math.floor(Date.now() / 1000) + 6 * 24 * 60 * 60,
      httpOnly: true,
    };
    res.cookie("accessToken", result.accessToken, cookieOption);
    res.cookie("refreshToken", result.refreshToken, cookieOption);
  }
  res.status(200).json(result);
};

export const userAvatarUpdate = async (req, res, next) => {
  const result = await userAvatarUpdateService(req, next);
  res.status(200).json(result);
};
export const userProfileUpdate = async (req, res, next) => {
  const result = await userProfileUpdateService(req, next);
  res.status(200).json(result);
};

export const userNidUpdateRequest = async (req, res, next) => {
  const result = await userNidUpdateRequestService(req, next);
  res.status(200).json(result);
};

export const userProfileDetails = async (req, res, next) => {
  const result = await userProfileDetailsService(req, next);
  res.status(200).json(result);
};

export const userAllSession = async (req, res, next) => {
  const result = await userAllSessionService(req, next);
  res.status(200).json(result);
};

export const userLogoutFromSession = async (req, res, next) => {
  const result = await userLogoutFromSessionService(req, next);
  res.status(200).json(result);
};

export const sendVerificationEmail = async (req, res, next) => {
  const result = await sendVerificationEmailService(req, next);
  res.status(200).json(result);
};

export const sendResetPasswordEmail = async (req, res, next) => {
  const result = await sendResetPasswordEmailService(req, next);
  res.status(200).json(result);
};

export const emailVerificationByLink = async (req, res, next) => {
  const result = await emailVerificationByLinkService(req, next);
  res.status(200).json(result);
};

export const emailVerificationByOtp = async (req, res, next) => {
  const result = await emailVerificationByOtpService(req, next);
  res.status(200).json(result);
};

export const resetPasswordByLink = async (req, res, next) => {
  const result = await resetPasswordByLinkService(req, next);
  res.status(200).json(result);
};

export const resetPasswordByOtp = async (req, res, next) => {
  const result = await resetPasswordByOtpService(req, next);
  res.status(200).json(result);
};
