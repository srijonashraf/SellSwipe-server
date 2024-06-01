import {
  createPostService,
  deletePostDetailsImage,
  deletePostService,
  postListService,
  updatePostService,
} from "./../services/PostServices.js";
export const CreatePost = async (req, res) => {
  let result = await createPostService(req);
  return res.status(200).json(result);
};

export const UpdatePost = async (req, res) => {
  let result = await updatePostService(req);
  return res.status(200).json(result);
};

export const DeletePost = async (req, res) => {
  let result = await deletePostService(req);
  return res.status(200).json(result);
};

export const DeletePostImage = async (req, res) => {
  let result = await deletePostDetailsImage(req);
  return res.status(200).json(result);
};

export const PostList = async (req, res) => {
  let result = await postListService(req);
  return res.status(200).json(result);
};
