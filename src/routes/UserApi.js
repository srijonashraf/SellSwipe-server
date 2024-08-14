import express from "express";
import * as PostController from "../controllers/PostController.js";
import * as UserController from "../controllers/UserController.js";
import { upload } from "../middlewares/MulterMiddleware.js";
import AuthVerifyMiddlware from "../middlewares/AuthVerifyMiddleware.js";
import { validateRequest } from "../middlewares/RequestValidateMiddleware.js";
import { postSchemaCreate, postSchemaUpdate } from "../request/PostSchema.js";
import { userSchemaUpdate } from "../request/UserSchema.js";
import { PrePostValidation } from "../middlewares/PrePostValidationMiddleware.js";
import { idSchema } from "../request/IdSchema.js";

const userRouter = express.Router();

//For uploading anything we have to use Multer at first as the middleware because it handles form-data and uploads.

userRouter.post(
  "/updateAvatar",
  upload.single("avatar"),
  AuthVerifyMiddlware,
  UserController.userAvatarUpdate
);

userRouter.post(
  "/updateProfile",
  validateRequest({ schema: userSchemaUpdate, isParam: false, isQuery: false }),
  AuthVerifyMiddlware,
  UserController.userProfileUpdate
);

userRouter.post(
  "/updateNidRequest",
  upload.fields([
    { name: "nidFront", maxCount: 1 },
    { name: "nidBack", maxCount: 1 },
  ]),
  AuthVerifyMiddlware,
  UserController.userNidUpdateRequest
);

userRouter.get(
  "/profileDetails",
  AuthVerifyMiddlware,
  UserController.userProfileDetails
);

userRouter.get(
  "/allSession",
  AuthVerifyMiddlware,
  UserController.userAllSession
);

userRouter.get(
  "/logoutFromSession",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  UserController.userLogoutFromSession
);

userRouter.get("/postByUser", AuthVerifyMiddlware, PostController.postByUser);

userRouter.get(
  "/pendingPostByUser",
  AuthVerifyMiddlware,
  PostController.pendingPostByUser
);

userRouter.post(
  "/createPost",
  upload.array("images", 5),
  validateRequest({ schema: postSchemaCreate, isQuery: false, isParam: false }),
  AuthVerifyMiddlware,
  PrePostValidation,
  PostController.createPost
);

userRouter.post(
  "/updatePost",
  upload.array("images", 5),
  validateRequest({ schema: postSchemaUpdate, isQuery: false, isParam: false }),
  AuthVerifyMiddlware,
  PostController.updatePost
);

userRouter.get(
  "/viewPost",
  AuthVerifyMiddlware,
  PostController.viewPost
);

userRouter.get(
  "/deletePost",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  PostController.deletePost
);

userRouter.get(
  "/deletePostImage",
  AuthVerifyMiddlware,
  PostController.deletePostImages
);

userRouter.post(
  "/reportPost",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  UserController.reportPost
);

userRouter.post(
  "/favouritePost",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  UserController.favouritePost
);

userRouter.get(
  "/favouritePostList",
  AuthVerifyMiddlware,
  UserController.favouritePostList
);

userRouter.get(
  "/activePost",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  UserController.activePost
);

userRouter.get(
  "/inactivePost",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  UserController.inactivePost
);

export default userRouter;
