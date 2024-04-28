import express from "express";
import * as AdminController from "../controllers/AdminController.js";
import * as BrandController from "../controllers/BrandController.js";
import * as CategoryController from "../controllers/CategoryContoller.js";
import * as ModelController from "../controllers/ModelController.js";
import * as LocationController from "../controllers/LocationController.js"
import AuthVerifyMiddlware from "../middlewares/AuthVerifyMiddleware.js";
import { permissionCheck } from "../middlewares/PermissionCheckMiddleware.js";
import { SendNotification } from "../middlewares/NotificationMiddleware.js";

const adminRouter = express.Router();

adminRouter.post("/login",AdminController.adminLogin);
adminRouter.get("/adminProfileDetails", AuthVerifyMiddlware, AdminController.adminProfileDetails);

adminRouter.post("/addAdmin",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),AdminController.addNewAdmin);
adminRouter.get("/deleteAdmin",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),AdminController.deleteAdmin);
adminRouter.get("/adminList",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),AdminController.adminList);
adminRouter.get("/userList",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),AdminController.userList);

adminRouter.get("/reviewPostList",AuthVerifyMiddlware,permissionCheck("SuperAdmin", "Admin"),AdminController.reviewPostList);
adminRouter.get("/approvedPostList",AuthVerifyMiddlware,permissionCheck("SuperAdmin", "Admin"),AdminController.approvedPostList);
adminRouter.get("/declinedPostList",AuthVerifyMiddlware,permissionCheck("SuperAdmin", "Admin"),AdminController.declinedPostList);
adminRouter.get("/reportedPostList",AuthVerifyMiddlware,permissionCheck("SuperAdmin", "Admin"),AdminController.reportedPostList);
adminRouter.get("/withdrawReport",AuthVerifyMiddlware,permissionCheck("SuperAdmin", "Admin"),AdminController.withdrawReport);
adminRouter.get("/approvePost",AuthVerifyMiddlware,permissionCheck("SuperAdmin", "Admin"),AdminController.approvePost);
adminRouter.get("/declinePost",AuthVerifyMiddlware,permissionCheck("SuperAdmin", "Admin"),AdminController.declinePost);
adminRouter.get("/deletePost",AuthVerifyMiddlware,permissionCheck("SuperAdmin", "Admin"),SendNotification,AdminController.deletePost);
adminRouter.get("/sendFeedback",AuthVerifyMiddlware,permissionCheck("SuperAdmin", "Admin"),AdminController.sendFeedback);



adminRouter.get("/warnedAccountList",AuthVerifyMiddlware,permissionCheck("SuperAdmin", "Admin"),AdminController.warnedAccountList);
adminRouter.get("/restrictedAccountList",AuthVerifyMiddlware,permissionCheck("SuperAdmin", "Admin"),AdminController.restrictedAccountList);
adminRouter.get("/withdrawRestrictions",AuthVerifyMiddlware,permissionCheck("SuperAdmin", "Admin"),AdminController.withdrawRestrictions);
adminRouter.get("/warningAccount",AuthVerifyMiddlware,permissionCheck("SuperAdmin", "Admin"),AdminController.warningAccount);
adminRouter.get("/restrictAccount",AuthVerifyMiddlware,permissionCheck("SuperAdmin", "Admin"),AdminController.restrictAccount);


adminRouter.post("/createBrand",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),BrandController.createBrand);
adminRouter.post("/updateBrand",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),BrandController.updateBrand);
adminRouter.get("/deleteBrand",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),BrandController.deleteBrand);

adminRouter.post("/createCategory",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),CategoryController.createCategory);
adminRouter.post("/updateCategory",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),CategoryController.updateCategory);
adminRouter.get("/deleteCategory",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),CategoryController.deleteCategory);

adminRouter.post("/createModel",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),ModelController.createModel);
adminRouter.post("/updateModel",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),ModelController.updateModel);
adminRouter.get("/deleteModel",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),ModelController.deleteModel);

adminRouter.post("/createDivision",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),LocationController.createDivision);
adminRouter.post("/updateDivision",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),LocationController.updateDivision);
adminRouter.get("/deleteDivision",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),LocationController.deleteDivision);

adminRouter.post("/createDistrict",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),LocationController.createDistrict);
adminRouter.post("/updateDistrict",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),LocationController.updateDistrict);
adminRouter.get("/deleteDistrict",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),LocationController.deleteDistrict);

adminRouter.post("/createArea",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),LocationController.createArea);
adminRouter.post("/updateArea",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),LocationController.updateArea);
adminRouter.get("/deleteArea",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),LocationController.deleteArea);



export default adminRouter;
