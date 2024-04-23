import express from "express";
import * as AdminController from "../controllers/AdminController.js";
import * as BrandController from "../controllers/BrandController.js";
import * as CategoryController from "../controllers/CategoryContoller.js";
import * as ModelController from "../controllers/ModelController.js";
import AuthVerifyMiddlware from "../middlewares/AuthVerifyMiddleware.js";
import { permissionCheck } from "../middlewares/PermissionCheckMiddleware.js";

const adminRouter = express.Router();

adminRouter.post("/login",AdminController.adminLogin);

adminRouter.post("/addAdmin",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),AdminController.addNewAdmin);
adminRouter.get("/deleteAdmin",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),AdminController.deleteAdmin);
adminRouter.get("/adminList",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),AdminController.adminList);
adminRouter.get("/userList",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),AdminController.userList);
adminRouter.get("/warnedAccountList",AuthVerifyMiddlware,permissionCheck("SuperAdmin", "Admin"),AdminController.warnedAccountList);
adminRouter.get("/restrictedAccountList",AuthVerifyMiddlware,permissionCheck("SuperAdmin", "Admin"),AdminController.restrictedAccountList);
adminRouter.get("/withdrawRestrictions",AuthVerifyMiddlware,permissionCheck("SuperAdmin", "Admin"),AdminController.withdrawRestrictions);


adminRouter.post("/createBrand",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),BrandController.createBrand);
adminRouter.post("/updateBrand",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),BrandController.updateBrand);
adminRouter.get("/deleteBrand",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),BrandController.deleteBrand);

adminRouter.post("/createCategory",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),CategoryController.createCategory);
adminRouter.post("/updateCategory",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),CategoryController.updateCategory);
adminRouter.get("/deleteCategory",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),CategoryController.deleteCategory);

adminRouter.post("/createModel",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),ModelController.createModel);
adminRouter.post("/updateModel",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),ModelController.updateModel);
adminRouter.get("/deleteModel",AuthVerifyMiddlware,permissionCheck("SuperAdmin"),ModelController.deleteModel);


export default adminRouter;
