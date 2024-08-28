import {
  NOTIFICATION_ACTIONS,
  REPORT_CATEGORIES,
} from "../constants/Notifications.js";
import ReviewModel from "../models/ReviewModel.js";
import {
  sendNotificationToUser,
  sendNotificationToAdmin,
} from "../utils/NotificationsUtility.js";
import { calculatePagination } from "../utils/PaginationUtility.js";
import { inputSanitizer } from "./../middlewares/RequestValidateMiddleware.js";
export const createReviewService = async (req, next) => {
  try {
    inputSanitizer(req.body);
    const postID = req.params.postId;
    const { rating, review } = req.body;
    const query = {
      postID: postID,
      userID: req.headers.id,
      rating,
      review,
    };
    const result = await ReviewModel.create(query);
    if (!result) {
      return { status: "fail", message: "Failed to create new review" };
    }
    return { status: "success", data: result };
  } catch (error) {
    next(error);
  }
};

export const updateReviewService = async (req, next) => {
  try {
    inputSanitizer(req.body);
    const id = req.params.id;
    const { rating, review } = req.body;
    const query = {
      _id: id,
      userID: req.headers.id,
    };
    const result = await ReviewModel.findOneAndUpdate(
      query,
      { $set: { rating, review } },
      { new: true, runValidators: true }
    );

    if (!result) {
      return { status: "fail", message: "Review not found or update failed" };
    }

    return { status: "success", data: result };
  } catch (error) {
    next(error);
  }
};

export const deleteReviewByUserService = async (req, next) => {
  try {
    const id = req.params.id;
    const query = {
      _id: id,
      userID: req.headers.id,
    };

    const result = await ReviewModel.deleteOne(query);

    if (result.deletedCount === 0) {
      return {
        status: "fail",
        message: "Review not found or not authorized to delete",
      };
    }

    return { status: "success", message: "Review successfully deleted" };
  } catch (error) {
    next(error);
  }
};

export const reportReviewService = async (req, next) => {
  try {
    const reviewId = req.params.id;
    inputSanitizer(req.body);
    const { reportCause } = req.body;

    const reportResponse = await ReviewModel.findOneAndUpdate(
      {
        _id: reviewId,
        "reportedBy.userId": { $nin: [req.headers.id] },
      },
      {
        $addToSet: {
          reportedBy: {
            userId: req.headers.id,
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
        message: "A report is already pending or failed to report the review",
      };
    }

    await sendNotificationToAdmin({
      action: NOTIFICATION_ACTIONS.REPORT_TO_ADMIN,
      title: REPORT_CATEGORIES.HARASSMENT,
      description: reportCause,
      reviewId: reviewId,
      senderId: req.headers.id,
    });

    return {
      status: "success",
      message: "Report has been submitted successfully.",
    };
  } catch (error) {
    next(error);
  }
};

//____Admin____//
export const getReportedReviewService = async (req, next) => {
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

    const totalCount = await ReviewModel.countDocuments(query);

    const data = await ReviewModel.find(query)
      .sort({ [pagination.sortBy]: pagination.sortOrder === "desc" ? -1 : 1 })
      .limit(pagination.limit)
      .skip(pagination.skip)
      .populate();

    if (!data) {
      return { status: "fail", message: "Failed to load reported post list" };
    }

    return {
      status: "success",
      total: totalCount,
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

export const withdrawReportFromReviewService = async (req, next) => {
  try {
    const id = req.params.id; //id is report id
    const data = await ReviewModel.findOneAndUpdate(
      { "reportedBy._id": id },
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

export const deleteReviewByAdminService = async (req, next) => {
  try {
    const { id } = req.params;
    const result = await ReviewModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return {
        status: "fail",
        message: "Review not found or not authorized to delete",
      };
    }

    return { status: "success", message: "Review successfully deleted" };
  } catch (error) {
    next(error);
  }
};
