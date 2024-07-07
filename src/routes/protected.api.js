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
  PostController.PostByUser
);

protectedRouter.post(
  "/createPost",
  upload.array("images", 5),
  validateRequest({ schema: postSchemaCreate, isQuery: false, isParam: false }),
  AuthVerifyMiddlware,
  PrePostValidation,
  PostController.CreatePost
);

protectedRouter.post(
  "/updatePost",
  upload.array("images", 5),
  validateRequest({ schema: postSchemaUpdate, isQuery: false, isParam: false }),
  AuthVerifyMiddlware,
  PostController.UpdatePost
);

protectedRouter.get(
  "/deletePost",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  PostController.DeletePost
);

protectedRouter.get(
  "/deletePostImage",
  AuthVerifyMiddlware,
  PostController.DeletePostImage
);

export default protectedRouter;
