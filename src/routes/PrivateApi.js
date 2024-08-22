import express from "express";
import * as PostController from "../controllers/PostController.js";
import * as UserController from "../controllers/UserController.js";
import { upload } from "../middlewares/MulterMiddleware.js";
import AuthVerifyMiddlware from "../middlewares/AuthVerifyMiddleware.js";
import { validateRequest } from "../middlewares/RequestValidateMiddleware.js";
import { postSchemaCreate, postSchemaUpdate } from "../requests/PostSchema.js";
import { userSchemaUpdate } from "../requests/UserSchema.js";
import { PrePostValidation } from "../middlewares/PrePostValidationMiddleware.js";
import { idSchema } from "../requests/IdSchema.js";

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
  "/sessions/logout", // Logout from session (DELETE method since it logs out)
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  UserController.logoutSession
);

//______Posts______
privateRouter.get(
  "/posts/user",
  AuthVerifyMiddlware,
  PostController.getPostByUser
);

privateRouter.get(
  "/posts/user/pending",
  AuthVerifyMiddlware,
  PostController.getPendingPostByUser
);

privateRouter.get(
  "/posts/:id",
  AuthVerifyMiddlware,
  PostController.detailsPost
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

privateRouter.delete(
  "/posts/:id",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  PostController.deletePost
);

privateRouter.get(
  "/posts/:id/images",
  AuthVerifyMiddlware,
  PostController.deletePostImages
);

//______Posts Actions______
privateRouter.post(
  "/posts/:id/report",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  UserController.reportPost
);

privateRouter.post(
  "/posts/:id/favorite",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  UserController.favouritePost
);

privateRouter.get(
  "/posts/favorites",
  AuthVerifyMiddlware,
  UserController.favouritePostList
);

privateRouter.get(
  "/posts/active",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  UserController.activePost
);

privateRouter.get(
  "/posts/inactive",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  UserController.inActivePost
);

privateRouter.post(
  "/posts/similar",
  validateRequest({ schema: idSchema, isQuery: false, isParam: false }),
  AuthVerifyMiddlware,
  PostController.getSimilarPosts
);

//______Notification Actions______
privateRouter.post(
  "/notifications/:id/seen",
  AuthVerifyMiddlware,
  UserController.markSingleNotification
);

privateRouter.post(
  "/notifications/seen",
  AuthVerifyMiddlware,
  UserController.markAllNotification
);

privateRouter.get(
  "/notifications",
  AuthVerifyMiddlware,
  UserController.getAllNotification
);

export default privateRouter;
