import express from "express";
import * as PostController from "../controllers/PostController.js";
import * as UserController from "../controllers/UserController.js";
import { upload } from "../middlewares/MulterMiddleware.js";
import AuthVerifyMiddlware from "../middlewares/AuthVerifyMiddleware.js";
import { validateRequest } from "../middlewares/RequestValidateMiddleware.js";
import {
  postSchemaCreate,
  postSchemaUpdate,
} from "./../request/post.schema.js";
import { userSchemaCreate } from "../request/user.schema.js";
import { preLoginValidation } from "../middlewares/PreLoginValidationMiddleware.js";
import { PrePostValidation } from "../middlewares/PrePostValidationMiddleware.js";

const userRouter = express.Router();

userRouter.post("/registration", UserController.userRegistration);

userRouter.post(
  "/login",
  preLoginValidation,
  validateRequest({ schema: userSchemaCreate, isParam: false, isQuery: false }),
  UserController.userLogin
);

userRouter.get("/verifyEmail", UserController.userEmailVerify);

userRouter.get("/verifyOTP", UserController.OTPVerify);

userRouter.post("/resetPassword", UserController.recoverResetPassword);

userRouter.post(
  "/updateAvatar",
  AuthVerifyMiddlware,
  upload.single("avatar"),
  UserController.userAvatarUpdate
);

userRouter.post(
  "/updateProfile",
  AuthVerifyMiddlware,
  UserController.userProfileUpdate
);

userRouter.post(
  "/updateNidRequest",
  AuthVerifyMiddlware,
  upload.fields([
    { name: "nidFront", maxCount: 1 },
    { name: "nidBack", maxCount: 1 },
  ]),
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
  AuthVerifyMiddlware,
  UserController.userLogoutFromSession
);

userRouter.post(
  "/createPost",
  AuthVerifyMiddlware,
  PrePostValidation,
  upload.array("images", 5),
  validateRequest({ schema: postSchemaCreate, isQuery: false, isParam: false }),
  PostController.CreatePost
);

userRouter.post(
  "/updatePost",
  AuthVerifyMiddlware,
  upload.array("images", 5),
  validateRequest({ schema: postSchemaUpdate, isQuery: false, isParam: false }),
  PostController.UpdatePost
);

userRouter.get("/deletePost", AuthVerifyMiddlware, PostController.DeletePost);

userRouter.get(
  "/deletePostImage",
  AuthVerifyMiddlware,
  PostController.DeletePostImage
);

//Testing purpose only
userRouter.get(
  "/testValidator",
  validateRequest({ schema: postSchemaCreate, isQuery: false, isParam: false })
);

export default userRouter;
