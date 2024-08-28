import {
  getNotificationService,
  markAllNotificationService,
  markSingleNotificationService,
} from "../services/NotificationServices.js";

export const getNotification = async (req, res, next) => {
  const result = await getNotificationService(req, next);
  res.status(200).json(result);
};

export const markSingleNotification = async (req, res, next) => {
  const result = await markSingleNotificationService(req, next);
  res.status(200).json(result);
};

export const markAllNotification = async (req, res, next) => {
  const result = await markAllNotificationService(req, next);
  res.status(200).json(result);
};

