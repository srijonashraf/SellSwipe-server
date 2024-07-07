import mongoose from "mongoose";
import UserModel from "./../models/UserModel.js";
import {
  destroyOnCloudinary,
  uploadOnCloudinary,
} from "./../utility/Cloudinary/Cloudinary.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../helper/TokenGeneratorHelper.js";
import SessionDetailsModel from "../models/SessionDetailsModel.js";
import OtpModel from "./../models/OtpModel.js";
import EmailSend from "../helper/EmailHelper.js";
import {
  afterEmailVerificationTemplate,
  afterResetPasswordTemplate,
  emailVerificationTemplate,
  resetPasswordTemplate,
} from "../emailTemplate/SendEmailTemplate.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import validator from "validator";
import Joi from "joi";
import { inputSanitizer } from "../middlewares/RequestValidateMiddleware.js";
import { currentTime } from "./../constants/CurrectTime.js";
import { baseUrl } from "../constants/BaseUrl.js";
import { fetchLocation } from "./../helper/LocationHelper.js";
import { removeUnusedLocalFile } from "./../helper/RemoveUnusedFilesHelper.js";
dotenv.config();

const ObjectID = mongoose.Types.ObjectId;

export const userRegistrationService = async (req, next) => {
  try {
    const reqBody = req.body;
    const userEmail = req.body.email;
    const existingUser = await UserModel.find({
      email: userEmail,
    }).count();

    if (!existingUser) {
      const newUser = await UserModel.create(reqBody);

      await sendVerificationEmailService(req);

      return {
        status: "success",
        data: newUser,
      };
    }
    return { status: "fail", message: "This account already exist" };
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
        code: 1,
        message: "Wrong credential",
      };
    }

    const packet = { _id: user._id, role: user.role };

    const [accessTokenResponse, refreshTokenResponse] = await Promise.all([
      generateAccessToken(packet),
      generateRefreshToken(packet),
    ]);

    // //!!Free limit 45 Fire in a minute, if anything goes wrong check here.
    // Fetch location details based on IP address
    const location = await fetchLocation(req);
    //Set session details to DB
    const sessionBody = {
      deviceName: req.headers["user-agent"],
      lastLogin: new Date().toISOString(),
      accessToken: accessTokenResponse,
      refreshToken: refreshTokenResponse,
      location: location,
      ipAddress: req.ip,
    };

    const session = await SessionDetailsModel.create(sessionBody);

    if (user.sessionId && Array.isArray(user.sessionId)) {
      user.sessionId.push(session._id);
      user.lastLogin = new Date().toISOString();
      user.loginAttempt = 0;
      user.limitedLogin = "";
      await user.save();
    } else {
      console.error(
        "User sessionId is not defined or is not an array:",
        user.sessionId
      );
    }

    // Set the sessionId to the UserModel
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

export const userAvatarUpdateService = async (req, next) => {
  let userAvatar = "";
  try {
    let userID = new ObjectID(req.headers.id);
    const filePath = req.file.path; //For single file
    if (!filePath) {
      return { status: "fail", message: "No file selected" };
    }

    //Upload on cloudinary
    userAvatar = await uploadOnCloudinary(filePath);
    const response = await UserModel.findOne({ _id: userID }).exec();

    //At first delete the previous avatar
    if (response.avatar.pid) {
      await destroyOnCloudinary(response.avatar.pid);
    }

    //Set the avatar details to response object
    response.avatar = {
      url: userAvatar.secure_url,
      pid: userAvatar.public_id,
    };

    //Save object to database
    await response.save();

    if (!response) {
      return { status: "fail", message: "Failed to update profile photo" };
    }
    return { status: "success", cloudinary: userAvatar, data: response };
  } catch (error) {
    removeUnusedLocalFile(req.file.path);
    destroyOnCloudinary(userAvatar.public_id);
    next(error);
  }
};

const cleanupLocalFiles = (files) => {
  if (files && files.nidFront) {
    for (const file of files.nidFront) {
      removeUnusedLocalFile(file.path);
    }
  }
  if (files && files.nidBack) {
    for (const file of files.nidBack) {
      removeUnusedLocalFile(file.path);
    }
  }
};

