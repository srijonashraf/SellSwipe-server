import express from "express";
import * as AdminController from "../controllers/AdminController.js";
import * as BrandController from "../controllers/BrandController.js";
import * as CategoryController from "../controllers/CategoryContoller.js";
import * as ModelController from "../controllers/ModelController.js";
import * as LocationController from "../controllers/LocationController.js";
import AuthVerifyMiddlware from "../middlewares/AuthVerifyMiddleware.js";
import { SendNotification } from "../middlewares/NotificationMiddleware.js";
import { roleAuthentication } from "../middlewares/RoleAuthenticationMiddleware.js";
import { validateRequest } from "../middlewares/RequestValidateMiddleware.js";
import {
  adminSchemaCreate,
  adminSchemaUpdate,
} from "../request/admin.schema.js";
import { idSchema } from "./../request/id.schema.js";

const adminRouter = express.Router();
adminRouter.post(
  "/login",
  validateRequest({
    schema: adminSchemaUpdate,
    isQuery: false,
    isParam: false,
  }),
  AdminController.adminLogin
);
adminRouter.get(
  "/adminProfileDetails",
  AuthVerifyMiddlware,
  AdminController.adminProfileDetails
);

adminRouter.post(
  "/addAdmin",
  validateRequest({
    schema: adminSchemaCreate,
    isQuery: false,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  AdminController.addNewAdmin
);
adminRouter.get(
  "/deleteAdmin",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  AdminController.deleteAdmin
);
adminRouter.get(
  "/adminList",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  AdminController.adminList
);
adminRouter.get(
  "/userList",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  AdminController.userList
);

adminRouter.get(
  "/reviewPostList",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.reviewPostList
);
adminRouter.get(
  "/approvedPostList",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.approvedPostList
);
adminRouter.get(
  "/declinedPostList",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.declinedPostList
);
adminRouter.get(
  "/reportedPostList",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.reportedPostList
);
adminRouter.get(
  "/withdrawReport",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.withdrawReport
);
adminRouter.get(
  "/approvePost",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.approvePost
);
adminRouter.get(
  "/declinePost",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.declinePost
);
adminRouter.get(
  "/deletePost",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  SendNotification,
  AdminController.deletePost
);
adminRouter.get(
  "/sendFeedback",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.sendFeedback
);

adminRouter.get(
  "/warnedAccountList",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.warnedAccountList
);
adminRouter.get(
  "/restrictedAccountList",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.restrictedAccountList
);
adminRouter.get(
  "/withdrawRestrictions",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.withdrawRestrictions
);
adminRouter.get(
  "/warningAccount",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.warningAccount
);
adminRouter.get(
  "/restrictAccount",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.restrictAccount
);
adminRouter.get(
  "/reviewNidList",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.reviewNidList
);

adminRouter.get(
  "/approveNid",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.approveNid
);

adminRouter.get(
  "/declineNid",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.declineNid
);

//Brand
adminRouter.post(
  "/createBrand",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  BrandController.createBrand
);
adminRouter.post(
  "/updateBrand",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  BrandController.updateBrand
);
adminRouter.get(
  "/deleteBrand",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  BrandController.deleteBrand
);

//Category
adminRouter.post(
  "/createCategory",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  CategoryController.createCategory
);
adminRouter.post(
  "/updateCategory",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  CategoryController.updateCategory
);
adminRouter.get(
  "/deleteCategory",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  CategoryController.deleteCategory
);

//Model
adminRouter.post(
  "/createModel",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  ModelController.createModel
);
adminRouter.post(
  "/updateModel",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  ModelController.updateModel
);
adminRouter.get(
  "/deleteModel",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  ModelController.deleteModel
);

//Division
adminRouter.post(
  "/createDivision",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.createDivision
);
adminRouter.post(
  "/updateDivision",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.updateDivision
);
adminRouter.get(
  "/deleteDivision",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.deleteDivision
);

adminRouter.post(
  "/createDistrict",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.createDistrict
);
adminRouter.post(
  "/updateDistrict",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.updateDistrict
);
adminRouter.get(
  "/deleteDistrict",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.deleteDistrict
);

adminRouter.post(
  "/createArea",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.createArea
);
adminRouter.post(
  "/updateArea",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.updateArea
);
adminRouter.get(
  "/deleteArea",
  validateRequest({
    schema: idSchema,
    isQuery: true,
    isParam: false,
  }),
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.deleteArea
);

export default adminRouter;
