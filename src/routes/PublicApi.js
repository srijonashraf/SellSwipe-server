import express from "express";
import * as BrandController from "../controllers/BrandController.js";
import * as CategoryContoller from "../controllers/CategoryController.js";
import * as ModelController from "../controllers/ModelController.js";
import * as LocationController from "../controllers/LocationController.js";
import * as PostController from "../controllers/PostController.js";
import * as UserController from "../controllers/UserController.js";
import { validateRequest } from "../middlewares/RequestValidateMiddleware.js";
import {
  userCredentialSchema,
  userSchemaCreate,
} from "../request/UserSchema.js";

const publicRouter = express.Router();

publicRouter.get("/categories", CategoryContoller.getCategoryList);
publicRouter.get("/brands", BrandController.getBrandList);
publicRouter.get("/models/:brandId", ModelController.getModelList);
publicRouter.get("/locations/divisions", LocationController.getDivisionList);
publicRouter.get(
  "/locations/:divisionId/districts",
  LocationController.getDistrictList
);
publicRouter.get(
  "/locations/:districtId/areas",
  LocationController.getAreaList
);
publicRouter.get("/posts/all-post", PostController.getAllPosts);
publicRouter.get("/posts/filter", PostController.postListByFilter);
publicRouter.get("/posts/search", PostController.postSearchWithFilters);

publicRouter.post(
  "/auth/register",
  validateRequest({ schema: userSchemaCreate, isParam: false, isQuery: false }),
  UserController.registration
);

publicRouter.post(
  "/auth/login",
  validateRequest({
    schema: userCredentialSchema,
    isParam: false,
    isQuery: false,
  }),
  UserController.login
);

/**
 * The sendVerificationEmail and sendResetPassowrdEmail is used for external API calling.
 * Internally the sendAuthEmail function is used to deal with auth verification and reset password.
 */

publicRouter.get(
  "/auth/send-email/verification",
  UserController.sendVerificationEmail
);
publicRouter.get(
  "/auth/send-email/reset-password",
  UserController.sendResetPasswordEmail
);

publicRouter.get("/auth/verify/email", UserController.verifyUser);
publicRouter.get("/auth/verify/token", UserController.verifyResetPasswordToken);
publicRouter.post("/auth/reset-password", UserController.resetPassword);

export default publicRouter;
