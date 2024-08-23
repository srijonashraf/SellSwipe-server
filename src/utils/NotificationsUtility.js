import AdminModel from "../models/AdminModel.js";
import NotificationModel from "../models/NotificationModel.js";
import PostModel from "../models/PostModel.js";
import UserModel from "../models/UserModel.js";

export const notificationsForUser = {
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

export const notificationsForAdmin = {
  REPORT_TO_ADMIN: {
    type: "reportAccount",
  },
};
/**
 * User and admin can send two type of notifications like for a Post or for a User account.
 * If the notification is against a post then the Post title will be mentioned in notification title's end to identify.
 * If its against a user account then the title will show the User name at the end of the notification title.
 */
export const sendNotificationToUser = async ({
  notificationType,
  postId,
  userId,
  sender: { id, role },
}) => {
  try {
    let notificationData;
    let reference = {};

    const post = postId
      ? await PostModel.findById(postId).select(
          "_id userID title price feedback"
        )
      : null;
    const user = userId
      ? await UserModel.findById(userId).select("_id email name")
      : null;

    if (post) reference.post = post;
    if (user) reference.user = user;

    // Check if at least one reference is found
    if (!post && !user) {
      throw new Error("Either a valid post or user must be provided.");
    }

    //Set title and receiverId dynamically
    const title = post
      ? `${notificationType.title} Post: ${post.title} (${post.updatedAt})`
      : `${notificationType.title} User: ${user.name}`;

    const receiverId = post ? post.userID : user._id;

    //Set notification data
    notificationData = {
      type: notificationType.type,
      title,
      description:
        notificationType === notificationsForUser.FEEDBACK_POST && post
          ? `Feedback: ${post.feedback[post.feedback.length - 1].comment}`
          : notificationType.description,
      sender: {
        userId: id,
        role: role,
      },
      receiverId,
      reference: reference,
    };
    return await NotificationModel.create(notificationData);
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw new Error("Notification sending failed");
  }
};

export const sendNotificationToAdmin = async ({
  notificationType,
  notificationTitle,
  notificationDescription,
  postId,
  userId,
  sender: { id, role },
}) => {
  try {
    let notificationsData = [];
    let reference = {};

    const fetchAllAdmins = await AdminModel.find().select("_id name role");

    const post = postId
      ? await PostModel.findById(postId).select(
          "_id userID title price feedback"
        )
      : null;
    const user = userId
      ? await UserModel.findById(userId).select("_id email name")
      : null;

    // Add to reference if post or user is found
    if (post) reference.post = post;
    if (user) reference.user = user;

    // Check if at least one reference is found
    if (!post && !user) {
      throw new Error("Either a valid post or user must be provided.");
    }

    // Iterate through each admin and prepare notifications
    fetchAllAdmins.forEach((admin) => {
      const title = post
        ? `${notificationTitle} Post: ${post.title} (${post.updatedAt})`
        : `${notificationTitle} User: ${user.name}`;

      const receiverId = admin._id;

      const notificationData = {
        type: notificationType.type,
        title,
        description: notificationDescription,
        sender: {
          userId: id,
          role: role,
        },
        receiverId,
        reference: reference,
      };

      notificationsData.push(notificationData);
    });

    // Send notification to all admins
    await Promise.all(
      notificationsData.map((notification) =>
        NotificationModel.create(notification)
      )
    );

    return { message: "Notifications sent to admin successfully" };
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw new Error("Notification sending failed");
  }
};
