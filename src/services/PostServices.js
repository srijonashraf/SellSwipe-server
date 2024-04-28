import PostModel from "../models/PostModel.js";

export const CreatePostService = async (req) => {
  try {
    let reqBody = req.body;
    reqBody.userID = req.headers.id;
    const data = await PostModel.create(reqBody);
    return { status: "success", data: data };
  } catch (error) {
    return { status: "fail", data: error };
  }
};

export const PostListService = async (req) => {
  try {
    const data = await PostModel.find({ isApproved: true, isActive: true });
    return { status: "success", data: data };
  } catch (error) {
    return { status: "fail", data: error };
  }
};
