import NotificationModel from "../models/NotificationModel.js";

export const getAllNotificationService = async (req, next) => {
  try {
    const userID = req.headers.id;

    const result = await NotificationModel.find({ receiverId: userID });

    if (!result) {
      return {
        status: "fail",
        message: "Notification or User not found",
      };
    }

    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    next(error);
  }
};

export const markSingleNotificationService = async (req, next) => {
  try {
    const notificationID = req.params.id;
    const userID = req.headers.id;

    const result = await NotificationModel.findOneAndUpdate(
      { _id: notificationID, receiverId: userID },
      { $set: { isRead: true } }
    );

    if (!result) {
      return {
        status: "fail",
        message: "Notification or User not found",
      };
    }

    return {
      status: "success",
      message: "Notification is seen",
    };
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationService = async (req, next) => {
  try {
    const userID = req.headers.id;

    const result = await NotificationModel.updateMany(
      { receiverId: userID },
      { $set: { isRead: true } }
    );

    if (!result) {
      return {
        status: "fail",
        message: "Notification or User not found",
      };
    }

    return {
      status: "success",
      message: "All notifications are seen",
    };
  } catch (error) {
    next(error);
  }
};
