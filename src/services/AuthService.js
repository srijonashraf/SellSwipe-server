import { errorCodes } from "../constants/ErrorCodes.js";
import { emailTypes } from "../constants/Types.js";
import { inputSanitizer } from "../middlewares/RequestValidateMiddleware.js";
import AdminModel from "../models/AdminModel.js";
import OtpModel from "../models/OtpModel.js";
import SessionDetailsModel from "../models/SessionDetailsModel.js";
import UserModel from "../models/UserModel.js";
import {
  afterEmailVerificationTemplate,
  afterResetPasswordTemplate,
  emailVerificationTemplate,
  resetPasswordTemplate,
} from "../templates/emailTemplates.js";
import EmailSend from "../utils/EmailUtility.js";
import { fetchLocation } from "../utils/LocationUtility.js";
import { otpLinkUtility } from "../utils/OtpLinkUtility.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/TokenUtility.js";
import validator from "validator";
import Joi from "joi";
import { currentTime } from "../constants/CurrectTime.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

export const userRegistrationService = async (req, next) => {
  try {
    const reqBody = req.body;

    const user = await UserModel.create(reqBody);

    const emailResponse = await sendAuthEmailsService({
      req,
      emailType: emailTypes.EMAIL_VERIFICATION,
      next,
    });

    if (emailResponse) {
      return {
        status: "success",
        data: user,
        message: "User registered successfully and email sent",
      };
    } else {
      return {
        status: "fail",
        message: "User registered, but email sending failed",
      };
    }
  } catch (error) {
    next(error);
  }
};

export const userLoginService = async (req, next) => {
  try {
    const reqBody = req.body;
    const user = await UserModel.findOne({
      email: reqBody.email,
    }).exec();

    const isCorrectPassword = await user.isPasswordCorrect(reqBody.password);
    if (!isCorrectPassword) {
      user.loginAttempt += 1;
      await user.save();
      return {
        status: "fail",
        code: errorCodes.AUTHENTICATION_ERROR.code,
        message: errorCodes.AUTHENTICATION_ERROR.message,
      };
    }

    const tokenObject = { _id: user._id, role: user.role };

    const accessTokenResponse = generateAccessToken(tokenObject);

    //!!Free limit 45 Fire in a minute, if anything goes wrong check here.
    // Fetch location details based on IP address
    const location = await fetchLocation(req);
    //Set session details to database
    const sessionBody = {
      userID: user._id,
      deviceName: req.headers["user-agent"],
      lastLogin: Date.now(),
      accessToken: accessTokenResponse,
      location: location,
      ipAddress: req.ip,
    };

    const session = await SessionDetailsModel.create(sessionBody);

    const refreshTokenResponse = generateRefreshToken(session._id);
    session.refreshToken = refreshTokenResponse;
    await session.save();

    if (accessTokenResponse && refreshTokenResponse && session && user) {
      return {
        status: "success",
        id: user._id,
        email: user.email,
        name: user.name,
        accessToken: accessTokenResponse,
        refreshToken: refreshTokenResponse,
      };
    }
    return { status: "fail", message: "Failed to login" };
  } catch (error) {
    next(error);
  }
};

