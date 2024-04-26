import {
  OTPVerifyService,
  recoverResetPasswordService,
  userEmailVerifyService,
  userLoginService,
  userProfileDetailsService,
  userProfilePhotoUpdateService,
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

export const userProfilePhotoUpdate = async (req, res) => {
  const result = await userProfilePhotoUpdateService(req);
  res.status(200).json(result);
};

export const userProfileDetails = async (req, res) => {
  const result = await userProfileDetailsService(req);
  res.status(200).json(result);
};

export const userProfileUpdate = async (req, res) => {
  const result = await userProfileUpdateService(req);
  res.status(200).json(result);
};

export const userEmailVerify = async (req, res) => {
  const result = await userEmailVerifyService(req);
  res.status(200).json(result);
};

export const OTPVerify = async (req, res) => {
  const result = await OTPVerifyService(req);
  res.status(200).json(result);
};

export const recoverResetPassword = async (req, res) => {
  const result = await recoverResetPasswordService(req);
  res.status(200).json(result);
};
