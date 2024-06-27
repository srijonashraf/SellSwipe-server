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
dotenv.config();

const ObjectID = mongoose.Types.ObjectId;

export const userRegistrationService = async (req) => {
  try {
    const reqBody = req.body;
    const userEmail = req.body.email;
    const existingUser = await UserModel.find({
      email: userEmail,
    }).count();

    if (!existingUser) {
      const newUser = await UserModel.create(reqBody);

      await sendVerificationEmailService(req);

      const newUserObj = newUser.toObject();
      delete newUserObj.password;

      return {
        status: "success",
        data: newUserObj,
      };
    }
    return { status: "fail", message: "This account already exist" };
  } catch (error) {
    console.log(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const userLoginService = async (req, res, next) => {
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
    console.log(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const userAvatarUpdateService = async (req) => {
  try {
    let userID = new ObjectID(req.headers.id);
    const filePath = req.file.path; //For single file
    if (!filePath) {
      throw new Error("No files uploaded.");
    }

    //Upload on cloudinary
    const userAvatar = await uploadOnCloudinary(filePath);
    const response = await UserModel.findOne({ _id: userID }).exec();
    //At first delete the previous avatar
    if (response.avatar.pid) {
      await destroyOnCloudinary(response.avatar.pid);
    }

    response.avatar = {
      url: userAvatar.secure_url,
      pid: userAvatar.public_id,
    };

    await response.save();

    if (!response) {
      return { status: "fail", message: "Failed to update profile photo" };
    }
    return { status: "success", cloudinary: userAvatar, data: response };
  } catch (error) {
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const userNidUpdateRequestService = async (req) => {
  try {
    let userID = new ObjectID(req.headers.id);
    const filePaths = req.files;
    if (!filePaths) {
      throw new Error("No files uploaded.");
    }
    const { nidFront, nidBack } = filePaths;

    if (!nidFront || !nidBack) {
      throw new Error("File missing.");
    }

    const user = await UserModel.findOne({ _id: userID }).exec();
    if (user.nidSubmitted) {
      return {
        status: "fail",
        message: "An approval request is pending already.",
      };
    }

    //Todo: User can select any images of NID and can delete that
    //Delete Existing File
    if (user.nidFront && user.nidFront.pid) {
      await destroyOnCloudinary(user.nidFront.pid);
    }
    if (user.nidBack && user.nidBack.pid) {
      await destroyOnCloudinary(user.nidBack.pid);
    }

    //Upload on Cloudinary
    const nidFrontResponse = await uploadOnCloudinary(nidFront[0].path);
    const nidBackResponse = await uploadOnCloudinary(nidBack[0].path);

    if (!user) {
      return { status: "fail", message: "User not found." };
    }

    //Save new file links
    user.nidFront = {
      url: nidFrontResponse.secure_url,
      pid: nidFrontResponse.public_id,
    };

    user.nidBack = {
      url: nidBackResponse.secure_url,
      pid: nidBackResponse.public_id,
    };

    user.nidSubmitted = true;

    await user.save();

    return { status: "success", data: user };
  } catch (error) {
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const userProfileUpdateService = async (req) => {
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
    console.log(error);
    return { status: "fail", message: "Something went wrong" };
  }
};
export const userProfileDetailsService = async (req) => {
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
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const userAllSessionService = async (req, res) => {
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
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const userLogoutFromSessionService = async (req, res) => {
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

export const sendVerificationEmailService = async (req) => {
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

    //These links will be followed by frontend

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
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const sendResetPasswordEmailService = async (req) => {
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

    //These links will be followed by frontend

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
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const emailVerificationByLinkService = async (req) => {
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
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const emailVerificationByOtpService = async (req) => {
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
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const resetPasswordByLinkService = async (req) => {
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

    const emailTemplateResponse = afterResetPasswordTemplate({
      name: user.name,
      ip: req.ip,
      location: location,
      device: req.get("User-Agent"),
      time: new Date(),
    });

    await EmailSend(
      user.email,
      emailTemplateResponse.subject,
      emailTemplateResponse.htmlContent
    );

    return { status: "success", message: "Password changed successfully" };
  } catch (error) {
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const resetPasswordByOtpService = async (req, res) => {
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

    let updatePasswordResponse = await UserModel.findOneAndUpdate(
      { email: email },
      { $set: { password: newPassword } },
      {
        new: true,
      }
    );

    if (!updatePasswordResponse) {
      return { status: "fail", message: "Password reset failed" };
    }

    await OtpModel.deleteMany({ email: email });

    return { status: "success", message: "Password reset successfully" };
  } catch (error) {
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};
