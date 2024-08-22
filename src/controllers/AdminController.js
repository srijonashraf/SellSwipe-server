import {
  approveNidService,
  approvePostService,
  createAdminService,
  declineNidService,
  declinePostService,
  deleteAdminService,
  deletePostService,
  getAdminListService,
  getApprovedPostListService,
  getDeclinedPostListService,
  getProfileService,
  getReportedPostListService,
  getRestrictedAccountListService,
  getReviewNidListService,
  getReviewPostIdsService,
  getReviewPostListService,
  getUserListService,
  getWarnedAccountListService,
  loginService,
  restrictAccountService,
  searchAdminService,
  searchUserService,
  sendFeedbackService,
  sendPromotionalEmailService,
  updateAdminService,
  warningAccountService,
  withdrawReportService,
  withdrawRestrictionsService,
} from "./../services/AdminServices.js";
export const login = async (req, res, next) => {
  const result = await loginService(req, next);
  let cookieOption = {
    maxAge: Math.floor(Date.now() / 1000) + 6 * 24 * 60 * 60,
    httpOnly: true,
  };
  res.cookie("accessToken", result.accessToken, cookieOption);
  res.cookie("refreshToken", result.refreshToken, cookieOption);
  res.status(200).json(result);
};

export const getProfile = async (req, res, next) => {
  const result = await getProfileService(req, next);
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

export const deleteAdmin = async (req, res, next) => {
  const result = await deleteAdminService(req, next);
  res.status(200).json(result);
};

export const getAdminList = async (req, res, next) => {
  const result = await getAdminListService(req, next);
  res.status(200).json(result);
};

export const getUserList = async (req, res, next) => {
  const result = await getUserListService(req, next);
  res.status(200).json(result);
};

export const getReviewPostList = async (req, res, next) => {
  const result = await getReviewPostListService(req, next);
  res.status(200).json(result);
};

export const getReviewPostIds = async (req, res, next) => {
  const result = await getReviewPostIdsService(req, next);
  res.status(200).json(result);
};

export const getApprovedPostList = async (req, res, next) => {
  const result = await getApprovedPostListService(req, next);
  res.status(200).json(result);
};

export const getDeclinedPostList = async (req, res, next) => {
  const result = await getDeclinedPostListService(req, next);
  res.status(200).json(result);
};

export const getReportedPostList = async (req, res, next) => {
  const result = await getReportedPostListService(req, next);
  res.status(200).json(result);
};

export const withdrawReport = async (req, res, next) => {
  const result = await withdrawReportService(req, next);
  res.status(200).json(result);
};

export const approvePost = async (req, res, next) => {
  const result = await approvePostService(req, next);
  res.status(200).json(result);
};

export const declinePost = async (req, res, next) => {
  const result = await declinePostService(req, next);
  res.status(200).json(result);
};

export const deletePost = async (req, res, next) => {
  const result = await deletePostService(req, next);
  res.status(200).json(result);
};

export const sendFeedback = async (req, res, next) => {
  const result = await sendFeedbackService(req, next);
  res.status(200).json(result);
};

export const getWarnedAccountList = async (req, res, next) => {
  const result = await getWarnedAccountListService(req, next);
  res.status(200).json(result);
};

export const getRestrictedAccountList = async (req, res, next) => {
  const result = await getRestrictedAccountListService(req, next);
  res.status(200).json(result);
};

export const withdrawRestrictions = async (req, res, next) => {
  const result = await withdrawRestrictionsService(req, next);
  res.status(200).json(result);
};

export const warningAccount = async (req, res, next) => {
  const result = await warningAccountService(req, next);
  res.status(200).json(result);
};

export const restrictAccount = async (req, res, next) => {
  const result = await restrictAccountService(req, next);
  res.status(200).json(result);
};

export const getReviewNidList = async (req, res, next) => {
  const result = await getReviewNidListService(req, next);
  res.status(200).json(result);
};

export const approveNid = async (req, res, next) => {
  const result = await approveNidService(req, next);
  res.status(200).json(result);
};

export const declineNid = async (req, res, next) => {
  const result = await declineNidService(req, next);
  res.status(200).json(result);
};

export const searchUser = async (req, res, next) => {
  const result = await searchUserService(req, next);
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