const cleanupCloudinaryFiles = async (responses) => {
  if (responses.nidFrontResponse) {
    await destroyOnCloudinary(responses.nidFrontResponse.public_id);
  }
  if (responses.nidBackResponse) {
    await destroyOnCloudinary(responses.nidBackResponse.public_id);
  }
};

const deleteExistingFiles = async (user) => {
  if (user.nidFront && user.nidFront.pid) {
    await destroyOnCloudinary(user.nidFront.pid);
  }
  if (user.nidBack && user.nidBack.pid) {
    await destroyOnCloudinary(user.nidBack.pid);
  }
};

export const userNidUpdateRequestService = async (req, next) => {
  const responses = {};
  try {
    let userID = new ObjectID(req.headers.id);
    const filePaths = req.files;

    if (!filePaths) {
      return { status: "fail", message: "No file uploaded" };
    }

    const { nidFront, nidBack } = filePaths;
    if (!nidFront || !nidBack) {
      return { status: "fail", message: "File missing" };
    }

    const user = await UserModel.findOne({ _id: userID }).exec();
    if (!user) {
      return { status: "fail", message: "User not found." };
    }

    if (user.nidSubmitted) {
      cleanupLocalFiles(req.files);
      return {
        status: "fail",
        message: "An approval request is pending already.",
      };
    }

    await deleteExistingFiles(user);

    responses.nidFrontResponse = await uploadOnCloudinary(nidFront[0].path);
    responses.nidBackResponse = await uploadOnCloudinary(nidBack[0].path);

    user.nidFront = {
      url: responses.nidFrontResponse.secure_url,
      pid: responses.nidFrontResponse.public_id,
    };

    user.nidBack = {
      url: responses.nidBackResponse.secure_url,
      pid: responses.nidBackResponse.public_id,
    };

    user.nidSubmitted = true;
    await user.save();

    return { status: "success", data: user };
  } catch (error) {
    cleanupLocalFiles(req.files);
    await cleanupCloudinaryFiles(responses);
    next(error);
  }
};

export const userProfileUpdateService = async (req, next) => {
  try {
    let id = req.headers.id;
    let role = req.headers.role;

    const response = await UserModel.findOneAndUpdate(
      { _id: id, role: role },
      { $set: req.body },
      { new: true }
    ).select("-password");

    if (!response) {
      return { status: "fail", message: "Failed to update profile details" };
    }
    return {
      status: "success",
      message: "Profile details updated",
      data: response,
    };
  } catch (error) {
    next(error);
  }
};
export const userProfileDetailsService = async (req, next) => {
  try {
    let userID = new ObjectID(req.headers.id);
    const user = await UserModel.findOne({ _id: userID }).select(
      "-password -sessionId -phoneVerified -nidVerified -emailVerified -accountStatus -warningCount"
    );
    if (!user) {
      return { status: "fail", message: "Failed to load user profile" };
    }
    return { status: "success", data: user };
  } catch (error) {
    next(error);
  }
};

export const userAllSessionService = async (req, next) => {
  try {
    let userID = new ObjectID(req.headers.id);
    const user = await UserModel.findOne({ _id: userID }).populate(
      "sessionId",
      "-accessToken -refreshToken -ipAddress -createdAt -updatedAt"
    );

    if (!user) {
      return { status: "fail", message: "User not found" };
    }

    return { status: "success", data: user.sessionId };
  } catch (error) {
    next(error);
  }
};

export const userLogoutFromSessionService = async (req, next) => {
  try {
    const sessionID = req.query.sessionId;

    // Find the user and check if the sessionID exists in the sessionId array
    const user = await UserModel.findOne({
      _id: req.headers.id,
      sessionId: { $in: [sessionID] },
    }).select("sessionId");

    if (!user) {
      return {
        status: "fail",
        message:
          "Failed to logout from the session. SessionID not found in User Model.",
      };
    }

    // Delete the session from SessionDetailsModel
    const response = await SessionDetailsModel.deleteOne({ _id: sessionID });

    if (!response.deletedCount) {
      return {
        status: "fail",
        message: "Failed to logout from session.",
      };
    }

    // Remove the sessionID from the user's sessionId array
    const sessionIndex = user.sessionId.indexOf(sessionID);
    if (sessionIndex > -1) {
      user.sessionId.splice(sessionIndex, 1);
    }

    // Save the updated user document
    await user.save();

    return {
      status: "success",
      message: "Logged out from the session.",
    };
  } catch (error) {
    console.error(error);
    return {
      status: "fail",
      message: "Something went wrong.",
    };
  }
};

