import express from "express";
import * as BrandController from "../controllers/BrandController.js";
import * as CategoryContoller from "../controllers/CategoryContoller.js";
import * as ModelController from "../controllers/ModelController.js";
import * as LocationController from "../controllers/LocationController.js";
import * as PostController from "../controllers/PostController.js";
import * as UserController from "../controllers/UserController.js";
import { validateRequest } from "../middlewares/RequestValidateMiddleware.js";
import {
  userCredentialSchema,
  userSchemaCreate,
} from "../request/UserSchema.js";
import { otpSchemaUpdate } from "../request/OtpSchema.js";

const publicRouter = express.Router();

publicRouter.get("/listBrand", BrandController.listBrand);
publicRouter.get("/listCategory", CategoryContoller.listCategory);
publicRouter.get("/listModel", ModelController.listModel);
publicRouter.get("/listDivision", LocationController.listDivision);
publicRouter.get("/listDistrict", LocationController.listDistrict);
publicRouter.get("/listArea", LocationController.listArea);
publicRouter.get("/postList", PostController.postList);
publicRouter.get("/postListByFilter", PostController.postListByFilter);
publicRouter.get("/postSearch", PostController.postSearchWithFilters);

publicRouter.post(
  "/registration",
  validateRequest({ schema: userSchemaCreate, isParam: false, isQuery: false }),
  UserController.userRegistration
);

publicRouter.post(
  "/login",
  validateRequest({
    schema: userCredentialSchema,
    isParam: false,
    isQuery: false,
  }),
  UserController.userLogin
);

publicRouter.get(
  "/sendVerificationEmail",
  UserController.sendVerificationEmail
);

publicRouter.get(
  "/sendResetPasswordEmail",
  UserController.sendResetPasswordEmail
);

publicRouter.get(
  "/emailVerificationByLink",
  UserController.emailVerificationByLink
);

publicRouter.get(
  "/emailVerificationByOtp",
  validateRequest({ schema: otpSchemaUpdate, isQuery: true, isParam: false }),
  UserController.emailVerificationByOtp
);

publicRouter.post("/resetPasswordByLink", UserController.resetPasswordByLink);
publicRouter.post("/resetPasswordByOtp", UserController.resetPasswordByOtp);

export default publicRouter;
