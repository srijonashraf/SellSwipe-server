import {
  createPostService,
  deletePostImagesService,
  deletePostService,
  detailsPostService,
  getAllPostsService,
  getPendingPostByUserService,
  getPostByUserService,
  postListByFilterService,
  postSearchWithFiltersService,
  updatePostService,
} from "./../services/PostServices.js";

export const getPostByUser = async (req, res, next) => {
  let result = await getPostByUserService(req, next);
  return res.status(200).json(result);
};
export const getPendingPostByUser = async (req, res, next) => {
  let result = await getPendingPostByUserService(req, next);
  return res.status(200).json(result);
};

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


export const deletePost = async (req, res, next) => {
  let result = await deletePostService(req, next);
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

export const postListByFilter = async (req, res, next) => {
  let result = await postListByFilterService(req, next);
  return res.status(200).json(result);
};

export const postSearchWithFilters = async (req, res, next) => {
  let result = await postSearchWithFiltersService(req, next);
  return res.status(200).json(result);
};
