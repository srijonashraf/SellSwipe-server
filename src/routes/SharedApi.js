import express from "express";
import * as NotificationCrontroller from "../controllers/NotificationController.js";
import * as AuthController from "../controllers/AuthController.js";
import AuthVerifyMiddlware from "../middlewares/AuthVerifyMiddleware.js";
import { validateRequest } from "../middlewares/RequestValidateMiddleware.js";
import { idSchema } from "../requests/IdSchema.js";

const sharedRouter = express.Router();

//______Notification Actions______//
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

sharedRouter.get(
  "/notifications/:id?",
  AuthVerifyMiddlware,
  NotificationCrontroller.getNotification
);

//____Sessions___//

sharedRouter.get("/sessions", AuthVerifyMiddlware, AuthController.session);

sharedRouter.delete(
  "/sessions/logout",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  AuthController.logoutSession
);

sharedRouter.post(
  "/sessions/refresh",
  AuthVerifyMiddlware,
  AuthController.refreshTokens
);

export default sharedRouter;
