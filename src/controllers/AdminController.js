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
  reviewPostListService,
  sendFeedbackService,
  userListService,
  warnedAccountListService,
  warningAccountService,
  withdrawReportService,
  withdrawRestrictionsService,
} from "./../services/AdminServices.js";
export const adminLogin = async (req, res) => {
  const result = await adminLoginService(req);

  let cookieOption = {
    maxAge: Math.floor(Date.now() / 1000) + 6 * 24 * 60 * 60,
    httpOnly: true,
  };
  res.cookie("accessToken", result.accessToken, cookieOption);
  res.cookie("refreshToken", result.refreshToken, cookieOption);
  res.status(200).json(result);
};

export const adminProfileDetails = async (req, res) => {
  const result = await adminProfileDetailsService(req);
  res.status(200).json(result);
};


export const addNewAdmin = async (req, res) => {
  const result = await addNewAdminService(req);
  res.status(200).json(result);
};

export const deleteAdmin = async (req, res) => {
  const result = await deleteAdminService(req);
  res.status(200).json(result);
};

export const adminList = async (req, res) => {
  const result = await adminListService(req);
  res.status(200).json(result);
};

export const userList = async (req, res) => {
  const result = await userListService(req);
  res.status(200).json(result);
};

export const reviewPostList = async (req, res) => {
  const result = await reviewPostListService(req);
  res.status(200).json(result);
};

export const approvedPostList = async (req, res) => {
  const result = await approvedPostListService(req);
  res.status(200).json(result);
};

export const declinedPostList = async (req, res) => {
  const result = await declinedPostListService(req);
  res.status(200).json(result);
};

export const reportedPostList = async (req, res) => {
  const result = await reportedPostListService(req);
  res.status(200).json(result);
};

export const withdrawReport = async (req, res) => {
  const result = await withdrawReportService(req);
  res.status(200).json(result);
};

export const approvePost = async (req, res) => {
  const result = await approvePostService(req);
  res.status(200).json(result);
};

export const declinePost = async (req, res) => {
  const result = await declinePostService(req);
  res.status(200).json(result);
};

export const deletePost = async (req, res) => {
  const result = await deletePostService(req);
  res.status(200).json(result);
};

export const sendFeedback = async (req, res) => {
  const result = await sendFeedbackService(req);
  res.status(200).json(result);
};

export const warnedAccountList = async (req, res) => {
  const result = await warnedAccountListService(req);
  res.status(200).json(result);
};

export const restrictedAccountList = async (req, res) => {
  const result = await restrictedAccountListService(req);
  res.status(200).json(result);
};

export const withdrawRestrictions = async (req, res) => {
  const result = await withdrawRestrictionsService(req);
  res.status(200).json(result);
};

export const restrictAccount = async (req, res) => {
  const result = await restrictAccountService(req);
  res.status(200).json(result);
};

export const warningAccount = async (req, res) => {
  const result = await warningAccountService(req);
  res.status(200).json(result);
};
