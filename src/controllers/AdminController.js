import {
  addNewAdminService,
  adminListService,
  adminLoginService,
  adminProfileDetailsService,
  approvePostService,
  approvedPostListService,
  declinePostService,
  declinedPostListService,
  deleteAdminService,
  deletePostService,
  reportedPostListService,
  restrictAccountService,
  restrictedAccountListService,
  reviewNidListService,
  reviewPostListService,
  sendFeedbackService,
  userListService,
  warnedAccountListService,
  warningAccountService,
  withdrawReportService,
  withdrawRestrictionsService,
} from "./../services/AdminServices.js";
export const adminLogin = async (req, res, next) => {
  const result = await adminLoginService(req, next);

  let cookieOption = {
    maxAge: Math.floor(Date.now() / 1000) + 6 * 24 * 60 * 60,
    httpOnly: true,
  };
  res.cookie("accessToken", result.accessToken, cookieOption);
  res.cookie("refreshToken", result.refreshToken, cookieOption);
  res.status(200).json(result);
};

export const adminProfileDetails = async (req, res, next) => {
  const result = await adminProfileDetailsService(req, next);
  res.status(200).json(result);
};

export const addNewAdmin = async (req, res, next) => {
  const result = await addNewAdminService(req, next);
  res.status(200).json(result);
};

export const deleteAdmin = async (req, res, next) => {
  const result = await deleteAdminService(req, next);
  res.status(200).json(result);
};

export const adminList = async (req, res, next) => {
  const result = await adminListService(req, next);
  res.status(200).json(result);
};

export const userList = async (req, res, next) => {
  const result = await userListService(req, next);
  res.status(200).json(result);
};

export const reviewPostList = async (req, res, next) => {
  const result = await reviewPostListService(req, next);
  res.status(200).json(result);
};

export const approvedPostList = async (req, res, next) => {
  const result = await approvedPostListService(req, next);
  res.status(200).json(result);
};

export const declinedPostList = async (req, res, next) => {
  const result = await declinedPostListService(req, next);
  res.status(200).json(result);
};

export const reportedPostList = async (req, res, next) => {
  const result = await reportedPostListService(req, next);
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

export const warnedAccountList = async (req, res, next) => {
  const result = await warnedAccountListService(req, next);
  res.status(200).json(result);
};

export const restrictedAccountList = async (req, res, next) => {
  const result = await restrictedAccountListService(req, next);
  res.status(200).json(result);
};

export const withdrawRestrictions = async (req, res, next) => {
  const result = await withdrawRestrictionsService(req, next);
  res.status(200).json(result);
};

export const restrictAccount = async (req, res, next) => {
  const result = await restrictAccountService(req, next);
  res.status(200).json(result);
};

export const warningAccount = async (req, res, next) => {
  const result = await warningAccountService(req, next);
  res.status(200).json(result);
};

export const reviewNidList = async (req, res, next) => {
  const result = await reviewNidListService(req, next);
  res.status(200).json(result);
};
