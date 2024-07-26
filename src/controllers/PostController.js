import {
  createPostService,
  deletePostImagesService,
  deletePostService,
  pendingPostByUserService,
  postByUserService,
  postListByFilterService,
  postListService,
  updatePostService,
} from "./../services/PostServices.js";

export const postByUser = async (req, res, next) => {
  let result = await postByUserService(req, next);
  return res.status(200).json(result);
};
export const pendingPostByUser = async (req, res, next) => {
  let result = await pendingPostByUserService(req, next);
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

export const deletePost = async (req, res, next) => {
  let result = await deletePostService(req, next);
  return res.status(200).json(result);
};

export const deletePostImages = async (req, res, next) => {
  let result = await deletePostImagesService(req, next);
  return res.status(200).json(result);
};

export const postList = async (req, res, next) => {
  let result = await postListService(req, next);
  return res.status(200).json(result);
};

export const postListByFilter = async (req, res, next) => {
  let result = await postListByFilterService(req, next);
  return res.status(200).json(result);
};
