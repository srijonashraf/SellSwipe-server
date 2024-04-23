import express from "express";
import { listBrand } from "../controllers/BrandController.js";
import { listCategory } from "../controllers/CategoryContoller.js";
const router = express.Router();

router.get("/listBrand", listBrand);
router.get("/listCategory", listCategory);

export default router;
