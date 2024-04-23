import express from "express";
import * as PostController from "../controllers/PostController.js";
const userRouter = express.Router();

userRouter.post("/createPost", PostController.CreatePost);

export default userRouter;
