import {
  createReviewService,
  deleteReviewService,
  updateReviewService,
} from "../services/ReviewServices.js";

export const createReview = async (req, res, next) => {
  const result = await createReviewService(req, next);
  return res.status(200).json(result);
};

export const updateReview = async (req, res, next) => {
  const result = await updateReviewService(req, next);
  return res.status(200).json(result);
};

export const deleteReview = async (req, res, next) => {
  const result = await deleteReviewService(req, next);
  return res.status(200).json(result);
};
