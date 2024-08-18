import PostModel from "../models/PostModel.js";
import NotificationModel from "./../models/NotificationModel.js";
import { messageConfig } from "../constants/Notifications.js";

//Todo: Need to modify this function cause all the req.paths are not same and generic. Some of them using params some of them using query
export const SendNotification = async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.postId).select("userID");
    if (!post) {
      throw new Error("Post not found");
    }
    const userId = post.userID;

    // Extract action from path
    // Like "delete" from "/posts/:postId/delete"
    const action = req.path.split("/").pop();

    // Get the message for the action
    const message = messageConfig[action];
    if (!message) {
      throw new Error("No message defined for the action");
    }

    // Create the notification
    const notification = await NotificationModel.create({
      path: req.path,
      type: action,
      message: message,
      senderId: req.headers.id,
      senderRole: req.headers.role,
      receiverId: userId,
      timestamp: Date.now(),
    });

    next();
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "fail", message: "Something went wrong" });
  }
};
