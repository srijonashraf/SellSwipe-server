import express from "express";
import * as PostController from "../controllers/PostController.js";
import * as UserController from "../controllers/UserController.js";
import { upload } from "../middlewares/MulterMiddleware.js";
import AuthVerifyMiddlware from "../middlewares/AuthVerifyMiddleware.js";
import { validateRequest } from "../middlewares/RequestValidateMiddleware.js";
import { postSchemaCreate, postSchemaUpdate } from "../request/post.schema.js";
import { userSchemaUpdate } from "../request/user.schema.js";
import { PrePostValidation } from "../middlewares/PrePostValidationMiddleware.js";
import { idSchema } from "../request/id.schema.js";

const protectedRouter = express.Router();

//For uploading anything we have to use Multer at first as the middleware because it handles form-data and uploads.

protectedRouter.post(
  "/updateAvatar",
  upload.single("avatar"),
  AuthVerifyMiddlware,
  UserController.userAvatarUpdate
);

protectedRouter.post(
  "/updateProfile",
  validateRequest({ schema: userSchemaUpdate, isParam: false, isQuery: false }),
  AuthVerifyMiddlware,
  UserController.userProfileUpdate
);

protectedRouter.post(
  "/updateNidRequest",
  upload.fields([
    { name: "nidFront", maxCount: 1 },
    { name: "nidBack", maxCount: 1 },
  ]),
  AuthVerifyMiddlware,
  UserController.userNidUpdateRequest
);

protectedRouter.get(
  "/profileDetails",
  AuthVerifyMiddlware,
  UserController.userProfileDetails
);

protectedRouter.get(
  "/allSession",
  AuthVerifyMiddlware,
  UserController.userAllSession
);

protectedRouter.get(
  "/logoutFromSession",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  UserController.userLogoutFromSession
);

protectedRouter.get(
  "/postByUser",
  AuthVerifyMiddlware,
  PostController.postByUser
);

protectedRouter.get(
  "/pendingPostByUser",
  AuthVerifyMiddlware,
  PostController.pendingPostByUser
);

protectedRouter.post(
  "/createPost",
  upload.array("images", 5),
  validateRequest({ schema: postSchemaCreate, isQuery: false, isParam: false }),
  AuthVerifyMiddlware,
  PrePostValidation,
  PostController.createPost
);

protectedRouter.post(
  "/updatePost",
  upload.array("images", 5),
  validateRequest({ schema: postSchemaUpdate, isQuery: false, isParam: false }),
  AuthVerifyMiddlware,
  PostController.updatePost
);

protectedRouter.get(
  "/deletePost",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  PostController.deletePost
);

protectedRouter.get(
  "/deletePostImage",
  AuthVerifyMiddlware,
  PostController.deletePostImages
);

protectedRouter.post(
  "/reportPost",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  UserController.reportPost
);

protectedRouter.post(
  "/favouritePost",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  UserController.favouritePost
);

protectedRouter.get(
  "/favouritePostList",
  AuthVerifyMiddlware,
  UserController.favouritePostList
);

protectedRouter.get(
  "/activePost",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  UserController.activePost
);

protectedRouter.get(
  "/inactivePost",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  UserController.inactivePost
);

export default protectedRouter;
