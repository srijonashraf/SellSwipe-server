import express from "express";
import * as BrandController from "../controllers/BrandController.js";
import * as CategoryContoller from "../controllers/CategoryController.js";
import * as ModelController from "../controllers/ModelController.js";
import * as LocationController from "../controllers/LocationController.js";
import * as PostController from "../controllers/PostController.js";
import * as StatsController from "../controllers/StatsController.js";
import * as LegalController from "../controllers/LegalController.js";
import * as AuthController from "../controllers/AuthController.js";
import * as ProductSliderController from "../controllers/ProductSliderController.js";
import { validateRequest } from "../middlewares/RequestValidateMiddleware.js";
import {
  userCredentialSchema,
  userSchemaCreate,
} from "../requests/UserSchema.js";
import { preLoginValidation } from "../middlewares/PreLoginValidationMiddleware.js";

const publicRouter = express.Router();

//_________Categories, Brands, and Models__________//
publicRouter.get("/categories", CategoryContoller.getCategoryList);
publicRouter.get("/brands", BrandController.getBrandList);
publicRouter.get("/models/:brandId", ModelController.getModelList);

//_________Location__________//
publicRouter.get("/locations/divisions", LocationController.getDivisionList);
publicRouter.get(
  "/locations/:divisionId/districts",
  LocationController.getDistrictList
);
publicRouter.get(
  "/locations/:districtId/areas",
  LocationController.getAreaList
);

//_________Legal Informations______//
publicRouter.get("/legals", LegalController.getLegalList);

//_________Posts__________//
publicRouter.get("/posts/all-post", PostController.getAllPosts);
publicRouter.get("/posts/search", PostController.postSearchWithFilters);

//_________Auth__________//
publicRouter.post(
  "/auth/register",
  validateRequest({ schema: userSchemaCreate, isParam: false, isQuery: false }),
  AuthController.userRegistration
);

publicRouter.post(
  "/auth/login",
  validateRequest({
    schema: userCredentialSchema,
    isParam: false,
    isQuery: false,
  }),
  preLoginValidation,
  AuthController.userLogin
);

publicRouter.get(
  "/auth/send-email/verification",
  AuthController.sendVerificationEmail
);
publicRouter.get(
  "/auth/send-email/reset-password",
  AuthController.sendResetPasswordEmail
);
publicRouter.get("/auth/verify/email", AuthController.verifyUser);

publicRouter.get("/auth/verify/token", AuthController.verifyResetPasswordToken);

publicRouter.post("/auth/reset-password", AuthController.resetPassword);

//____Stats____//

publicRouter.get("/total-users", StatsController.getTotalUsers);
publicRouter.get("/total-posts", StatsController.getTotalPosts);
publicRouter.get("/total-categories", StatsController.getTotalCategories);
publicRouter.get("/total-brands", StatsController.getTotalBrands);

//____Sliders____//
publicRouter.get("/sliders", ProductSliderController.getProductSlider);
publicRouter.get(
  "/update-sliders",
  ProductSliderController.fetchLatestPostandSetSlider
);

export default publicRouter;
