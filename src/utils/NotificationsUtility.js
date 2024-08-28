import NotificationModel from "../models/NotificationModel.js";
import PostModel from "../models/PostModel.js";
import ReviewModel from "../models/ReviewModel.js";
import UserModel from "../models/UserModel.js";
import AdminModel from "../models/AdminModel.js";

/**
 * Helper function to fetch the relevant references (Post, User, Review) based on IDs
 */
const fetchNotificationReferences = async (postId, userId, reviewId) => {
  const post = postId
    ? await PostModel.findById(postId).select(
        "_id userID title price feedback createdAt updatedAt"
      )
    : null;
  const user = userId
    ? await UserModel.findById(userId).select(
        "_id email name createdAt updatedAt"
      )
    : null;
  const review = reviewId
    ? await ReviewModel.findById(reviewId).select(
        "_id rating review createdAt updatedAt"
      )
    : null;

  return { post, user, review };
};

/**
 * Create a notification data object dynamically based on the provided references and notification type
 */
const createNotificationData = ({
  event,
  title,
  description,
  senderId,
  receiverId,
  reference,
}) => ({
  event,
  title,
  description,
  senderId,
  receiverId,
  reference,
});

/**
 * Send notification to a specific user
 */
export const sendNotificationToUser = async ({
  action,
  postId,
  userId,
  senderId,
}) => {
  try {
    const { post, user } = await fetchNotificationReferences(postId, userId);

    if (!post && !user) {
      throw new Error("Either a valid post or user must be provided.");
    }

    const reference = { ...(post && { post }), ...(user && { user }) };

    // Ensure the action is an object with necessary properties
    if (!action || typeof action !== "object" || !action.event) {
      throw new Error("Invalid notification action provided.");
    }

    const title = post
      ? `${action.title} | Post: ${post.title} (${post.updatedAt})`
      : `${action.title} | User: ${user.name}`;

    const receiverId = post ? post.userID : user._id;

    const notificationData = createNotificationData({
      event: action.event,
      title,
      description: action.description,
      senderId,
      receiverId,
      reference,
    });

    return await NotificationModel.create(notificationData);
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw new Error("Notification sending failed");
  }
};

/**
 * Send notifications to all admins
 */
export const sendNotificationToAdmin = async ({
  action,
  title,
  description,
  postId,
  userId,
  reviewId,
  senderId,
}) => {
  try {
    const { post, user, review } = await fetchNotificationReferences(
      postId,
      userId,
      reviewId
    );

    if (!post && !user && !review) {
      throw new Error("A valid post, user, or review must be provided.");
    }

    const reference = {
      ...(post && { post }),
      ...(user && { user }),
      ...(review && { review }),
    };

    const admins = await AdminModel.find().select("_id name role");

    const notificationsData = admins.map((admin) => {
      let modifiedTitle;

      if (post) {
        modifiedTitle = `${title} | Post: ${post.title} (${post.updatedAt})`;
      } else if (user) {
        modifiedTitle = `${title} | User: ${user.name}`;
      } else if (review) {
        modifiedTitle = `${title} | Review: ${review.review}`;
      }

      return createNotificationData({
        event: action.event,
        title: modifiedTitle,
        description: description,
        senderId,
        receiverId: admin._id,
        reference,
      });
    });

    await NotificationModel.insertMany(notificationsData);

    return { message: "Notifications sent to admin successfully" };
  } catch (error) {
    console.error("Failed to send notifications to admin:", error);
    throw new Error("Notification sending failed");
  }
};
