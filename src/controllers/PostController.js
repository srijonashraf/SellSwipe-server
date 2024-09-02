import {
  createPostService,
  deletePostImagesService,
  deletePostByUserService,
  deletePostByAdminService,
  detailsPostService,
  favouritePostListService,
  favouritePostService,
  getAllPostsService,
  getSimilarPostsService,
  ownPostsService,
  postSearchWithFiltersService,
  reportedPostListService,
  reportPostService,
  updatePostService,
  declinePostService,
  getReviewPostListService,
  getApprovedPostListService,
  getDeclinedPostListService,
  getReportedPostListService,
  withdrawReportService,
  approvePostService,
  sendFeedbackService,
  updatePostStatusService,
} from "./../services/PostServices.js";

export const detailsPost = async (req, res, next) => {
  let result = await detailsPostService(req, next);
  return res.status(200).json(result);
};

export const createPost = async (req, res, next) => {
  let result = await createPostService(req, next);
  return res.status(200).json(result);
};

export const updatePost = async (req, res, next) => {
  let result = await updatePostService(req, next);
  return res.status(200).json(result);
};

export const deletePostByUser = async (req, res, next) => {
  let result = await deletePostByUserService(req, next);
  return res.status(200).json(result);
};

export const deletePostImages = async (req, res, next) => {
  let result = await deletePostImagesService(req, next);
  return res.status(200).json(result);
};

export const getAllPosts = async (req, res, next) => {
  let result = await getAllPostsService(req, next);
  return res.status(200).json(result);
};

export const ownPosts = async (req, res, next) => {
  const result = await ownPostsService(req, next);
  res.status(200).json(result);
};

export const reportPost = async (req, res, next) => {
  const result = await reportPostService(req, next);
  res.status(200).json(result);
};

export const reportedPostList = async (req, res, next) => {
  const result = await reportedPostListService(req, next);
  res.status(200).json(result);
};

export const favouritePost = async (req, res, next) => {
  const result = await favouritePostService(req, next);
  res.status(200).json(result);
};

export const favouritePostList = async (req, res, next) => {
  const result = await favouritePostListService(req, next);
  res.status(200).json(result);
};

export const updatePostStatus = async (req, res, next) => {
  const result = await updatePostStatusService(req, next);
  res.status(200).json(result);
};

export const getSimilarPosts = async (req, res, next) => {
  let result = await getSimilarPostsService(req, next);
  return res.status(200).json(result);
};

export const postSearchWithFilters = async (req, res, next) => {
  let result = await postSearchWithFiltersService(req, next);
  return res.status(200).json(result);
};

//__Admin__//
export const getReviewPostList = async (req, res, next) => {
  const result = await getReviewPostListService(req, next);
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

export const deletePostByAdmin = async (req, res, next) => {
  const result = await deletePostByAdminService(req, next);
  res.status(200).json(result);
};

export const sendFeedback = async (req, res, next) => {
  const result = await sendFeedbackService(req, next);
  res.status(200).json(result);
};