export const adminLoginService = async (req, next) => {
  try {
    const reqBody = req.body;
    const data = await AdminModel.findOne({ email: reqBody.email }).exec();
    if (!data) {
      return { status: "fail", message: "No admin associated with this email" };
    }
    const isCorrectPassword = await data.isPasswordCorrect(reqBody.password);
    if (!isCorrectPassword) {
      return { status: "fail", message: "Wrong credentials" };
    }

    const admin = { _id: data._id, role: data.role };
    const accessTokenResponse = generateAccessToken(admin);

    //!!Free limit 45 Fire in a minute, if anything goes wrong check here.
    // Fetch location details based on IP address
    const location = await fetchLocation(req);
    // Set session details to DB
    const sessionBody = {
      userID: admin._id,
      deviceName: req.headers["user-agent"],
      lastLogin: Date.now(),
      accessToken: accessTokenResponse,
      location: location,
      ipAddress: req.ip,
    };

    const session = await SessionDetailsModel.create(sessionBody);

    const refreshTokenResponse = generateRefreshToken(session._id);
    session.refreshToken = refreshTokenResponse;
    await session.save();

    if (accessTokenResponse && refreshTokenResponse && session && admin) {
      return {
        status: "success",
        id: data._id,
        email: data.email,
        name: data.name,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      };
    } else {
      return { status: "fail", message: "Failed to login" };
    }
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};

export const sessionService = async (req, next) => {
  try {
    const sessionId = req.query.id;
    if (sessionId) {
      const sessions = await SessionDetailsModel.findOne({
        _id: sessionId,
      });
      return { status: "success", data: sessions };
    }
    const sessions = await SessionDetailsModel.find({
      userID: req.headers.id,
    }).sort({ updatedAt: -1 });

    if (!sessions) {
      return { status: "fail", message: "User or session not found" };
    }

    return { status: "success", data: sessions };
  } catch (error) {
    next(error);
  }
};

export const logoutSessionService = async (req, next) => {
  try {
    const response = await SessionDetailsModel.deleteOne({
      _id: req.query.id,
      userID: req.headers.id,
    });

    if (response.deletedCount !== 1) {
      return {
        status: "fail",
        message: "Failed to logout from session.",
      };
    }

    return {
      status: "success",
      message: "Logged out from the session.",
    };
  } catch (error) {
    next(error);
  }
};

export const sendAuthEmailsService = async ({ req, emailType, next }) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email }).exec();
    if (!user) {
      return { status: "fail", message: "No registered user found" };
    }
    const { otp, link } = await otpLinkUtility(req, email, user._id, emailType);

    let emailTemplate;

    if (emailType === emailTypes.EMAIL_VERIFICATION) {
      emailTemplate = emailVerificationTemplate({
        name: user.name,
        link: link,
      });
    } else if (emailType === emailTypes.RESET_PASSWORD) {
      emailTemplate = resetPasswordTemplate({
        name: user.name,
        link: link,
        otp: otp,
      });
    }

    if (emailTemplate) {
      const result = await EmailSend(
        email,
        emailTemplate.subject,
        emailTemplate.htmlContent
      );
      if (result) {
        return true;
      } else {
        await UserModel.deleteOne({ email });
        return false;
      }
    }

    return false;
  } catch (error) {
    next(error);
  }
};

export const emailVerificationByLinkService = async (req, next) => {
  try {
    const requestQueryParams = req.query;

    inputSanitizer(requestQueryParams);

    const { userId, token } = requestQueryParams;
    if (!userId || !token) {
      return { status: "fail", message: "Link is invalid or broken" };
    }

    if (!validator.isMongoId(userId) || !validator.isJWT(token)) {
      return { status: "fail", message: "The objects are not valid" };
    }

    const otpRecord = await OtpModel.findOne({
      userID: userId,
      token: token,
      expired: false,
      expiresAt: { $gte: currentTime },
    }).exec();

    if (!otpRecord) {
      return { status: "fail", message: "Invalid or expired token" };
    }

    const user = await UserModel.findOneAndUpdate(
      { _id: userId },
      { emailVerified: true },
      { new: true }
    ).exec();

    if (!user) {
      return { status: "fail", message: "User not found" };
    }

    await OtpModel.deleteMany({ userID: userId });

    const emailTemplateResponse = afterEmailVerificationTemplate({
      name: user.name,
    });

    await EmailSend(
      user.email,
      emailTemplateResponse.subject,
      emailTemplateResponse.htmlContent
    );

    return { status: "success", message: "Email verified successfully" };
  } catch (error) {
    next(error);
  }
};

export const emailVerificationByOtpService = async (req, next) => {
  try {
    const { otp, email } = req.body;

    const otpResponse = await OtpModel.findOne({
      otp,
      email,
      expired: false,
      expiresAt: { $gte: currentTime },
    }).exec();

    if (!otpResponse) {
      return { status: "fail", message: "OTP is invalid or expired" };
    }

    const user = await UserModel.findOneAndUpdate(
      { email: otpResponse.email },
      { emailVerified: true },
      { new: true }
    );

    if (!user) {
      return { status: "fail", message: "User not found" };
    }

    await OtpModel.deleteMany({ userID: user._id });

    const emailTemplateResponse = afterEmailVerificationTemplate({
      name: user.name,
    });

    await EmailSend(
      user.email,
      emailTemplateResponse.subject,
      emailTemplateResponse.htmlContent
    );

    return { status: "success", message: "OTP verified successfully" };
  } catch (error) {
    next(error);
  }
};

