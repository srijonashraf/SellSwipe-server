import express from "express";
import { listBrand } from "../controllers/BrandController.js";
import { listCategory } from "../controllers/CategoryContoller.js";
import { listModel } from "../controllers/ModelController.js";
const router = express.Router();

router.get("/listBrand", listBrand);
router.get("/listCategory", listCategory);
router.get("/listModel", listModel);

export default router;
