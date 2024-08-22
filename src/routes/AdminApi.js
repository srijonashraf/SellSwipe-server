import express from "express";
import * as AdminController from "../controllers/AdminController.js";
import * as BrandController from "../controllers/BrandController.js";
import * as CategoryController from "../controllers/CategoryController.js";
import * as ModelController from "../controllers/ModelController.js";
import * as LocationController from "../controllers/LocationController.js";
import * as LegalController from "../controllers/LegalController.js";
import AuthVerifyMiddleware from "../middlewares/AuthVerifyMiddleware.js";
import { SendNotification } from "../middlewares/NotificationMiddleware.js";
import { roleAuthentication } from "../middlewares/RoleAuthenticationMiddleware.js";
import { validateRequest } from "../middlewares/RequestValidateMiddleware.js";
import {
  adminSchemaCreate,
  adminSchemaUpdate,
} from "../requests/AdminSchema.js";
import { idSchema } from "../requests/IdSchema.js";
import { upload } from "../middlewares/MulterMiddleware.js";
import { legalSchemaCreate, legalSchemaUpdate } from '../requests/LegalSchema.js';

const adminRouter = express.Router();

// _____________Auth________________//
adminRouter.post(
  "/login",
  validateRequest({ schema: adminSchemaUpdate }),
  AdminController.login
);

// _____________Profile________________//
adminRouter.get(
  "/profile/:id?",
  AuthVerifyMiddleware,
  AdminController.getProfile
);
adminRouter.post(
  "/admins",
  validateRequest({ schema: adminSchemaCreate }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  AdminController.createAdmin
);
adminRouter.put(
  "/admins",
  validateRequest({ schema: adminSchemaUpdate }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.updateAdmin
);
adminRouter.delete(
  "/admins/:id",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  AdminController.deleteAdmin
);
adminRouter.get(
  "/admins",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  AdminController.getAdminList
);
adminRouter.get(
  "/users",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  AdminController.getUserList
);

// _____________Manage Post________________//
adminRouter.get(
  "/posts/review",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.getReviewPostList
);
adminRouter.get(
  "/posts/review/ids",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.getReviewPostIds
);
adminRouter.get(
  "/posts/approved",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.getApprovedPostList
);
adminRouter.get(
  "/posts/declined",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.getDeclinedPostList
);
adminRouter.get(
  "/posts/reported",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.getReportedPostList
);
adminRouter.post(
  "/posts/:postId/withdraw-report",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.withdrawReport
);
adminRouter.post(
  "/posts/approve",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.approvePost
);
adminRouter.post(
  "/posts/decline",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.declinePost
);
adminRouter.delete(
  "/posts/:postId/delete",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  // SendNotification,
  AdminController.deletePost
);
adminRouter.post(
  "/feedback/:postId",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  // SendNotification,
  AdminController.sendFeedback
);

// _____________Manage Account________________//
adminRouter.get(
  "/accounts/warned",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.getWarnedAccountList
);
adminRouter.get(
  "/accounts/restricted",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.getRestrictedAccountList
);
adminRouter.post(
  "/accounts/:userId/withdraw-restrictions",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.withdrawRestrictions
);
adminRouter.post(
  "/accounts/:userId/warning",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.warningAccount
);
adminRouter.post(
  "/accounts/:userId/restrict",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.restrictAccount
);
adminRouter.get(
  "/nid/review",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.getReviewNidList
);
adminRouter.post(
  "/nid/approve/:userId",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.approveNid
);
adminRouter.post(
  "/nid/decline/:userId",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.declineNid
);

// _____________Category________________//
adminRouter.post(
  "/categories",
  AuthVerifyMiddleware,
  upload.single("image"),
  roleAuthentication("SuperAdmin"),
  CategoryController.createCategory
);
adminRouter.put(
  "/categories/:categoryId",
  AuthVerifyMiddleware,
  upload.single("image"),
  roleAuthentication("SuperAdmin"),
  CategoryController.updateCategory
);
adminRouter.delete(
  "/categories/:categoryId",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  CategoryController.deleteCategory
);

// _____________Sub Category________________//
adminRouter.post(
  "/categories/:categoryId/subcategories",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  CategoryController.createSubCategory
);
adminRouter.put(
  "/categories/:categoryId/subcategories/:id",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  CategoryController.updateSubCategory
);
adminRouter.delete(
  "/subcategories/:id",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  CategoryController.deleteSubCategory
);

// _____________Brand________________//
adminRouter.post(
  "/brands",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  BrandController.createBrand
);
adminRouter.put(
  "/brands/:brandId",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  BrandController.updateBrand
);
adminRouter.delete(
  "/brands/:brandId",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  BrandController.deleteBrand
);

// _____________Model________________//
adminRouter.post(
  "/brands/:brandId/models",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  ModelController.createModel
);
adminRouter.put(
  "/brands/:brandId/models/:id",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  ModelController.updateModel
);
adminRouter.delete(
  "/models/:id",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  ModelController.deleteModel
);

// _____________Location________________//
adminRouter.post(
  "/locations/divisions",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  LocationController.createDivision
);
adminRouter.put(
  "/locations/divisions/:id",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  LocationController.updateDivision
);
adminRouter.delete(
  "/locations/divisions/:id",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  LocationController.deleteDivision
);
adminRouter.post(
  "/locations/:divisionId/districts",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  LocationController.createDistrict
);
adminRouter.put(
  "/locations/districts/:id",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  LocationController.updateDistrict
);
adminRouter.delete(
  "/locations/districts/:id",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  LocationController.deleteDistrict
);
adminRouter.post(
  "/locations/:districtId/areas",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  LocationController.createArea
);
adminRouter.put(
  "/locations/areas/:id",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  LocationController.updateArea
);
adminRouter.delete(
  "/locations/areas/:id",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  LocationController.deleteArea
);

// _____________Legals________________//
adminRouter.post(
  "/legals",
  validateRequest({schema:legalSchemaCreate, isParam:false, isQuery:false}),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  LegalController.createLegal
);

adminRouter.put(
  "/legals/:id",
  validateRequest({schema:legalSchemaUpdate, isParam:true, isQuery:false}),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  LegalController.updateLegal
);

adminRouter.delete(
  "/legals/:id",
  validateRequest({schema:legalSchemaUpdate, isParam:true, isQuery:false}),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  LegalController.deleteLegal
);

// _____________Search________________//
adminRouter.get(
  "/search/users",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.searchUser
);
adminRouter.get(
  "/search/admins",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  AdminController.searchAdmin
);

export default adminRouter;
