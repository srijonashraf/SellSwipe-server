import NotificationModel from "../models/NotificationModel.js";

export const getNotificationService = async (req, next) => {
  try {
    let query = {};
    const id = req.params.id;
    if (id) {
      query = { _id: id };
    }
    query = { ...query, receiverId: req.headers.id };
    const result = await NotificationModel.find(query);

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

    const result = await NotificationModel.findOneAndUpdate(
      { _id: notificationID, receiverId: req.headers.id },
      { $set: { readStatus: true } }
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
    const result = await NotificationModel.updateMany(
      { receiverId: req.headers.id },
      { $set: { readStatus: true } }
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
