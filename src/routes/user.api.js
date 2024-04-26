import express from "express";
import * as PostController from "../controllers/PostController.js";
import * as UserController from "../controllers/UserController.js";
import { upload } from "../middlewares/MulterMiddleware.js";
import AuthVerifyMiddlware from "../middlewares/AuthVerifyMiddleware.js";
const userRouter = express.Router();

userRouter.post("/registration", UserController.userRegistration);
userRouter.post("/login", UserController.userLogin);
userRouter.get("/verifyEmail", UserController.userEmailVerify);
userRouter.get("/verifyOTP", UserController.OTPVerify);
userRouter.post("/resetPassword", UserController.recoverResetPassword);
userRouter.post("/updateProfilePhoto", AuthVerifyMiddlware, upload.any(), UserController.userProfilePhotoUpdate);
userRouter.post("/updateProfile", AuthVerifyMiddlware, UserController.userProfileUpdate);
userRouter.get("/profileDetails", AuthVerifyMiddlware, UserController.userProfileDetails);
userRouter.post("/createPost", AuthVerifyMiddlware, PostController.CreatePost);

export default userRouter;
