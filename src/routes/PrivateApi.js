import express from "express";
import * as PostController from "../controllers/PostController.js";
import * as ReviewController from "../controllers/ReviewController.js";
import * as UserController from "../controllers/UserController.js";
import * as TicketController from "../controllers/TicketController.js";
import * as NotificationCrontroller from "../controllers/NotificationController.js";
import { upload } from "../middlewares/MulterMiddleware.js";
import AuthVerifyMiddlware from "../middlewares/AuthVerifyMiddleware.js";
import { validateRequest } from "../middlewares/RequestValidateMiddleware.js";
import { postSchemaCreate, postSchemaUpdate } from "../requests/PostSchema.js";
import { userSchemaUpdate } from "../requests/UserSchema.js";
import { PrePostValidation } from "../middlewares/PrePostValidationMiddleware.js";
import { idSchema } from "../requests/IdSchema.js";
import {
  ticketSchemaCreate,
  ticketSchemaUpdate,
} from "../requests/TicketSchema.js";

const privateRouter = express.Router();

//For uploading anything we have to use Multer at first as the middleware because it handles form-data and uploads.

//_________Profile & User___________
privateRouter.get(
  "/users/profile",
  AuthVerifyMiddlware,
  UserController.profile
);

privateRouter.put(
  "/users/profile",
  validateRequest({ schema: userSchemaUpdate, isParam: false, isQuery: false }),
  AuthVerifyMiddlware,
  UserController.updateProfile
);

privateRouter.put(
  "/users/password/update",
  AuthVerifyMiddlware,
  UserController.updatePassword
);

privateRouter.post(
  "/users/avatar",
  upload.single("avatar"),
  AuthVerifyMiddlware,
  UserController.updateAvatar
);

privateRouter.post(
  "/users/nid",
  upload.fields([
    { name: "nidFront", maxCount: 1 },
    { name: "nidBack", maxCount: 1 },
  ]),
  AuthVerifyMiddlware,
  UserController.updateNid
);

//______Sessions______
privateRouter.get(
  "/sessions", // Fetch all sessions
  AuthVerifyMiddlware,
  UserController.allSession
);

privateRouter.get(
  "/sessions/logout",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  UserController.logoutSession
);

//______Posts Actions______
privateRouter.post(
  "/posts/:id/report",
  validateRequest({ schema: idSchema, isQuery: false, isParam: true }),
  AuthVerifyMiddlware,
  PostController.reportPost
);

privateRouter.get(
  "/posts/reported",
  AuthVerifyMiddlware,
  PostController.reportedPostList
);

privateRouter.post(
  "/posts/:id/favorite",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  PostController.favouritePost
);

privateRouter.get(
  "/posts/favorites",
  AuthVerifyMiddlware,
  PostController.favouritePostList
);

privateRouter.get(
  "/posts/active",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  PostController.activePost
);

privateRouter.get(
  "/posts/inactive",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  PostController.inActivePost
);

privateRouter.post(
  "/posts/similar",
  validateRequest({ schema: idSchema, isQuery: false, isParam: false }),
  AuthVerifyMiddlware,
  PostController.getSimilarPosts
);

privateRouter.get("/posts/user", AuthVerifyMiddlware, PostController.ownPosts);

privateRouter.get(
  "/posts/user/pending",
  AuthVerifyMiddlware,
  PostController.ownPendingPost
);

privateRouter.post(
  "/posts",
  upload.array("images", 5),
  validateRequest({ schema: postSchemaCreate, isQuery: false, isParam: false }),
  AuthVerifyMiddlware,
  PrePostValidation,
  PostController.createPost
);

privateRouter.put(
  "/posts/:id",
  upload.array("images", 5),
  validateRequest({ schema: postSchemaUpdate, isQuery: false, isParam: false }),
  AuthVerifyMiddlware,
  PostController.updatePost
);

privateRouter.get(
  "/posts/:id",
  AuthVerifyMiddlware,
  PostController.detailsPost
);

privateRouter.delete(
  "/posts/:id",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  PostController.deletePostByUser
);

privateRouter.get(
  "/posts/:id/images",
  AuthVerifyMiddlware,
  PostController.deletePostImages
);

//______Review______
privateRouter.post(
  "/reviews/:postId",
  AuthVerifyMiddlware,
  ReviewController.createReview
);

privateRouter.put(
  "/reviews/:id",
  AuthVerifyMiddlware,
  ReviewController.updateReview
);

privateRouter.delete(
  "/reviews/:id",
  AuthVerifyMiddlware,
  ReviewController.deleteReview
);

//______Notification Actions______
privateRouter.post(
  "/notifications/:id/seen",
  AuthVerifyMiddlware,
  NotificationCrontroller.markSingleNotification
);

privateRouter.post(
  "/notifications/seen",
  AuthVerifyMiddlware,
  NotificationCrontroller.markAllNotification
);

privateRouter.get(
  "/notifications",
  AuthVerifyMiddlware,
  NotificationCrontroller.getAllNotification
);

//______Ticket Actions______
privateRouter.post(
  "/tickets",
  AuthVerifyMiddlware,
  validateRequest({
    schema: ticketSchemaCreate,
    isParam: false,
    isQuery: false,
  }),
  TicketController.createTicketByUser
);
privateRouter.get(
  "/tickets/:id?",
  AuthVerifyMiddlware,
  TicketController.getTicket
);

privateRouter.post(
  "/tickets/:id/comment",
  validateRequest({
    schema: ticketSchemaUpdate,
    isParam: true,
    isQuery: false,
  }),
  AuthVerifyMiddlware,
  TicketController.commentByUser
);

export default privateRouter;
