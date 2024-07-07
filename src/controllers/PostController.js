import {
  createPostService,
  deletePostImages,
  deletePostService,
  postListService,
  updatePostService,
} from "./../services/PostServices.js";
export const CreatePost = async (req, res, next) => {
  let result = await createPostService(req, next);
  return res.status(200).json(result);
};

export const UpdatePost = async (req, res, next) => {
  let result = await updatePostService(req, next);
  return res.status(200).json(result);
};

export const DeletePost = async (req, res, next) => {
  let result = await deletePostService(req, next);
  return res.status(200).json(result);
};

export const DeletePostImage = async (req, res, next) => {
  let result = await deletePostImages(req, next);
  return res.status(200).json(result);
};

export const PostList = async (req, res, next) => {
  let result = await postListService(req, next);
  return res.status(200).json(result);
};
