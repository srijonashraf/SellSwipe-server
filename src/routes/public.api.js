import express from "express";
import { listBrand } from "../controllers/BrandController.js";
import { listCategory } from "../controllers/CategoryContoller.js";
import { listModel } from "../controllers/ModelController.js";
import {
  listArea,
  listDistrict,
  listDivision,
} from "../controllers/LocationController.js";
const router = express.Router();

router.get("/listBrand", listBrand);
router.get("/listCategory", listCategory);
router.get("/listModel", listModel);
router.get("/listDivision", listDivision);
router.get("/listDistrict", listDistrict);
router.get("/listArea", listArea);

export default router;
