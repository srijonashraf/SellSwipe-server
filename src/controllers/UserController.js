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
export const userRegistration = async (req, res) => {
  const result = await userRegistrationService(req);
  res.status(200).json(result);
};

export const userLogin = async (req, res) => {
  const result = await userLoginService(req);
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

export const userAvatarUpdate = async (req, res) => {
  const result = await userAvatarUpdateService(req);
  res.status(200).json(result);
};
export const userProfileUpdate = async (req, res) => {
  const result = await userProfileUpdateService(req);
  res.status(200).json(result);
};

export const userNidUpdateRequest = async (req, res) => {
  const result = await userNidUpdateRequestService(req);
  res.status(200).json(result);
};

export const userProfileDetails = async (req, res) => {
  const result = await userProfileDetailsService(req);
  res.status(200).json(result);
};

export const userAllSession = async (req, res) => {
  const result = await userAllSessionService(req);
  res.status(200).json(result);
};

export const userLogoutFromSession = async (req, res) => {
  const result = await userLogoutFromSessionService(req);
  res.status(200).json(result);
};

export const sendVerificationEmail = async (req, res) => {
  const result = await sendVerificationEmailService(req);
  res.status(200).json(result);
};

export const sendResetPasswordEmail = async (req, res) => {
  const result = await sendResetPasswordEmailService(req);
  res.status(200).json(result);
};

export const emailVerificationByLink = async (req, res) => {
  const result = await emailVerificationByLinkService(req);
  res.status(200).json(result);
};

export const emailVerificationByOtp = async (req, res) => {
  const result = await emailVerificationByOtpService(req);
  res.status(200).json(result);
};

export const resetPasswordByLink = async (req, res) => {
  const result = await resetPasswordByLinkService(req);
  res.status(200).json(result);
};

export const resetPasswordByOtp = async (req, res) => {
  const result = await resetPasswordByOtpService(req);
  res.status(200).json(result);
};
