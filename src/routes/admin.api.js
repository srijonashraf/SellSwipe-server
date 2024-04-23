import express from "express";
import * as AdminController from "../controllers/AdminController.js";
const adminRouter = express.Router();

adminRouter.post("/login", AdminController.AdminLogin);

export default adminRouter;
