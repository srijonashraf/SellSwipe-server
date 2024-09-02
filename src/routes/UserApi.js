import express from "express";
import * as PostController from "../controllers/PostController.js";
import * as ReviewController from "../controllers/ReviewController.js";
import * as UserController from "../controllers/UserController.js";
import * as TicketController from "../controllers/TicketController.js";
import * as AuthController from "../controllers/AuthController.js";
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
import { userAuthentication } from "../middlewares/RoleAuthenticationMiddleware.js";

const userRouter = express.Router();

//For uploading anything we have to use Multer at first as the middleware because it handles form-data and uploads.

//_________Profile & User___________//
userRouter.get(
  "/profile",
  AuthVerifyMiddlware,
  userAuthentication,
  UserController.profile
);

userRouter.put(
  "/profile",
  validateRequest({ schema: userSchemaUpdate, isParam: false, isQuery: false }),
  AuthVerifyMiddlware,
  userAuthentication,
  UserController.updateProfile
);

userRouter.put(
  "/password",
  AuthVerifyMiddlware,
  userAuthentication,
  UserController.updatePassword
);

userRouter.post(
  "/avatar",
  upload.single("avatar"),
  AuthVerifyMiddlware,
  userAuthentication,
  UserController.updateAvatar
);

userRouter.post(
  "/nid",
  upload.fields([
    { name: "nidFront", maxCount: 1 },
    { name: "nidBack", maxCount: 1 },
  ]),
  AuthVerifyMiddlware,
  userAuthentication,
  UserController.updateNid
);


//______Posts Actions______//
userRouter.post(
  "/posts/:id/report",
  validateRequest({ schema: idSchema, isQuery: false, isParam: true }),
  AuthVerifyMiddlware,
  userAuthentication,
  PostController.reportPost
);

userRouter.get(
  "/posts/reported",
  AuthVerifyMiddlware,
  userAuthentication,
  PostController.reportedPostList
);

userRouter.post(
  "/posts/:id/favorite",
  validateRequest({ schema: idSchema, isQuery: true, isParam: false }),
  AuthVerifyMiddlware,
  userAuthentication,
  PostController.favouritePost
);

userRouter.get(
  "/posts/favorites",
  AuthVerifyMiddlware,
  userAuthentication,
  PostController.favouritePostList
);

userRouter.patch(
  "/posts/:id",
  validateRequest({ schema: idSchema, isQuery: false, isParam: true }),
  AuthVerifyMiddlware,
  userAuthentication,
  PostController.updatePostStatus
);

userRouter.post(
  "/posts/similar",
  validateRequest({ schema: idSchema, isQuery: false, isParam: false }),
  AuthVerifyMiddlware,
  userAuthentication,
  PostController.getSimilarPosts
);

userRouter.get(
  "/posts/user",
  AuthVerifyMiddlware,
  userAuthentication,
  PostController.ownPosts
);


userRouter.post(
  "/posts",
  upload.array("images", 5),
  validateRequest({ schema: postSchemaCreate, isQuery: false, isParam: false }),
  AuthVerifyMiddlware,
  userAuthentication,
  PrePostValidation,
  PostController.createPost
);

userRouter.put(
  "/posts/:id",
  upload.array("images", 5),
  validateRequest({ schema: postSchemaUpdate, isQuery: false, isParam: false }),
  AuthVerifyMiddlware,
  userAuthentication,
  PostController.updatePost
);

userRouter.get(
  "/posts/:id",
  AuthVerifyMiddlware,
  userAuthentication,
  PostController.detailsPost
);

userRouter.delete(
  "/posts/:id",
  validateRequest({ schema: idSchema, isQuery: false, isParam: true }),
  AuthVerifyMiddlware,
  userAuthentication,
  PostController.deletePostByUser
);

userRouter.get(
  "/posts/:id/images",
  AuthVerifyMiddlware,
  userAuthentication,
  PostController.deletePostImages
);

//______Review______//
userRouter.post(
  "/reviews/:postId",
  AuthVerifyMiddlware,
  userAuthentication,
  ReviewController.createReview
);

userRouter.put(
  "/reviews/:id",
  AuthVerifyMiddlware,
  userAuthentication,
  ReviewController.updateReview
);

userRouter.delete(
  "/reviews/:id",
  AuthVerifyMiddlware,
  userAuthentication,
  ReviewController.deleteReviewByUser
);

userRouter.post(
  "/reviews/:id/report",
  validateRequest({ schema: idSchema, isParam: true, isQuery: false }),
  AuthVerifyMiddlware,
  userAuthentication,
  ReviewController.reportReview
);

//______Ticket Actions______//
userRouter.post(
  "/tickets",
  validateRequest({
    schema: ticketSchemaCreate,
    isParam: false,
    isQuery: false,
  }),
  AuthVerifyMiddlware,
  userAuthentication,
  TicketController.createTicketByUser
);
userRouter.get(
  "/tickets/:id?",
  AuthVerifyMiddlware,
  userAuthentication,
  TicketController.getTicket
);

userRouter.post(
  "/tickets/:id/comment",
  validateRequest({
    schema: ticketSchemaUpdate,
    isParam: true,
    isQuery: false,
  }),
  AuthVerifyMiddlware,
  userAuthentication,
  TicketController.commentByUser
);

export default userRouter;
