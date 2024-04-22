import { CreatePostService } from "./../services/PostServices.js";
export const CreatePost = async (req, res) => {
  let result = await CreatePostService(req);
  return res.status(200).json(result);
};
