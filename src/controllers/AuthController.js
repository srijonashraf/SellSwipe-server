import { baseUrl } from "../constants/BaseUrl.js";
import { emailTypes, verificationTypes } from "../constants/Types.js";
import {
  adminLoginService,
  sessionService,
  emailVerificationByLinkService,
  emailVerificationByOtpService,
  logoutSessionService,
  resetPasswordByLinkService,
  resetPasswordByOtpService,
  sendAuthEmailsService,
  userLoginService,
  userRegistrationService,
  verifyResetPasswordTokenService,
  refreshTokensService,
} from "../services/AuthService.js";

export const userRegistration = async (req, res, next) => {
  const result = await userRegistrationService(req, next);
  res.status(200).json(result);
};

export const userLogin = async (req, res, next) => {
  const result = await userLoginService(req, next);
  let cookieOption = {
    maxAge: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    httpOnly: true,
  };
  res.cookie("accessToken", result.accessToken, cookieOption);
  res.cookie("refreshToken", result.refreshToken, cookieOption);
  res.status(200).json(result);
};

export const adminLogin = async (req, res, next) => {
  const result = await adminLoginService(req, next);
  if (result.status === "success") {
    let cookieOption = {
      maxAge: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      httpOnly: true,
    };
    res.cookie("accessToken", result.accessToken, cookieOption);
    res.cookie("refreshToken", result.refreshToken, cookieOption);
  }
  res.status(200).json(result);
};
export const session = async (req, res, next) => {
  const result = await sessionService(req, next);
  res.status(200).json(result);
};

export const logoutSession = async (req, res, next) => {
  const result = await logoutSessionService(req, next);
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

export const sendVerificationEmail = async (req, res, next) => {
  const result = await sendAuthEmailsService({
    req,
    emailType: emailTypes.EMAIL_VERIFICATION,
    next,
  });
  if (result) {
    res.status(200).json({
      status: "success",
      message: "A verification email has been sent successfully",
    });
  } else {
    res
      .status(200)
      .json({ status: "fail", message: "Failed to send verification email" });
  }
};

export const sendResetPasswordEmail = async (req, res, next) => {
  const result = await sendAuthEmailsService({
    req,
    emailType: emailTypes.RESET_PASSWORD,
    next,
  });
  if (result) {
    res.status(200).json({
      status: "success",
      message: "A reset password email has been sent successfully",
    });
  } else {
    res
      .status(200)
      .json({ status: "fail", message: "Failed to reset password email" });
  }
};

export const verifyUser = async (req, res, next) => {
  const method = req.query.method || verificationTypes.OTP_VERIFICATION;

  if (method === verificationTypes.OTP_VERIFICATION) {
    const result = await emailVerificationByOtpService(req, res, next);
    res.status(200).json(result);
  } else if (method === verificationTypes.LINK_VERIFICATION) {
    const result = await emailVerificationByLinkService(req, res, next);
    res.status(200).json(result);
  } else {
    return res.status(400).json({ status: "fail", message: "Invalid method" });
  }
};

export const verifyResetPasswordToken = async (req, res, next) => {
  const result = await verifyResetPasswordTokenService(req, next);
  //Will redirect to frontend's Password reset page later on.
  //This is a demo design for now the function is tested via Postman.
  if (result) {
    res.send(`
        <form method="POST" action="${baseUrl}/auth/reset-password?userId=${req.query.userId}&token=${req.query.token}&method=${req.query.method}" style="
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 400px;
          margin: 50px auto;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          background-color: #f9f9f9;
          font-family: Arial, sans-serif;
        ">
          <label for="newPassword" style="font-weight: bold;">New Password:</label>
          <input 
            type="password" 
            id="newPassword" 
            name="newPassword" 
            required minlength="8" 
            placeholder="Enter new password"
            style="
              padding: 10px;
              font-size: 1rem;
              border: 1px solid #ccc;
              border-radius: 4px;
              box-sizing: border-box;
              width: 100%;
            " 
          />
      
          <label for="confirmPassword" style="font-weight: bold;">Confirm Password:</label>
          <input 
            type="password" 
            id="confirmPassword" 
            name="confirmPassword" 
            required minlength="8" 
            placeholder="Confirm new password"
            style="
              padding: 10px;
              font-size: 1rem;
              border: 1px solid #ccc;
              border-radius: 4px;
              box-sizing: border-box;
              width: 100%;
            " 
          />
      
          <button type="submit" style="
            padding: 12px;
            font-size: 1rem;
            color: #fff;
            background-color: #007BFF;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
          ">Reset Password</button>
        </form>
      
        <style>
          button:hover {
            background-color: #0056b3;
          }
        </style>
      `);
  } else {
    return res
      .status(400)
      .json({ status: "fail", message: "Something went wrong" });
  }
};

export const resetPassword = async (req, res, next) => {
  const method = req.query.method || verificationTypes.OTP_VERIFICATION;
  if (method === verificationTypes.OTP_VERIFICATION) {
    const result = await resetPasswordByOtpService(req, res, next);
    res.status(200).json(result);
  } else if (method === verificationTypes.LINK_VERIFICATION) {
    const result = await resetPasswordByLinkService(req, res, next);
    res.status(200).json(result);
  } else {
    return res.status(400).json({ status: "fail", message: "Invalid method" });
  }
};

export const refreshTokens = async (req, res, next) => {
  const result = await refreshTokensService(req, next);
  if (result.accessToken && result.refreshToken) {
    let cookieOption = {
      maxAge: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      httpOnly: true,
    };
    res.cookie("accessToken", result.accessToken, cookieOption);
    res.cookie("refreshToken", result.refreshToken, cookieOption);
  }
  res.status(200).json(result);
};
