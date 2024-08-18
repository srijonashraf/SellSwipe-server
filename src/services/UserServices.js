import mongoose from "mongoose";
import UserModel from "./../models/UserModel.js";
import {
  destroyOnCloudinary,
  uploadOnCloudinary,
} from "../utility/Cloudinary.js";
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
import dotenv from "dotenv";
import validator from "validator";
import Joi from "joi";
import { inputSanitizer } from "../middlewares/RequestValidateMiddleware.js";
import { currentTime } from "./../constants/CurrectTime.js";
import { fetchLocation } from "./../helper/LocationHelper.js";
import { removeUnusedLocalFile } from "./../helper/RemoveUnusedFilesHelper.js";
import PostModel from "../models/PostModel.js";
import FavouriteModel from "../models/FavouriteModel.js";
import { errorCodes } from "../constants/ErrorCodes.js";
import { generateOtpAndLink } from "../utility/OtpandLink.js";
import { emailTypes } from "./../constants/emailTypes.js";
dotenv.config();

const ObjectID = mongoose.Types.ObjectId;

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

export const registrationService = async (req, next) => {
  try {
    const reqBody = req.body;
    const userEmail = reqBody.email;

    const existingUser = await UserModel.countDocuments({ email: userEmail });

    if (existingUser > 0) {
      return { status: "fail", message: "This account already exists" };
    }

    const newUser = await UserModel.create(reqBody);

    const emailResponse = await sendAuthEmailsService({
      req,
      emailType: emailTypes.EMAIL_VERIFICATION,
      next,
    });

    if (emailResponse) {
      return {
        status: "success",
        data: newUser,
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

export const loginService = async (req, next) => {
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

export const profileService = async (req, next) => {
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

export const updateProfileService = async (req, next) => {
  try {
    //Using fineOne instead of findOneAndUpdate beacuse findOneAndUpdate doesn't trigger the pre "save" which is a must for hashing
    const user = await UserModel.findById(req.headers.id).select("-password");
    if (!user) {
      return { status: "fail", message: "User not found" };
    }
    // Update the user document with values from req.body
    Object.assign(user, req.body);

    const updatedUser = await user.save();

    return {
      status: "success",
      message: "Profile details updated",
      data: updatedUser,
    };
  } catch (error) {
    next(error);
  }
};


export const updateAvatarService = async (req, next) => {
  let userAvatar = "";
  try {
    let userID = new ObjectID(req.headers.id);
    const filePath = req.file.path; //For single file
    if (!filePath) {
      return { status: "fail", message: "No file selected" };
    }

    //Upload on cloudinary
    userAvatar = await uploadOnCloudinary(filePath, req.headers.id);
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

export const updateNidService = async (req, next) => {
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

    responses.nidFrontResponse = await uploadOnCloudinary(
      nidFront[0].path,
      req.headers.id
    );
    responses.nidBackResponse = await uploadOnCloudinary(
      nidBack[0].path,
      req.headers.id
    );

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

export const allSessionService = async (req, next) => {
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

export const logoutSessionService = async (req, next) => {
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

export const sendAuthEmailsService = async ({ req, emailType, next }) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email }).exec();
    if (!user) {
      return { status: "fail", message: "No registered user found" };
    }
    const { otp, link } = await generateOtpAndLink(
      req,
      email,
      user._id,
      emailType
    );

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

export const reportPostService = async (req, next) => {
  try {
    const postID = new ObjectID(req.params.id);
    const reqBody = req.body;

    inputSanitizer(reqBody);

    const { reportCause } = reqBody;

    const reportResponse = await PostModel.findOneAndUpdate(
      {
        _id: postID,
        "reportedBy.userId": { $nin: [new ObjectID(req.headers.id)] },
      },
      {
        $addToSet: {
          reportedBy: {
            userId: new ObjectID(req.headers.id),
            role: req.headers.role,
            causeOfReport: reportCause,
          },
        },
        $inc: { reportCount: 1 },
      },
      { new: true }
    );

    if (!reportResponse) {
      return {
        stutus: "fail",
        message: "A report is already pending or failed to report the post",
      };
    }
    return {
      status: "success",
      message: "Report has been submitted successfully.",
    };
  } catch (error) {
    next(error);
  }
};

export const favouritePostService = async (req, next) => {
  try {
    const postID = new ObjectID(req.params.id);
    const userID = new ObjectID(req.headers.id);

    const favouriteResponse = await FavouriteModel.findOneAndUpdate(
      { postID, userID },
      {
        $set: { postID, userID },
      },
      {
        new: true,
        upsert: true,
      }
    );

    if (!favouriteResponse) {
      return {
        status: "fail",
        message: "Post or user not found",
      };
    }

    return {
      status: "success",
      message: "Post added to favourite",
    };
  } catch (error) {
    next(error);
  }
};

export const favouritePostListService = async (req, next) => {
  try {
    const result = await FavouriteModel.find({ userID: req.headers.id });

    if (!result) {
      return {
        status: "fail",
        message: "Post or user not found",
      };
    }

    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    next(error);
  }
};

export const activePostService = async (req, next) => {
  try {
    const postID = new ObjectID(req.query.postId);
    const userID = new ObjectID(req.headers.id);

    const result = await PostModel.findOneAndUpdate(
      { _id: postID, userID: userID },
      { $set: { isActive: true } }
    );

    if (!result) {
      return {
        status: "fail",
        message: "Post or user not found",
      };
    }

    return {
      status: "success",
      message: "Your post is now active",
    };
  } catch (error) {
    next(error);
  }
};

export const inActivePostService = async (req, next) => {
  try {
    const postID = new ObjectID(req.query.postId);
    const userID = new ObjectID(req.headers.id);

    const result = await PostModel.findOneAndUpdate(
      { _id: postID, userID: userID },
      { $set: { isActive: false } }
    );

    if (!result) {
      return {
        status: "fail",
        message: "Post or user not found",
      };
    }

    return {
      status: "success",
      message: "Your post is now inactive",
    };
  } catch (error) {
    next(error);
  }
};
