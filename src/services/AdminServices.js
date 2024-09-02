import AdminModel from "./../models/AdminModel.js";
import { promotionalEmailTemplate } from "./../templates/emailTemplates.js";
import EmailSend from "../utils/EmailUtility.js";
import PromotionsModel from "../models/PromotionsModel.js";
import { calculatePagination } from "../utils/PaginationUtility.js";
import PostModel from "../models/PostModel.js";
import TicketModel from "../models/TicketModel.js";
import Joi from "joi";

export const getAdminProfileService = async (req, next) => {
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

    const admin = await AdminModel.findById(req.headers.id).select("password");

    const isCorrectPassword = await admin.isPasswordCorrect(currentPassword);
    if (!isCorrectPassword) {
      return { status: "fail", message: "Current passowrd does not matched" };
    }

    admin.password = newPassword;

    await admin.save();

    return {
      status: "success",
      message: "Password updated",
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

    await PromotionsModel.create(req.body);

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

export const countPostsToReviewService = async (req, next) => {
  try {
    const totalPostToReviewCount = await PostModel.countDocuments({
      onReview: true,
      isDeclined: false,
      isApproved: false,
      isActive: true,
      isDeleted: false,
    }).exec();
    return {
      status: "success",
      reviewPostCount: totalPostToReviewCount,
    };
  } catch (error) {
    next(error);
  }
};

export const countReportsToReviewService = async (req, next) => {
  try {
    const totalReportToReviewCount = await PostModel.countDocuments({
      onReview: false,
      isDeclined: false,
      isApproved: true,
      isActive: true,
      isDeleted: false,
      reportCount: { $gte: 1 },
    }).exec();
    return {
      status: "success",
      reviewReportCount: totalReportToReviewCount,
    };
  } catch (error) {
    next(error);
  }
};

export const countTicketsByStatusService = async (req, next) => {
  try {
    const { status } = req.query;
    const count = await TicketModel.countDocuments({
      status: status.toString(),
    }).exec();

    return {
      status: "success",
      ticketStatus: status,
      totalCount: count,
    };
  } catch (error) {
    next(error);
  }
};
