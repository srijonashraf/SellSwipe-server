import express from "express";
import * as PostController from "../controllers/PostController.js";
import * as UserController from "../controllers/UserController.js";
import { upload } from "../middlewares/MulterMiddleware.js";
import AuthVerifyMiddlware from "../middlewares/AuthVerifyMiddleware.js";
import { validateRequest } from "../middlewares/RequestValidateMiddleware.js";
import { postSchemaCreate, postSchemaUpdate } from "../request/post.schema.js";
import {
  userCredentialSchema,
  userSchemaCreate,
  userSchemaUpdate,
} from "../request/user.schema.js";
import { preLoginValidation } from "../middlewares/PreLoginValidationMiddleware.js";
import { PrePostValidation } from "../middlewares/PrePostValidationMiddleware.js";
import { idSchema } from "../request/id.schema.js";

const protectedRouter = express.Router();

protectedRouter.post(
  "/updateAvatar",
  validateRequest({ schema: userSchemaUpdate, isParam: false, isQuery: false }),
  AuthVerifyMiddlware,
  upload.single("avatar"),
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
  validateRequest({ schema: userSchemaUpdate, isParam: false, isQuery: false }),
  AuthVerifyMiddlware,
  upload.fields([
    { name: "nidFront", maxCount: 1 },
    { name: "nidBack", maxCount: 1 },
  ]),
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

protectedRouter.post(
  "/createPost",
  validateRequest({ schema: postSchemaCreate, isQuery: false, isParam: false }),
  AuthVerifyMiddlware,
  PrePostValidation,
  upload.array("images", 5),
  PostController.CreatePost
);

protectedRouter.post(
  "/updatePost",
  validateRequest({ schema: postSchemaUpdate, isQuery: false, isParam: false }),
  AuthVerifyMiddlware,
  upload.array("images", 5),
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
