import express from "express";
import * as BrandController from "../controllers/BrandController.js";
import * as CategoryContoller from "../controllers/CategoryController.js";
import * as ModelController from "../controllers/ModelController.js";
import * as LocationController from "../controllers/LocationController.js";
import * as PostController from "../controllers/PostController.js";
import * as UserController from "../controllers/UserController.js";
import * as LegalController from "../controllers/LegalController.js";
import { validateRequest } from "../middlewares/RequestValidateMiddleware.js";
import {
  userCredentialSchema,
  userSchemaCreate,
} from "../request/UserSchema.js";

const publicRouter = express.Router();

/**
 * Categories, Brands, and Models Endpoints
 */
publicRouter.get("/categories", CategoryContoller.getCategoryList);
publicRouter.get("/brands", BrandController.getBrandList);
publicRouter.get("/models/:brandId", ModelController.getModelList);

/**
 * Location Endpoints
 */
publicRouter.get("/locations/divisions", LocationController.getDivisionList);
publicRouter.get(
  "/locations/:divisionId/districts",
  LocationController.getDistrictList
);
publicRouter.get(
  "/locations/:districtId/areas",
  LocationController.getAreaList
);

/**
 * Legal Information Endpoints
 */
publicRouter.get("/legals", LegalController.getLegalList);

/**
 * Posts Endpoints
 */
publicRouter.get("/posts/all-post", PostController.getAllPosts);
publicRouter.get("/posts/search", PostController.postSearchWithFilters);

/**
 * Authentication Endpoints
 */
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
 * Email Verification and Password Reset Endpoints
 * sendVerificationEmail and sendResetPasswordEmail are for external API calls.
 * Internally, sendAuthEmail handles auth verification and password resets.
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
