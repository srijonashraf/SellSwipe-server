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
import { adminSchemaUpdate } from "../request/admin.schema.js";

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
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  AdminController.addNewAdmin
);
adminRouter.get(
  "/deleteAdmin",
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
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.withdrawReport
);
adminRouter.get(
  "/approvePost",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.approvePost
);
adminRouter.get(
  "/declinePost",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.declinePost
);
adminRouter.get(
  "/deletePost",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  SendNotification,
  AdminController.deletePost
);
adminRouter.get(
  "/sendFeedback",
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
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.warningAccount
);
adminRouter.get(
  "/restrictAccount",
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

adminRouter.post(
  "/createBrand",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  BrandController.createBrand
);
adminRouter.post(
  "/updateBrand",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  BrandController.updateBrand
);
adminRouter.get(
  "/deleteBrand",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  BrandController.deleteBrand
);

adminRouter.post(
  "/createCategory",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  CategoryController.createCategory
);
adminRouter.post(
  "/updateCategory",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  CategoryController.updateCategory
);
adminRouter.get(
  "/deleteCategory",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  CategoryController.deleteCategory
);

adminRouter.post(
  "/createModel",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  ModelController.createModel
);
adminRouter.post(
  "/updateModel",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  ModelController.updateModel
);
adminRouter.get(
  "/deleteModel",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  ModelController.deleteModel
);

adminRouter.post(
  "/createDivision",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.createDivision
);
adminRouter.post(
  "/updateDivision",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.updateDivision
);
adminRouter.get(
  "/deleteDivision",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.deleteDivision
);

adminRouter.post(
  "/createDistrict",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.createDistrict
);
adminRouter.post(
  "/updateDistrict",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.updateDistrict
);
adminRouter.get(
  "/deleteDistrict",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.deleteDistrict
);

adminRouter.post(
  "/createArea",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.createArea
);
adminRouter.post(
  "/updateArea",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.updateArea
);
adminRouter.get(
  "/deleteArea",
  AuthVerifyMiddlware,
  roleAuthentication("SuperAdmin"),
  LocationController.deleteArea
);

export default adminRouter;
