import UserModel from "./../models/UserModel.js";
import {
  destroyOnCloudinary,
  uploadOnCloudinary,
} from "../utils/CloudinaryUtility.js";
import EmailSend from "../utils/EmailUtility.js";
import {
  restrictAccountTemplate,
  warningAccountTemplate,
} from "../templates/emailTemplates.js";
import dotenv from "dotenv";
import Joi from "joi";
import { removeUnusedLocalFile } from "../utils/FileCleanUpUtility.js";
import { calculatePagination } from "../utils/PaginationUtility.js";
import AdminModel from "../models/AdminModel.js";
import { sendNotificationToUser } from "../utils/NotificationsUtility.js";
import { NOTIFICATION_ACTIONS } from "../constants/Notifications.js";
dotenv.config();

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

const cleanUpExistingNid = async (user) => {
  if (user.nidFront && user.nidFront.pid) {
    await destroyOnCloudinary(user.nidFront.pid);
  }
  if (user.nidBack && user.nidBack.pid) {
    await destroyOnCloudinary(user.nidBack.pid);
  }
};

export const profileService = async (req, next) => {
  try {
    let userID = req.headers.id;
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

export const updatePasswordService = async (req, next) => {
  try {
    const schema = Joi.object().keys({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
      confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
    });

    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return {
        status: "fail",
        message: "Object validation failed",
        error: error,
      };
    }

    const { currentPassword, newPassword } = value;

    const user = await UserModel.findById(req.headers.id).select("password");

    const isCorrectPassword = await user.isPasswordCorrect(currentPassword);
    if (!isCorrectPassword) {
      return { status: "fail", message: "Current passowrd does not matched" };
    }

    user.password = newPassword;

    await user.save();

    return {
      status: "success",
      message: "Password updated",
    };
  } catch (error) {
    next(error);
  }
};

export const updateAvatarService = async (req, next) => {
  let userAvatar = "";
  try {
    let userID = req.headers.id;
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
  let responses = {};
  try {
    let userID = req.headers.id;
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
        message: "An approval requests is pending already.",
      };
    }

    await cleanUpExistingNid(user);

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

//_____Admin______
export const getUserListService = async (req, next) => {
  try {
    let query = {};
    const { status, page, limit, sortBy, sortOrder } = req.query;
    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    //Admin can search user by their account status also
    if (status) {
      query.accountStatus = status;
    }

    const totalUser = await UserModel.countDocuments(query);

    const data = await UserModel.find(query)
      .sort({ [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1 })
      .limit(pagination.limit)
      .skip(pagination.skip)
      .select("-password");

    if (!data) {
      return { status: "fail", message: "Failed to load user list" };
    }
    return {
      status: "success",
      total: totalUser,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalUser / pagination.limit),
      },
      data: data,
    };
  } catch (error) {
    next(error);
  }
};

export const withdrawRestrictionsService = async (req, next) => {
  try {
    const data = await UserModel.findOneAndUpdate(
      { _id: req.params.userId },
      { $set: { accountStatus: "Validate" } },
      { new: true }
    );
    if (!data) {
      return { status: "fail", message: "Failed to withdraw restriction" };
    }
    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const warningAccountService = async (req, next) => {
  try {
    const { userId } = req.params;
    const data = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $set: { accountStatus: "Warning" }, $inc: { warningCount: 1 } },
      { new: true }
    );
    if (!data) {
      return { status: "fail", message: "Failed to warning account" };
    }

    const adminResponse = await AdminModel.findOneAndUpdate(
      { _id: req.headers.id },
      { $addToSet: { warnedAccounts: userId } }
    );
    if (!adminResponse) {
      return {
        status: "fail",
        message: "Failed to warning account, check admin model",
      };
    }

    await sendNotificationToUser({
      action: NOTIFICATION_ACTIONS.WARNING_ACCOUNT,
      userId: userId,
      senderId: req.headers.id,
    });

    const emailTemplate = warningAccountTemplate({ name: data.name });
    await EmailSend(
      data.email,
      emailTemplate.subject,
      emailTemplate.htmlContent
    );

    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const restrictAccountService = async (req, next) => {
  try {
    const { userId } = req.params;
    const data = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $set: { accountStatus: "Restricted" } },
      { new: true }
    );
    if (!data) {
      return { status: "fail", message: "Failed to restrict account" };
    }

    const adminResponse = await AdminModel.findOneAndUpdate(
      { _id: req.headers.id },
      { $addToSet: { restrictedAccounts: userId } }
    );
    if (!adminResponse) {
      return {
        status: "fail",
        message: "Failed to restrict account, check admin model",
      };
    }

    //Send email
    const emailTemplate = restrictAccountTemplate({ name: data.name });
    await EmailSend(
      data.email,
      emailTemplate.subject,
      emailTemplate.htmlContent
    );
    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const getReviewNidListService = async (req, next) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;

    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    const totalCount = await UserModel.countDocuments({
      nidSubmitted: true,
      nidFront: { $exists: true, $ne: null },
      nidBack: { $exists: true, $ne: null },
    });

    const data = await UserModel.find({
      nidSubmitted: true,
      nidFront: { $exists: true, $ne: null },
      nidBack: { $exists: true, $ne: null },
    })
      .sort({ [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1 })
      .limit(pagination.limit)
      .skip(pagination.skip)
      .select("_id name email nidFront nidBack");

    if (!data) {
      return {
        status: "fail",
        message: "Failed to load review nid list",
      };
    }

    return {
      status: "success",
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalCount / pagination.limit),
      },
      data: data,
    };
  } catch (error) {
    next(error);
  }
};

