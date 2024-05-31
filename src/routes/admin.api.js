import express from "express";
import * as AdminController from "../controllers/AdminController.js";
import * as BrandController from "../controllers/BrandController.js";
import * as CategoryController from "../controllers/CategoryContoller.js";
import * as ModelController from "../controllers/ModelController.js";
import * as LocationController from "../controllers/LocationController.js"
import AuthVerifyMiddlware from "../middlewares/AuthVerifyMiddleware.js";
import { SendNotification } from "../middlewares/NotificationMiddleware.js";
import { checkPermission } from './../middlewares/PermissionCheckMiddleware.js';

const adminRouter = express.Router();

adminRouter.post("/login",AdminController.adminLogin);
adminRouter.get("/adminProfileDetails", AuthVerifyMiddlware, AdminController.adminProfileDetails);

adminRouter.post("/addAdmin",AuthVerifyMiddlware,checkPermission("SuperAdmin"),AdminController.addNewAdmin);
adminRouter.get("/deleteAdmin",AuthVerifyMiddlware,checkPermission("SuperAdmin"),AdminController.deleteAdmin);
adminRouter.get("/adminList",AuthVerifyMiddlware,checkPermission("SuperAdmin"),AdminController.adminList);
adminRouter.get("/userList",AuthVerifyMiddlware,checkPermission("SuperAdmin"),AdminController.userList);

adminRouter.get("/reviewPostList",AuthVerifyMiddlware,checkPermission("SuperAdmin", "Admin"),AdminController.reviewPostList);
adminRouter.get("/approvedPostList",AuthVerifyMiddlware,checkPermission("SuperAdmin", "Admin"),AdminController.approvedPostList);
adminRouter.get("/declinedPostList",AuthVerifyMiddlware,checkPermission("SuperAdmin", "Admin"),AdminController.declinedPostList);
adminRouter.get("/reportedPostList",AuthVerifyMiddlware,checkPermission("SuperAdmin", "Admin"),AdminController.reportedPostList);
adminRouter.get("/withdrawReport",AuthVerifyMiddlware,checkPermission("SuperAdmin", "Admin"),AdminController.withdrawReport);
adminRouter.get("/approvePost",AuthVerifyMiddlware,checkPermission("SuperAdmin", "Admin"),AdminController.approvePost);
adminRouter.get("/declinePost",AuthVerifyMiddlware,checkPermission("SuperAdmin", "Admin"),AdminController.declinePost);
adminRouter.get("/deletePost",AuthVerifyMiddlware,checkPermission("SuperAdmin", "Admin"),SendNotification,AdminController.deletePost);
adminRouter.get("/sendFeedback",AuthVerifyMiddlware,checkPermission("SuperAdmin", "Admin"),AdminController.sendFeedback);

adminRouter.get("/warnedAccountList",AuthVerifyMiddlware,checkPermission("SuperAdmin", "Admin"),AdminController.warnedAccountList);
adminRouter.get("/restrictedAccountList",AuthVerifyMiddlware,checkPermission("SuperAdmin", "Admin"),AdminController.restrictedAccountList);
adminRouter.get("/withdrawRestrictions",AuthVerifyMiddlware,checkPermission("SuperAdmin", "Admin"),AdminController.withdrawRestrictions);
adminRouter.get("/warningAccount",AuthVerifyMiddlware,checkPermission("SuperAdmin", "Admin"),AdminController.warningAccount);
adminRouter.get("/restrictAccount",AuthVerifyMiddlware,checkPermission("SuperAdmin", "Admin"),AdminController.restrictAccount);
adminRouter.get("/reviewNidList",AuthVerifyMiddlware,checkPermission("SuperAdmin", "Admin"),AdminController.reviewNidList);

adminRouter.post("/createBrand",AuthVerifyMiddlware,checkPermission("SuperAdmin"),BrandController.createBrand);
adminRouter.post("/updateBrand",AuthVerifyMiddlware,checkPermission("SuperAdmin"),BrandController.updateBrand);
adminRouter.get("/deleteBrand",AuthVerifyMiddlware,checkPermission("SuperAdmin"),BrandController.deleteBrand);

adminRouter.post("/createCategory",AuthVerifyMiddlware,checkPermission("SuperAdmin"),CategoryController.createCategory);
adminRouter.post("/updateCategory",AuthVerifyMiddlware,checkPermission("SuperAdmin"),CategoryController.updateCategory);
adminRouter.get("/deleteCategory",AuthVerifyMiddlware,checkPermission("SuperAdmin"),CategoryController.deleteCategory);

adminRouter.post("/createModel",AuthVerifyMiddlware,checkPermission("SuperAdmin"),ModelController.createModel);
adminRouter.post("/updateModel",AuthVerifyMiddlware,checkPermission("SuperAdmin"),ModelController.updateModel);
adminRouter.get("/deleteModel",AuthVerifyMiddlware,checkPermission("SuperAdmin"),ModelController.deleteModel);

adminRouter.post("/createDivision",AuthVerifyMiddlware,checkPermission("SuperAdmin"),LocationController.createDivision);
adminRouter.post("/updateDivision",AuthVerifyMiddlware,checkPermission("SuperAdmin"),LocationController.updateDivision);
adminRouter.get("/deleteDivision",AuthVerifyMiddlware,checkPermission("SuperAdmin"),LocationController.deleteDivision);

adminRouter.post("/createDistrict",AuthVerifyMiddlware,checkPermission("SuperAdmin"),LocationController.createDistrict);
adminRouter.post("/updateDistrict",AuthVerifyMiddlware,checkPermission("SuperAdmin"),LocationController.updateDistrict);
adminRouter.get("/deleteDistrict",AuthVerifyMiddlware,checkPermission("SuperAdmin"),LocationController.deleteDistrict);

adminRouter.post("/createArea",AuthVerifyMiddlware,checkPermission("SuperAdmin"),LocationController.createArea);
adminRouter.post("/updateArea",AuthVerifyMiddlware,checkPermission("SuperAdmin"),LocationController.updateArea);
adminRouter.get("/deleteArea",AuthVerifyMiddlware,checkPermission("SuperAdmin"),LocationController.deleteArea);



export default adminRouter;
