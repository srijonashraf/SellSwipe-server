import express from "express";
import * as NotificationCrontroller from "../controllers/NotificationController.js";
import AuthVerifyMiddlware from "../middlewares/AuthVerifyMiddleware.js";

const sharedRouter = express.Router();

//______Notification Actions______
sharedRouter.post(
  "/notifications/:id/seen",
  AuthVerifyMiddlware,
  NotificationCrontroller.markSingleNotification
);

sharedRouter.post(
  "/notifications/seen",
  AuthVerifyMiddlware,
  NotificationCrontroller.markAllNotification
);

sharedRouter.get(
  "/notifications/:id?",
  AuthVerifyMiddlware,
  NotificationCrontroller.getNotification
);

export default sharedRouter;
