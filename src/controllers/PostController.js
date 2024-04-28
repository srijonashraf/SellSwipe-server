import {
  CreatePostService,
  PostListService,
} from "./../services/PostServices.js";
export const CreatePost = async (req, res) => {
  let result = await CreatePostService(req);
  return res.status(200).json(result);
};

export const PostList = async (req, res) => {
  let result = await PostListService(req);
  return res.status(200).json(result);
};
