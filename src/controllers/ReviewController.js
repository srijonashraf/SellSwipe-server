import {
  createReviewService,
  deleteReviewByAdminService,
  deleteReviewByUserService,
  getReportedReviewService,
  reportReviewService,
  updateReviewService,
  withdrawReportFromReviewService,
} from "../services/ReviewServices.js";

export const createReview = async (req, res, next) => {
  const result = await createReviewService(req, next);
  return res.status(200).json(result);
};

export const updateReview = async (req, res, next) => {
  const result = await updateReviewService(req, next);
  return res.status(200).json(result);
};

export const deleteReviewByUser = async (req, res, next) => {
  const result = await deleteReviewByUserService(req, next);
  return res.status(200).json(result);
};

export const reportReview = async (req, res, next) => {
  const result = await reportReviewService(req, next);
  return res.status(200).json(result);
};

export const getReportedReview = async (req, res, next) => {
  const result = await getReportedReviewService(req, next);
  return res.status(200).json(result);
};

export const withdrawReportFromReview = async (req, res, next) => {
  const result = await withdrawReportFromReviewService(req, next);
  return res.status(200).json(result);
};

export const deleteReviewByAdmin = async (req, res, next) => {
  const result = await deleteReviewByAdminService(req, next);
  return res.status(200).json(result);
};
