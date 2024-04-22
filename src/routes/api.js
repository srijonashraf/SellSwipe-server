import express from "express";
import * as PostController from "../controllers/PostController.js";
const router = express.Router();

router.post("/createPost", PostController.CreatePost);

export default router;
