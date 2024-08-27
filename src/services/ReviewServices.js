import ReviewModel from "../models/ReviewModel.js";
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

export const deleteReviewService = async (req, next) => {
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
