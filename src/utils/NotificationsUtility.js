import NotificationModel from "../models/NotificationModel.js";
import PostModel from "../models/PostModel.js";
import UserModel from "../models/UserModel.js";

export const notifications = {
  DELETE_POST: {
    type: "deletePost",
    title:
      "Your post goes against our community standards, so we have removed the post.",
    description:
      "Our system detected that you are sharing content which does not comply with our community standards. Therefore, we are taking down your content. Please follow the guidelines for further use of your account.",
  },
  FEEDBACK_POST: {
    type: "feedbackPost",
    title: "You have new feedback on your post.",
    description: "Notification sent when feedback is received on a post.",
  },
  MARKED_FAVOURITE: {
    type: "markedAsFavourite",
    title: "Your post has been marked as a favourite.",
    description:
      "Notification sent when a post is marked as a favourite by another user.",
  },
  WARNING_ACCOUNT: {
    type: "warningAccount",
    title: "Your account has received a warning.",
    description: "Notification sent to warn a user about their account.",
  },
};

export const sendNotification = async ({
  notificationType,
  postId,
  userId,
  sender: { id, role },
}) => {
  try {
    let notificationData;

    if (postId) {
      const post = await PostModel.findById(postId);
      if (!post) {
        throw new Error("Post not found");
      }

      notificationData = {
        type: notificationType.type,
        title: `${notificationType.title} Post: ${post.title} (${post.updatedAt})`,
        description:
          notificationType === notifications.FEEDBACK_POST
            ? `Feedback received: ${
                post.feedback[post.feedback.length - 1].comment
              }`
            : notificationType.description,
        sender: {
          userId: id,
          role: role,
        },
        postId: postId,
        receiverId: post.userID,
      };
    } else if (userId) {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      notificationData = {
        type: notificationType.type,
        title: `${notificationType.title} User: ${user.name}`,
        description: notificationType.description,
        sender: {
          userId: id,
          role: role,
        },
        receiverId: user._id,
      };
    } else {
      throw new Error("Either postId or userId must be provided");
    }

    return await NotificationModel.create(notificationData);
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw new Error("Notification sending failed");
  }
};
