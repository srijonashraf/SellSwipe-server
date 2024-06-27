import PostModel from "../models/PostModel.js";
import NotificationModel from "./../models/NotificationModel.js";
import { messageConfig } from "../constants/NotificationMessages.js";

export const SendNotification = async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.query.postId).select("userID");
    if (!post) {
      throw new Error("Post not found");
    }
    const userId = post.userID;

    const message = messageConfig[req.path];
    if (!message) {
      throw new Error("No message defined for the request path");
    }

    // Create the notification
    const notification = await NotificationModel.create({
      type: req.path,
      message: message,
      senderId: req.headers.id,
      senderRole: req.headers.role,
      receiverId: userId,
      timestamp: Date.now(),
    });

    next();
  } catch (error) {
    console.error(error);
    return null;
  }
};
