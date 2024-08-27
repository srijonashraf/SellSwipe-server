import express from "express";
import * as AdminController from "../controllers/AdminController.js";
import * as BrandController from "../controllers/BrandController.js";
import * as CategoryController from "../controllers/CategoryController.js";
import * as ModelController from "../controllers/ModelController.js";
import * as LocationController from "../controllers/LocationController.js";
import * as LegalController from "../controllers/LegalController.js";
import * as TicketController from "../controllers/TicketController.js";
import * as UserController from "../controllers/UserController.js";
import * as PostController from "../controllers/PostController.js";
import AuthVerifyMiddleware from "../middlewares/AuthVerifyMiddleware.js";
import { roleAuthentication } from "../middlewares/RoleAuthenticationMiddleware.js";
import { validateRequest } from "../middlewares/RequestValidateMiddleware.js";
import {
  adminSchemaCreate,
  adminSchemaUpdate,
} from "../requests/AdminSchema.js";
import { idSchema } from "../requests/IdSchema.js";
import { upload } from "../middlewares/MulterMiddleware.js";
import {
  legalSchemaCreate,
  legalSchemaUpdate,
} from "../requests/LegalSchema.js";

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
  AdminController.getAdminProfile
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
  UserController.getUserList
);

// _____________Manage Post________________//
adminRouter.get(
  "/posts/review",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  PostController.getReviewPostList
);

adminRouter.get(
  "/posts/approved",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  PostController.getApprovedPostList
);
adminRouter.get(
  "/posts/declined",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  PostController.getDeclinedPostList
);
adminRouter.get(
  "/posts/reported",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  PostController.getReportedPostList
);
adminRouter.post(
  "/posts/:postId/withdraw-report/:id",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  PostController.withdrawReport
);
adminRouter.post(
  "/posts/approve",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  PostController.approvePost
);
adminRouter.post(
  "/posts/decline",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  PostController.declinePost
);
adminRouter.delete(
  "/posts/:postId/delete",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  PostController.deletePostByAdmin
);
adminRouter.post(
  "/feedback/:postId",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  PostController.sendFeedback
);

// _____________Manage Account________________//
adminRouter.post(
  "/accounts/:userId/withdraw-restrictions",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  UserController.withdrawRestrictions
);
adminRouter.post(
  "/accounts/:userId/warning",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  UserController.warningAccount
);
adminRouter.post(
  "/accounts/:userId/restrict",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  UserController.restrictAccount
);
adminRouter.get(
  "/nid/review",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  UserController.getReviewNidList
);
adminRouter.post(
  "/nid/approve/:userId",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  UserController.approveNid
);
adminRouter.post(
  "/nid/decline/:userId",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  UserController.declineNid
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
  validateRequest({
    schema: legalSchemaCreate,
    isParam: false,
    isQuery: false,
  }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  LegalController.createLegal
);

adminRouter.put(
  "/legals/:id",
  validateRequest({ schema: legalSchemaUpdate, isParam: true, isQuery: false }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  LegalController.updateLegal
);

adminRouter.delete(
  "/legals/:id",
  validateRequest({ schema: legalSchemaUpdate, isParam: true, isQuery: false }),
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  LegalController.deleteLegal
);

// _____________Search________________//
adminRouter.get(
  "/users/search",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  UserController.searchUser
);
adminRouter.get(
  "/admins/search",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin"),
  AdminController.searchAdmin
);

// _____________Email________________//
adminRouter.post(
  "/promotional/send",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  AdminController.sendPromotionalEmail
);

// _____________Ticket________________//
adminRouter.get(
  "/tickets",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  TicketController.getAllTicket
);

adminRouter.post(
  "/tickets/:userId",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  TicketController.createTicketByAdmin
);

adminRouter.put(
  "/tickets/:id/comment",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  TicketController.commentByAdmin
);

adminRouter.put(
  "/tickets/:id/assign",
  AuthVerifyMiddleware,
  roleAuthentication("SuperAdmin", "Admin"),
  TicketController.assignNewAdminToTicket
);

export default adminRouter;
