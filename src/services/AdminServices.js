import AdminModel from "./../models/AdminModel.js";
import SessionDetailsModel from "./../models/SessionDetailsModel.js";
import UserModel from "./../models/UserModel.js";
import PostModel from "./../models/PostModel.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "./../helper/TokenGeneratorHelper.js";
import mongoose from "mongoose";
import PostDetailsModel from "../models/PostDetailsModel.js";
import { inputSanitizer } from "../middlewares/RequestValidateMiddleware.js";

export const adminLoginService = async (req, next) => {
  try {
    let reqBody = req.body;
    const data = await AdminModel.findOne({ email: reqBody.email }).exec();
    if (!data) {
      return { status: "fail", message: "No admin associated with this email" };
    }

    const isCorrectPassword = await data.isPasswordCorrect(reqBody.password);
    if (!isCorrectPassword) {
      return {
        status: "fail",
        message: "Wrong credential",
      };
    }

    const packet = { _id: data._id, role: data.role };
    const accessTokenResponse = generateAccessToken(packet);
    const refreshTokenResponse = generateRefreshToken(packet);

    //!!Free limit 45 Fire in a minute, if anything goes wrong check here.
    const fetchResponse = await fetch(`http://ip-api.com/json/${req.ip}`);
    const location = await fetchResponse.json();

    // Set session details to DB
    const sessionBody = {
      deviceName: req.headers["user-agent"],
      lastLogin: new Date().toISOString(),
      accessToken: accessTokenResponse,
      refreshToken: refreshTokenResponse,
      location: location,
      ipAddress: req.ip,
    };

    const session = await SessionDetailsModel.create(sessionBody);

    // Set the sessionId to the AdminModel
    data.sessionId.push(session._id);
    await data.save();

    if (accessTokenResponse && refreshTokenResponse && session) {
      return {
        status: "success",
        id: data._id,
        email: data.email,
        name: data.name,
        accessToken: accessTokenResponse,
        refreshToken: refreshTokenResponse,
      };
    } else {
      return { status: "fail", message: "Failed to login" };
    }
  } catch (error) {
    next(error);
  }
};

