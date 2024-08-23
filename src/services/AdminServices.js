import AdminModel from "./../models/AdminModel.js";
import SessionDetailsModel from "./../models/SessionDetailsModel.js";
import UserModel from "./../models/UserModel.js";
import PostModel from "./../models/PostModel.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/TokenUtility.js";
import mongoose from "mongoose";
import PostDetailsModel from "../models/PostDetailsModel.js";
import { inputSanitizer } from "../middlewares/RequestValidateMiddleware.js";
import {
  promotionalEmailTemplate,
  restrictAccountTemplate,
  warningAccountTemplate,
} from "./../templates/emailTemplates.js";
import EmailSend from "../utils/EmailUtility.js";
import PromotionsModel from "../models/PromotionsModel.js";
import {
  notificationsForUser,
  sendNotificationToUser,
} from "../utils/NotificationsUtility.js";
import { calculatePagination } from "../utils/PaginationUtility.js";
const ObjectID = mongoose.Types.ObjectId;

export const loginService = async (req, next) => {
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
    const refreshTokenResponse = generateRefreshToken(admin);

    // Fetch location data and handle errors
    let location = {};
    try {
      const fetchResponse = await fetch(`http://ip-api.com/json/${req.ip}`);
      if (!fetchResponse.ok) {
        throw new Error("Failed to fetch location data");
      }
      location = await fetchResponse.json();
    } catch (error) {
      console.error("Location fetch error:", error);
    }

    // Set session details to DB
    const sessionBody = {
      deviceName: req.headers["user-agent"],
      lastLogin: new Date().toISOString(),
      accessToken: accessTokenResponse,
      refreshToken: refreshTokenResponse,
      location: location,
      ipAddress: req.ip,
    };

    //Create a mew session
    const session = await SessionDetailsModel.create(sessionBody);
    // Set the sessionId to the AdminModel
    data.sessionId.push(session._id);
    await data.save();

    if (session) {
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

export const getProfileService = async (req, next) => {
  try {
    const userID = req.params.id;
    // SuperAdmin can check any admin's profile if by sending the userId into query
    if (req.headers.role === "SuperAdmin" && userID) {
      const data = await AdminModel.findById(userID).select("-password");
      return { status: "success", data: data };
    }
    // Get the profile by own userId
    const data = await AdminModel.findOne({ _id: req.headers.id }).select(
      "-password"
    );
    if (!data) {
      return { status: "fail", message: "Failed to load admin profile" };
    }
    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const createAdminService = async (req, next) => {
  try {
    let reqBody = req.body;
    //Check if account already exists
    const existingAdmin = await AdminModel.findOne({
      email: reqBody.email,
    }).exec();

    if (existingAdmin) {
      return { status: "fail", message: "Admin already exists" };
    }
    //Create a new admin if not exists
    const data = await AdminModel.create(reqBody);
    if (!data) {
      return { status: "fail", message: "Failed to add new admin" };
    }
    //Set superAdmin info in the ref
    data.ref = { name: req.headers.name, id: req.headers.id };
    await data.save();
    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const updateAdminService = async (req, next) => {
  try {
    //Using fineOne instead of findOneAndUpdate beacuse findOneAndUpdate doesn't trigger the pre "save" which is a must for hashing
    const admin = await AdminModel.findById(req.headers.id).select("-password");
    if (!admin) {
      return { status: "fail", message: "No profile found" };
    }

    if (admin.role !== "SuperAdmin" && req.body.role === "SuperAdmin") {
      return {
        status: "fail",
        message: "Only Super admin can change the role.",
      };
    }

    //Assign the req.body values to admin document
    Object.assign(admin, req.body);

    const updatedAdmin = await admin.save();

    return {
      status: "success",
      message: "Profile details updated",
      data: updatedAdmin,
    };
  } catch (error) {
    next(error);
  }
};

export const deleteAdminService = async (req, next) => {
  try {
    const data = await AdminModel.deleteOne({ _id: req.params.id });
    if (!data || data.deletedCount < 1) {
      return { status: "fail", message: "Failed to delete admin" };
    }
    return { status: "success", message: "Admin has been deleted", data: [] };
  } catch (error) {
    next(error);
  }
};

export const getAdminListService = async (req, next) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;
    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    const totalAdmin = await AdminModel.countDocuments();

    const data = await AdminModel.find()
      .sort({ [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1 })
      .limit(pagination.limit)
      .skip(pagination.skip)
      .select("-password");

    if (!data) {
      return { status: "fail", message: "Failed to load admin list" };
    }
    return {
      status: "success",
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalAdmin / pagination.limit),
      },
      data: data,
    };
  } catch (error) {
    next(error);
  }
};

export const getUserListService = async (req, next) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;
    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    const totalUser = await UserModel.countDocuments();

    const data = await UserModel.find()
      .sort({ [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1 })
      .limit(pagination.limit)
      .skip(pagination.skip)
      .select("-password");

    if (!data) {
      return { status: "fail", message: "Failed to load user list" };
    }
    return {
      status: "success",
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

export const getReviewPostListService = async (req, next) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;
    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    // Build query for posts on review and not approved
    const query = {
      onReview: true,
      isApproved: false,
    };

    // Count the total number of documents matching the criteria
    const totalCount = await PostModel.countDocuments(query);

    // Fetch paginated and sorted posts
    const data = await PostModel.find(query)
      .sort({ [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1 })
      .limit(pagination.limit)
      .skip(pagination.skip);

    if (!data) {
      return { status: "fail", message: "Failed to load review post list" };
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

export const getReviewPostIdsService = async (req, next) => {
  try {
    const data = await PostModel.aggregate([
      {
        $match: { onReview: true, isApproved: false },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
        },
      },
    ]);
    if (!data) {
      return { status: "fail", message: "Failed to load review post list" };
    }
    const ids = data.map((item) => item._id.toString());
    return { status: "success", total: ids.length, data: { id: ids } };
  } catch (error) {
    next(error);
  }
};

export const getApprovedPostListService = async (req, next) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;
    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    // Only SuperAdmin can view all approved post, admin will view their own approved post only
    let query = {
      isApproved: true,
      onReview: false,
    };

    if (req.headers.role !== "SuperAdmin") {
      query["approvedBy.userId"] = new ObjectID(req.headers.id);
    }

    const totalCount = await PostModel.countDocuments(query);

    const data = await PostModel.find(query)
      .sort({ [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1 })
      .limit(pagination.limit)
      .skip(pagination.skip);

    if (!data) {
      return { status: "fail", message: "Failed to load approved post list" };
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

export const getDeclinedPostListService = async (req, next) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;
    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    // Only SuperAdmin can view all canceled post, admin will view their own canceled post only

    let query = {
      isApproved: false,
      onReview: false,
      isDeclined: true,
    };

    if (req.headers.role !== "SuperAdmin") {
      query["declinedBy.userId"] = new ObjectID(req.headers.id);
    }

    const totalCount = await PostModel.countDocuments(query);

    const data = await PostModel.find(query)
      .sort({ [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1 })
      .limit(pagination.limit)
      .skip(pagination.skip);

    if (!data) {
      return { status: "fail", message: "Failed to load declined post list" };
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

export const getReportedPostListService = async (req, next) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;
    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    const query = {
      reportCount: { $gte: 1 },
    };

    const totalCount = await PostModel.countDocuments(query);

    const data = await PostModel.find(query)
      .sort({ [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1 })
      .limit(pagination.limit)
      .skip(pagination.skip);

    if (!data) {
      return { status: "fail", message: "Failed to load reported post list" };
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

export const withdrawReportService = async (req, next) => {
  try {
    const { postId, id } = req.params; //id is report id
    const data = await PostModel.findOneAndUpdate(
      { _id: postId, "reportedBy._id": id },
      {
        $pull: { reportedBy: { _id: id } },
        $inc: { reportCount: -1 },
      },
      {
        new: true,
      }
    );

    if (!data) {
      return { status: "fail", message: "Failed to withdraw report" };
    }

    // Manually ensure reportCount does not go below zero
    if (data.reportCount < 0) {
      data.reportCount = 0;
      await data.save();
    }

    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const approvePostService = async (req, next) => {
  try {
    /*req.body should receive an array like this [{
        "postId": [
            "66a3de66e505fd46ea7c2435",
            "66a3de66e505fd46ea7c2435"
        ]
        or
        "postId": [
            "66a3de66e505fd46ea7c2435"
        ]
          */

    const postId = req.body.postId;
    const { id, name, role } = req.headers;

    inputSanitizer(postId);

    const data = await PostModel.updateMany(
      { _id: { $in: postId } },
      {
        $set: {
          isDeclined: false,
          onReview: false,
          declinedBy: "",
          isApproved: true,
          "approvedBy.userId": new ObjectID(id),
          "approvedBy.name": name,
          "approvedBy.role": role,
        },
      }
    );
    if (data.modifiedCount === 0) {
      return { status: "fail", message: "Failed to approve post" };
    }

    const adminResponse = await AdminModel.findOneAndUpdate(
      { _id: id },
      { $addToSet: { approvedPosts: { $each: postId } } }
    );

    if (!adminResponse) {
      return {
        status: "fail",
        message: "Failed to update admin model with decline posts",
      };
    }

    return { status: "success", data: [], message: "Posts Approved" };
  } catch (error) {
    next(error);
  }
};

export const declinePostService = async (req, next) => {
  try {
    /*req.body should receive an array like this [{
        "postId": [
            "66a3de66e505fd46ea7c2435",
            "66a3de66e505fd46ea7c2435"
        ]
        or
        "postId": [
            "66a3de66e505fd46ea7c2435"
        ]
          */

    const postId = req.body.postId;
    const { id, name, role } = req.headers;

    inputSanitizer(postId);

    const data = await PostModel.updateMany(
      { _id: { $in: postId } },
      {
        $set: {
          isApproved: false,
          onReview: false,
          approvedBy: "",
          isDeclined: true,
          "declinedBy.userId": new ObjectID(id),
          "declinedBy.name": name,
          "declinedBy.role": role,
        },
      }
    );

    if (data.modifiedCount === 0) {
      return { status: "fail", message: "Failed to decline post" };
    }

    const adminResponse = await AdminModel.findOneAndUpdate(
      { _id: id },
      { $addToSet: { declinedPosts: { $each: postId } } }
    );

    if (!adminResponse) {
      return {
        status: "fail",
        message: "Failed to update admin model with decline posts",
      };
    }

    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const deletePostService = async (req, next) => {
  const session = await mongoose.startSession();
  try {
    const postID = req.params.postId;
    await sendNotificationToUser({
      notificationType: notificationsForUser.DELETE_POST,
      postId: postID,
      sender: { id: req.headers.id, role: req.headers.role },
    });

    // Start the transaction
    session.startTransaction();

    // Delete post
    const post = await PostModel.deleteOne({ _id: postID }).session(session);

    if (!post) {
      return { status: "fail", message: "Post not found" };
    }

    if (post.deletedCount !== 1) {
      // If post delete fails, abort transaction
      await session.abortTransaction();
      return { status: "fail", message: "Failed to delete post by admin" };
    }

    // Delete post details
    const postDetails = await PostDetailsModel.deleteOne({
      postID: postID,
    }).session(session);

    if (postDetails.deletedCount !== 1) {
      // If post details delete fails, abort transaction
      await session.abortTransaction();
      return {
        status: "fail",
        message: "Failed to delete post details by admin",
      };
    }

    // If all deletes succeeded, commit the transaction
    await session.commitTransaction();

    return { status: "success", message: "Post deleted by admin successfully" };
  } catch (error) {
    // Abort the transaction on any error
    await session.abortTransaction();
    next(error);
    return { status: "fail", message: "Something went wrong" };
  } finally {
    // Ensure session is ended only once in the `finally` block
    await session.endSession();
  }
};

export const sendFeedbackService = async (req, next) => {
  try {
    const postID = req.params.postId;
    const reqBody = req.body;

    inputSanitizer(reqBody);

    const data = await PostModel.findOneAndUpdate(
      { _id: postID },
      {
        $addToSet: {
          feedback: {
            id: new ObjectID(req.headers.id),
            role: req.headers.role,
            comment: reqBody.feedback,
          },
        },
      },
      { new: true }
    );

    if (!data) {
      return { status: "fail", message: "Failed to send feedback" };
    }
    await sendNotificationToUser({
      notificationType: notificationsForUser.FEEDBACK_POST,
      postId: postID,
      sender: { id: req.headers.id, role: req.headers.role },
    });

    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const getWarnedAccountListService = async (req, next) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;

    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    const totalCount = await UserModel.countDocuments({
      accountStatus: "Warning",
    });

    const data = await UserModel.find({ accountStatus: "Warning" })
      .sort({ [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1 })
      .limit(pagination.limit)
      .skip(pagination.skip)
      .select("-password");

    if (!data) {
      return { status: "fail", message: "Failed to load warning account list" };
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

export const getRestrictedAccountListService = async (req, next) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;

    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });

    const totalCount = await UserModel.countDocuments({
      accountStatus: "Restricted",
    });

    const data = await UserModel.find({ accountStatus: "Restricted" })
      .sort({ [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1 })
      .limit(pagination.limit)
      .skip(pagination.skip)
      .select("-password");

    if (!data) {
      return {
        status: "fail",
        message: "Failed to load restricted account list",
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

export const withdrawRestrictionsService = async (req, next) => {
  try {
    const { userId } = req.params;
    const data = await UserModel.findOneAndUpdate(
      { _id: userId },
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
      notificationType: notificationsForUser.WARNING_ACCOUNT,
      userId: userId,
      sender: { id: req.headers.id, role: req.headers.role },
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

export const searchAdminService = async (req, next) => {
  try {
    const { admin, page, limit, sortBy, sortOrder } = req.query;
    const pagination = calculatePagination({
      page,
      limit,
      sortBy,
      sortOrder,
    });
    const response = await AdminModel.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: admin, $options: "i" } },
            { phone: { $regex: admin, $options: "i" } },
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
          totalCount: [
            {
              $count: "count",
            },
          ],
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

export const sendPromotionalEmailService = async (req, next) => {
  try {
    let emailTemplates = {};
    const { subject, title, content, userList } = req.body;
    if (!subject || !title || !content || !userList) {
      return {
        status: "fail",
        message: "Any of the required field is empty, failed to send emails",
      };
    }

    const data = await PromotionsModel.create(req.body);

    userList.forEach((user) => {
      emailTemplates[user.email] = promotionalEmailTemplate({
        subject: subject,
        title: title,
        name: user.name,
        content: content,
      });
    });

    for (let user in emailTemplates) {
      await EmailSend(
        user,
        emailTemplates[user].subject,
        emailTemplates[user].htmlContent
      );
    }
    return { status: "success", message: "All emails sent successfully" };
  } catch (error) {
    next(error);
  }
};
