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
import * as ReviewController from "../controllers/ReviewController.js";
import * as AuthController from "../controllers/AuthController.js";
import AuthVerifyMiddleware from "../middlewares/AuthVerifyMiddleware.js";
import { adminAuthentication } from "../middlewares/RoleAuthenticationMiddleware.js";
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
  AuthController.adminLogin
);

adminRouter.put(
  "/password",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin","Admin"),
  AdminController.updatePassword
);

// _____________Profile________________//
adminRouter.get(
  "/profile/:id?",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin","Admin"),
  AdminController.getAdminProfile
);
adminRouter.post(
  "/admins",
  validateRequest({ schema: adminSchemaCreate }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  AdminController.createAdmin
);
adminRouter.put(
  "/admins",
  validateRequest({ schema: adminSchemaUpdate }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  AdminController.updateAdmin
);
adminRouter.delete(
  "/admins/:id",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  AdminController.deleteAdmin
);
adminRouter.get(
  "/admins",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  AdminController.getAdminList
);
adminRouter.get(
  "/users",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  UserController.getUserList
);

// _____________Manage Post________________//
adminRouter.get(
  "/posts/review",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  PostController.getReviewPostList
);

adminRouter.get(
  "/posts/approved",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  PostController.getApprovedPostList
);
adminRouter.get(
  "/posts/declined",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  PostController.getDeclinedPostList
);
adminRouter.get(
  "/posts/reported",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  PostController.getReportedPostList
);
adminRouter.post(
  "/posts/:postId/withdraw-report/:id",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  PostController.withdrawReport
);
adminRouter.post(
  "/posts/approve",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  PostController.approvePost
);
adminRouter.post(
  "/posts/decline",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  PostController.declinePost
);
adminRouter.delete(
  "/posts/:postId/delete",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  PostController.deletePostByAdmin
);
adminRouter.post(
  "/feedback/:postId",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  PostController.sendFeedback
);

// _____________Review________________//
adminRouter.get(
  "/reviews/reported",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  ReviewController.getReportedReview
);
adminRouter.post(
  "/reviews/:id/withdraw-report",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  ReviewController.withdrawReportFromReview
);
adminRouter.delete(
  "/reviews/:id",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  ReviewController.deleteReviewByAdmin
);

// _____________Manage Account________________//
adminRouter.post(
  "/accounts/:userId/withdraw-restrictions",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  UserController.withdrawRestrictions
);
adminRouter.post(
  "/accounts/:userId/warning",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  UserController.warningAccount
);
adminRouter.post(
  "/accounts/:userId/restrict",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  UserController.restrictAccount
);
adminRouter.get(
  "/nid/review",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  UserController.getReviewNidList
);
adminRouter.post(
  "/nid/approve/:userId",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  UserController.approveNid
);
adminRouter.post(
  "/nid/decline/:userId",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  UserController.declineNid
);

// _____________Category________________//
adminRouter.post(
  "/categories",
  AuthVerifyMiddleware,
  upload.single("image"),
  adminAuthentication("SuperAdmin"),
  CategoryController.createCategory
);
adminRouter.put(
  "/categories/:categoryId",
  AuthVerifyMiddleware,
  upload.single("image"),
  adminAuthentication("SuperAdmin"),
  CategoryController.updateCategory
);
adminRouter.delete(
  "/categories/:categoryId",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  CategoryController.deleteCategory
);

// _____________Sub Category________________//
adminRouter.post(
  "/categories/:categoryId/subcategories",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  CategoryController.createSubCategory
);
adminRouter.put(
  "/categories/:categoryId/subcategories/:id",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  CategoryController.updateSubCategory
);
adminRouter.delete(
  "/subcategories/:id",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  CategoryController.deleteSubCategory
);

// _____________Brand________________//
adminRouter.post(
  "/brands",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  BrandController.createBrand
);
adminRouter.put(
  "/brands/:brandId",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  BrandController.updateBrand
);
adminRouter.delete(
  "/brands/:brandId",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  BrandController.deleteBrand
);

// _____________Model________________//
adminRouter.post(
  "/brands/:brandId/models",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  ModelController.createModel
);
adminRouter.put(
  "/brands/:brandId/models/:id",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  ModelController.updateModel
);
adminRouter.delete(
  "/models/:id",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  ModelController.deleteModel
);

// _____________Location________________//
adminRouter.post(
  "/locations/divisions",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  LocationController.createDivision
);
adminRouter.put(
  "/locations/divisions/:id",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  LocationController.updateDivision
);
adminRouter.delete(
  "/locations/divisions/:id",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  LocationController.deleteDivision
);
adminRouter.post(
  "/locations/:divisionId/districts",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  LocationController.createDistrict
);
adminRouter.put(
  "/locations/districts/:id",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  LocationController.updateDistrict
);
adminRouter.delete(
  "/locations/districts/:id",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  LocationController.deleteDistrict
);
adminRouter.post(
  "/locations/:districtId/areas",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  LocationController.createArea
);
adminRouter.put(
  "/locations/areas/:id",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  LocationController.updateArea
);
adminRouter.delete(
  "/locations/areas/:id",
  validateRequest({ schema: idSchema, isParam: true }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
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
  adminAuthentication("SuperAdmin", "Admin"),
  LegalController.createLegal
);

adminRouter.put(
  "/legals/:id",
  validateRequest({ schema: legalSchemaUpdate, isParam: true, isQuery: false }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  LegalController.updateLegal
);

adminRouter.delete(
  "/legals/:id",
  validateRequest({ schema: legalSchemaUpdate, isParam: true, isQuery: false }),
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  LegalController.deleteLegal
);

// _____________Search________________//
adminRouter.get(
  "/users/search",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  UserController.searchUser
);
adminRouter.get(
  "/admins/search",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin"),
  AdminController.searchAdmin
);

// _____________Email________________//
adminRouter.post(
  "/promotional/send",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  AdminController.sendPromotionalEmail
);

// _____________Ticket________________//
adminRouter.get(
  "/tickets",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  TicketController.getAllTicket
);

adminRouter.post(
  "/tickets/:userId",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  TicketController.createTicketByAdmin
);

adminRouter.put(
  "/tickets/:id/comment",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  TicketController.commentByAdmin
);

adminRouter.put(
  "/tickets/:id/update-status",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  TicketController.updateTicketStatusandPriority
);

adminRouter.put(
  "/tickets/:id/assign",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  TicketController.assignNewAdminToTicket
);

//___Admin Dashboard__//
adminRouter.get(
  "/dashboard/posts/review/count",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  AdminController.countPostsToReview
);

adminRouter.get(
  "/dashboard/report/review/count",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  AdminController.countReportsToReview
);

adminRouter.get(
  "/dashboard/tickets/count",
  AuthVerifyMiddleware,
  adminAuthentication("SuperAdmin", "Admin"),
  AdminController.countTicketsByStatus
);

export default adminRouter;