export const approveNidService = async (req, next) => {
  try {
    let userID = req.params.userId;
    const data = await UserModel.findOneAndUpdate(
      {
        _id: userID,
        nidSubmitted: true,
        nidFront: { $exists: true, $ne: null },
        nidBack: { $exists: true, $ne: null },
      },
      {
        $set: {
          nidVerified: true,
        },
      },
      { new: true }
    );

    if (!data) {
      return {
        status: "fail",
        message: "User or user's NID not found",
      };
    }

    return {
      status: "success",
      message: "NID requests Approved",
      data: data,
    };
  } catch (error) {
    next(error);
  }
};

export const declineNidService = async (req, next) => {
  try {
    let userID = req.params.userId;
    const data = await UserModel.findOneAndUpdate(
      {
        _id: userID,
        nidSubmitted: true,
        nidFront: { $exists: true, $ne: null },
        nidBack: { $exists: true, $ne: null },
      },
      {
        $set: {
          nidVerified: false,
          nidSubmitted: false,
          nidFront: "",
          nidBack: "",
        },
      },
      { new: true }
    );

    if (!data) {
      return {
        status: "fail",
        message: "User or user's NID not found",
      };
    }

    return {
      status: "success",
      message: "NID requests Declined",
      data: data,
    };
  } catch (error) {
    next(error);
  }
};

export const searchUserService = async (req, next) => {
  try {
    const { user, page, limit, sortBy, sortOrder } = req.query;

    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    const response = await UserModel.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: user, $options: "i" } },
            { phone: { $regex: user, $options: "i" } },
          ],
        },
      },
      {
        $sort: {
          [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1,
        },
      },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          paginatedResults: [
            { $limit: pagination.limit },
            { $skip: pagination.skip },
            {
              $project: {
                password: 0,
                sessionId: 0,
              },
            },
          ],
        },
      },
    ]);

    if (!response) {
      return { status: "fail", message: "No account found" };
    }

    const { totalCount, paginatedResults } = response[0];
    const totalItems = totalCount.length > 0 ? totalCount[0].count : 0;

    return {
      status: "success",
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalItems / pagination.limit),
      },
      data: paginatedResults,
    };
  } catch (error) {
    next(error);
  }
};