export const verifyResetPasswordTokenService = async (req, next) => {
  try {
    const { userId, token } = req.query;

    if (!validator.isMongoId(userId) || !validator.isJWT(token)) {
      return { status: "fail", message: "The objects are not valid" };
    }

    const user = await UserModel.findById(userId).exec();

    if (!user) {
      return { status: "fail", message: "User not found" };
    }

    const validToken = await OtpModel.findOne({
      userID: userId,
      email: user.email,
      token: token,
      expired: false,
      expiresAt: { $gte: currentTime },
    }).exec();

    if (validToken) {
      return true;
    }
    return false;
  } catch (error) {
    next(error);
  }
};
export const resetPasswordByLinkService = async (req, next) => {
  try {
    const { userId, token } = req.query;
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return { status: "fail", message: "Password didn't matched" };
    }
    const user = await UserModel.findById(userId).exec();

    if (!user) {
      return { status: "fail", message: "User not found" };
    }

    const validToken = await OtpModel.findOne({
      userID: userId,
      email: user.email,
      token,
      expired: false,
      expiresAt: { $gte: currentTime },
    }).exec();

    if (!validToken) {
      return { status: "fail", message: "Token is invalid or expired" };
    }

    user.password = newPassword;
    await user.save();

    await OtpModel.deleteMany({ userID: userId });

    const location = await fetchLocation(req);

    const userAgent = req.useragent;

    const emailTemplateResponse = afterResetPasswordTemplate({
      name: user.name,
      ip: req.headers["x-forwarded-for"],
      location: location,
      device: userAgent.platform,
      time: new Date().toLocaleString("en-NZ", { timeZone: "Asia/Dhaka" }),
    });

    await EmailSend(
      user.email,
      emailTemplateResponse.subject,
      emailTemplateResponse.htmlContent
    );

    return { status: "success", message: "Password changed successfully" };
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const resetPasswordByOtpService = async (req, next) => {
  try {
    const requestBody = req.body;
    inputSanitizer(requestBody);

    const schema = Joi.object()
      .keys({
        email: Joi.string().email().required(),
        otp: Joi.number().max(999999).required(),
        newPassword: Joi.string().required(),
        confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
      })
      .with("newPassword", "confirmPassword");

    const { error, value } = schema.validate(requestBody, {
      abortEarly: false,
    });
    if (error) {
      return {
        status: "fail",
        message: "Object validation failed",
        error: error,
      };
    }

    const { email, otp, newPassword, confirmPassword } = value;

    if (newPassword !== confirmPassword) {
      return { status: "fail", message: "Password didn't matched" };
    }

    let otpResponse = await OtpModel.findOne({
      email: email,
      otp: otp,
      expired: false,
      expiresAt: { $gte: currentTime },
    }).exec();

    if (!otpResponse) {
      return { status: "fail", message: "Otp is invalid or expired" };
    }

    let user = await UserModel.findOneAndUpdate(
      { email: email },
      { $set: { password: newPassword } },
      {
        new: true,
      }
    );

    if (!user) {
      return { status: "fail", message: "Password reset failed" };
    }

    await OtpModel.deleteMany({ email: email });

    const location = await fetchLocation(req);

    const userAgent = req.useragent;

    const emailTemplateResponse = afterResetPasswordTemplate({
      name: user.name,
      ip: req.headers["x-forwarded-for"],
      location: location,
      device: userAgent.platform,
      time: new Date().toLocaleString("en-NZ", { timeZone: "Asia/Dhaka" }),
    });

    await EmailSend(
      user.email,
      emailTemplateResponse.subject,
      emailTemplateResponse.htmlContent
    );

    return { status: "success", message: "Password reset successfully" };
  } catch (error) {
    next(error);
  }
};

export const refreshTokensService = async (req, next) => {
  try {
    const { token } = req.body;
    const { id, role } = req.headers;

    if (!token) {
      return next({
        status: "fail",
        message: "No token provided",
      });
    }

    try {
      var decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
    } catch (error) {
      console.log(error);
      return { status: "fail", message: "Invalid Token" };
    }

    // Decode the session ID from the token
    const sessionId = decoded.id;
    const sessionDetails = await SessionDetailsModel.findOne({
      _id: sessionId,
      userID: id,
      refreshToken: token,
    });

    if (!sessionDetails) {
      return {
        status: "fail",
        message: "Session not found or expired",
      };
    }

    // Generate new tokens
    const tokenObject = { _id: id, role: role };
    const accessTokenResponse = generateAccessToken(tokenObject);
    const refreshTokenResponse = generateRefreshToken(sessionDetails._id);

    // Fetch the location from location API
    const location = await fetchLocation(req);

    sessionDetails.deviceName = req.headers["user-agent"];
    sessionDetails.lastLogin = Date.now();
    sessionDetails.accessToken = accessTokenResponse;
    sessionDetails.refreshToken = refreshTokenResponse;
    sessionDetails.location = location;
    sessionDetails.ipAddress = req.ip;

    await sessionDetails.save();

    return {
      status: "success",
      accessToken: sessionDetails.accessToken,
      refreshToken: sessionDetails.refreshToken,
    };
  } catch (error) {
    next(error);
  }
};
