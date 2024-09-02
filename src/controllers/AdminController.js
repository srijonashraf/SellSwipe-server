import {
  countPostsToReviewService,
  countReportsToReviewService,
  countTicketsByStatusService,
  createAdminService,
  deleteAdminService,
  getAdminListService,
  getAdminProfileService,
  searchAdminService,
  sendPromotionalEmailService,
  updateAdminService,
  updatePasswordService,
} from "./../services/AdminServices.js";

export const getAdminProfile = async (req, res, next) => {
  const result = await getAdminProfileService(req, next);
  res.status(200).json(result);
};

export const createAdmin = async (req, res, next) => {
  const result = await createAdminService(req, next);
  res.status(200).json(result);
};

export const updateAdmin = async (req, res, next) => {
  const result = await updateAdminService(req, next);
  res.status(200).json(result);
};

export const updatePassword = async (req, res, next) => {
  const result = await updatePasswordService(req, next);
  res.status(200).json(result);
};

export const deleteAdmin = async (req, res, next) => {
  const result = await deleteAdminService(req, next);
  res.status(200).json(result);
};

export const getAdminList = async (req, res, next) => {
  const result = await getAdminListService(req, next);
  res.status(200).json(result);
};

export const searchAdmin = async (req, res, next) => {
  const result = await searchAdminService(req, next);
  res.status(200).json(result);
};

export const sendPromotionalEmail = async (req, res, next) => {
  const result = await sendPromotionalEmailService(req, next);
  res.status(200).json(result);
};

export const countPostsToReview = async (req, res, next) => {
  const result = await countPostsToReviewService(req, next);
  res.status(200).json(result);
};

export const countReportsToReview = async (req, res, next) => {
  const result = await countReportsToReviewService(req, next);
  res.status(200).json(result);
};

export const countTicketsByStatus = async (req, res, next) => {
  const result = await countTicketsByStatusService(req, next);
  res.status(200).json(result);
};