export const sendVerificationEmailService = async (req, next) => {
  try {
    const input = req.body;

    //Joi validation
    const objectSchema = Joi.object({
      email: Joi.string().email().required(),
    }).unknown(true);

    const { error, value } = objectSchema.validate(input, {
      abortEarly: false,
    });
    if (error) {
      return {
        status: "fail",
        message: "Invalid object",
        errors: error.details,
      };
    }

    // Get the email after validation
    let userEmail = validator.escape(value.email);

    let otp = Math.floor(100000 + Math.random() * 900000);
    let token = jwt.sign({ userEmail }, process.env.JWT_GENERAL_TOKEN_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRE_TIME,
    });

    const user = await UserModel.findOne({ email: userEmail }).exec();
    if (!user) {
      return { status: "fail", message: "No registered user found" };
    }

    /*This method will only work if the frontend and backend are in same domain (combined architecture)
    else we have to manually set the url of the frontend to follow from backend.
    e.g: sellswipe.com/emailVerificationByLink?userId={}
    */

    //This link will be followed by frontend
    const link = `${baseUrl(req)}/emailVerificationByLink?userId=${
      user._id
    }&token=${token}`;

    const sentOTP = await OtpModel.create({
      userID: user._id,
      email: user.email,
      otp: otp,
      token: token,
      initiated: currentTime,
      expiresAt: currentTime + parseInt(process.env.OTP_EXPIRE_TIME),
      expired: false,
    });

    const emailTemplateResponse = await emailVerificationTemplate({
      name: user.name,
      link: link,
    });
    await EmailSend(
      user.email,
      emailTemplateResponse.subject,
      emailTemplateResponse.htmlContent
    );

    return {
      status: "success",
      message: "A verification email sent successfully! Check your mailbox.",
    };
  } catch (error) {
    next(error);
  }
};

export const sendResetPasswordEmailService = async (req, next) => {
  try {
    //If from UserRegistration then get the input from body and if from ResetPassword then from query
    const input = req.query;

    //Joi validation
    const objectSchema = Joi.object({
      email: Joi.string().email().required(),
    }).unknown(true);

    const { error, value } = objectSchema.validate(input, {
      abortEarly: false,
    });
    if (error) {
      return {
        status: "fail",
        message: "Invalid object",
        errors: error.details,
      };
    }

    // Get the email after validation
    let userEmail = validator.escape(value.email);

    let otp = Math.floor(100000 + Math.random() * 900000);
    let token = jwt.sign({ userEmail }, process.env.JWT_GENERAL_TOKEN_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRE_TIME,
    });

    const user = await UserModel.findOne({ email: userEmail }).exec();
    if (!user) {
      return { status: "fail", message: "No registered user found" };
    }

    //This link will be followed by frontend

    const link = `${baseUrl(req)}/resetPasswordByLink?userId=${
      user._id
    }&token=${token}`;

    const sentOTP = await OtpModel.create({
      userID: user._id,
      email: user.email,
      otp: otp,
      token: token,
      initiated: currentTime,
      expiresAt: currentTime + parseInt(process.env.OTP_EXPIRE_TIME),
      expired: false,
    });

    const emailTemplateResponse = await resetPasswordTemplate({
      name: user.name,
      link: link,
      otp: otp,
    });

    await EmailSend(
      user.email,
      emailTemplateResponse.subject,
      emailTemplateResponse.htmlContent
    );

    return {
      status: "success",
      message: "A verification email sent successfully! Check your mailbox.",
    };
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
    const requestQueryParams = req.query;
    inputSanitizer(requestQueryParams);
    const { otp, email } = requestQueryParams;

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

    // Send email verification success template
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

export const resetPasswordByLinkService = async (req, next) => {
  try {
    const requestQueryParam = req.query;
    const requestBody = req.body;
    inputSanitizer(requestQueryParam);
    inputSanitizer(requestBody);

    const { userId, token } = requestQueryParam;
    const { newPassword, confirmPassword } = requestBody;

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