export const adminProfileDetailsService = async (req, next) => {
  try {
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

export const addNewAdminService = async (req, next) => {
  try {
    let reqBody = req.body;
    const existingAdmin = await AdminModel.findOne({
      email: reqBody.email,
    }).exec();
    if (existingAdmin) {
      return { status: "fail", message: "Admin already exists" };
    }
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

export const deleteAdminService = async (req, next) => {
  try {
    let id = req.query.id;
    const data = await AdminModel.deleteOne({ _id: id });
    if (!data) {
      return { status: "fail", message: "Failed to delete admin" };
    }
    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const adminListService = async (req, next) => {
  try {
    const data = await AdminModel.find({ role: "Admin" });
    if (!data) {
      return { status: "fail", message: "Failed to load admin list" };
    }
    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const userListService = async (req, next) => {
  try {
    const data = await UserModel.find({ role: "User" });
    if (!data) {
      return { status: "fail", message: "Failed to load user list" };
    }
    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const reviewPostListService = async (req, next) => {
  try {
    const data = await PostModel.find({ onReview: true, isApproved: false });
    if (!data) {
      return { status: "fail", message: "Failed to load review post list" };
    }
    return { status: "success", total: data.length, data: data };
  } catch (error) {
    next(error);
  }
};

export const approvedPostListService = async (req, next) => {
  try {
    const data = await PostModel.find({ isApproved: true, onReview: false });
    if (!data) {
      return { status: "fail", message: "Failed to load approve post list" };
    }
    return { status: "success", total: data.length, data: data };
  } catch (error) {
    next(error);
  }
};

export const declinedPostListService = async (req, next) => {
  try {
    const data = await PostModel.find({ isDeclined: true });
    if (!data) {
      return { status: "fail", message: "Failed to load declined post list" };
    }
    return { status: "success", total: data.length, data: data };
  } catch (error) {
    next(error);
  }
};

export const reportedPostListService = async (req, next) => {
  try {
    const data = await PostModel.find({ reportCount: { $gte: 1 } });
    if (!data) {
      return { status: "fail", message: "Failed to load reported post list" };
    }
    return { status: "success", total: data.length, data: data };
  } catch (error) {
    next(error);
  }
};

export const withdrawReportService = async (req, next) => {
  try {
    const postID = req.query.postId;
    const data = await PostModel.findOneAndUpdate(
      { _id: postID },
      { $set: { reportAdmin: false, reportedBy: "" } },
      {
        new: true,
      }
    );
    if (!data) {
      return { status: "fail", message: "Failed to withdraw report" };
    }
    return { status: "success", total: data.length, data: data };
  } catch (error) {
    next(error);
  }
};

export const approvePostService = async (req, next) => {
  try {
    const postID = req.query.postId;
    const { id, name } = req.headers;

    if (!id || !name) {
      return { status: "fail", message: "Missing user information in headers" };
    }

    const data = await PostModel.findOneAndUpdate(
      { _id: postID },
      {
        $set: {
          isDeclined: false,
          onReview: false,
          declinedBy: "",
          isApproved: true,
          approvedBy: { id: id, name: name },
        },
      },
      { new: true }
    );

    if (!data) {
      return { status: "fail", message: "Failed to approve post" };
    }

    const adminResponse = await AdminModel.findOneAndUpdate(
      { _id: req.headers.id },
      { $addToSet: { approvedPosts: postID } }
    );
    if (!adminResponse) {
      return {
        status: "fail",
        message: "Failed to decline post, check admin model",
      };
    }
    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const declinePostService = async (req, next) => {
  try {
    const postID = req.query.postId;
    const { id, name } = req.headers;

    if (!id || !name) {
      return { status: "fail", message: "Missing user information in headers" };
    }

    const data = await PostModel.findOneAndUpdate(
      { _id: postID },
      {
        $set: {
          isApproved: false,
          onReview: false,
          approvedBy: "",
          isDeclined: true,
          "declinedBy.adminId": id,
          "declinedBy.adminName": name,
        },
      },
      { new: true }
    );

    if (!data) {
      return { status: "fail", message: "Failed to decline post" };
    }

    const adminResponse = await AdminModel.findOneAndUpdate(
      { _id: req.headers.id },
      { $addToSet: { declinedPosts: postID } }
    );
    if (!adminResponse) {
      return {
        status: "fail",
        message: "Failed to decline post, check admin model",
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
    const postID = req.query.postId;
    session.startTransaction();

    const post = await PostModel.deleteOne({ _id: postID }).session(session);

    if (post.deletedCount !== 1) {
      await session.abortTransaction();
      session.endSession();
      return { status: "fail", message: "Failed to delete post by admin" };
    }

    const postDetails = await PostDetailsModel.deleteOne({
      postID: postID,
    }).session(session);

    if (postDetails.deletedCount !== 1) {
      await session.abortTransaction();
      session.endSession();
      return {
        status: "fail",
        message: "Failed to delete post details by admin",
      };
    }

    session.commitTransaction();
    session.endSession();

    return { status: "success", message: "Post deleted by admin successfully" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
    return { status: "fail", message: "Something went wrong" };
  } finally {
    session.endSession();
  }
};

export const sendFeedbackService = async (req, next) => {
  try {
    const postID = req.query.postId;
    const reqBody = req.body;

    inputSanitizer(reqBody);

    const data = await PostModel.findOneAndUpdate(
      { _id: postID },
      {
        $addToSet: {
          feedback: {
            adminId: req.headers.id,
            adminComment: reqBody.feedback,
          },
        },
      },
      { new: true }
    );

    if (!data) {
      return { status: "fail", message: "Failed to send feedback" };
    }

    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const warnedAccountListService = async (req, next) => {
  try {
    const data = await UserModel.find({ accountStatus: "Warning" });
    if (!data) {
      return { status: "fail", message: "Failed to load warning account list" };
    }
    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const restrictedAccountListService = async (req, next) => {
  try {
    const data = await UserModel.find({ accountStatus: "Restricted" });
    if (!data) {
      return {
        status: "fail",
        message: "Failed to load restricted account list",
      };
    }
    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const withdrawRestrictionsService = async (req, next) => {
  try {
    let id = req.query.id;
    const data = await UserModel.findOneAndUpdate(
      { _id: id },
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

export const restrictAccountService = async (req, next) => {
  try {
    let id = req.query.id;
    const data = await UserModel.findOneAndUpdate(
      { _id: id },
      { $set: { accountStatus: "Restricted" } },
      { new: true }
    );
    if (!data) {
      return { status: "fail", message: "Failed to restrict account" };
    }

    const adminResponse = await AdminModel.findOneAndUpdate(
      { _id: req.headers.id },
      { $addToSet: { restrictedAccounts: id } }
    );
    if (!adminResponse) {
      return {
        status: "fail",
        message: "Failed to restrict account, check admin model",
      };
    }

    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const warningAccountService = async (req, next) => {
  try {
    let id = req.query.id;
    const data = await UserModel.findOneAndUpdate(
      { _id: id },
      { $set: { accountStatus: "Warning" }, $inc: { warningCount: 1 } },
      { new: true }
    );
    if (!data) {
      return { status: "fail", message: "Failed to warning account" };
    }

    const adminResponse = await AdminModel.findOneAndUpdate(
      { _id: req.headers.id },
      { $addToSet: { warnedAccounts: id } }
    );
    if (!adminResponse) {
      return {
        status: "fail",
        message: "Failed to warning account, check admin model",
      };
    }

    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const reviewNidListService = async (req, next) => {
  try {
    const data = await UserModel.find({
      nidSubmitted: true,
      nidFront: { $exists: true, $ne: null },
      nidBack: { $exists: true, $ne: null },
    }).select("_id name email nidFront nidBack");

    if (!data) {
      return {
        status: "fail",
        message: "Failed to load review nid list",
      };
    }

    return {
      status: "success",
      data: data,
    };
  } catch (error) {
    next(error);
  }
};

export const approveNidService = async (req, next) => {
  try {
    let userID = req.query.userId;
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
      }
    );

    if (!data) {
      return {
        status: "fail",
        message: "User or user's NID not found",
      };
    }

    return {
      status: "success",
      message: "NID request Approved",
      data: data,
    };
  } catch (error) {
    next(error);
  }
};

export const declineNidService = async (req, next) => {
  try {
    let userID = req.query.userId;
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
      message: "NID request Declined",
      data: data,
    };
  } catch (error) {
    next(error);
  }
};
