import { baseUrl } from "../constants/BaseUrl.js";
import { emailTypes, verificationTypes } from "../constants/Types.js";
import {
  allSessionService,
  approveNidService,
  declineNidService,
  emailVerificationByLinkService,
  emailVerificationByOtpService,
  getReviewNidListService,
  getUserListService,
  loginService,
  logoutSessionService,
  profileService,
  registrationService,
  resetPasswordByLinkService,
  resetPasswordByOtpService,
  restrictAccountService,
  searchUserService,
  sendAuthEmailsService,
  updateAvatarService,
  updateNidService,
  updatePasswordService,
  updateProfileService,
  verifyResetPasswordTokenService,
  warningAccountService,
  withdrawRestrictionsService,
} from "../services/UserServices.js";

export const registration = async (req, res, next) => {
  const result = await registrationService(req, next);
  res.status(200).json(result);
};

export const login = async (req, res, next) => {
  const result = await loginService(req, next);
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

export const profile = async (req, res, next) => {
  const result = await profileService(req, next);
  res.status(200).json(result);
};
export const updateProfile = async (req, res, next) => {
  const result = await updateProfileService(req, next);
  res.status(200).json(result);
};

export const updatePassword = async (req, res, next) => {
  const result = await updatePasswordService(req, next);
  res.status(200).json(result);
};

export const updateAvatar = async (req, res, next) => {
  const result = await updateAvatarService(req, next);
  res.status(200).json(result);
};

export const updateNid = async (req, res, next) => {
  const result = await updateNidService(req, next);
  res.status(200).json(result);
};

export const allSession = async (req, res, next) => {
  const result = await allSessionService(req, next);
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

export const resetPasswordByLink = async (req, res, next) => {
  const result = await resetPasswordByLinkService(req, next);
  res.status(200).json(result);
};

export const resetPasswordByOtp = async (req, res, next) => {
  const result = await resetPasswordByOtpService(req, next);
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
  //Will redirect to frontend Reset Password reset page later on.
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

//_____Admin_____
export const getUserList = async (req, res, next) => {
  const result = await getUserListService(req, next);
  res.status(200).json(result);
};

export const withdrawRestrictions = async (req, res, next) => {
  const result = await withdrawRestrictionsService(req, next);
  res.status(200).json(result);
};

export const warningAccount = async (req, res, next) => {
  const result = await warningAccountService(req, next);
  res.status(200).json(result);
};

export const restrictAccount = async (req, res, next) => {
  const result = await restrictAccountService(req, next);
  res.status(200).json(result);
};

export const getReviewNidList = async (req, res, next) => {
  const result = await getReviewNidListService(req, next);
  res.status(200).json(result);
};

export const approveNid = async (req, res, next) => {
  const result = await approveNidService(req, next);
  res.status(200).json(result);
};

export const declineNid = async (req, res, next) => {
  const result = await declineNidService(req, next);
  res.status(200).json(result);
};

export const searchUser = async (req, res, next) => {
  const result = await searchUserService(req, next);
  res.status(200).json(result);
};
