import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import { trackRefresh } from "./src/middlewares/LastRefreshMiddleware.js";
import adminRouter from "./src/routes/admin.api.js";
import userRouter from "./src/routes/user.api.js";
import router from "./src/routes/public.api.js";
import { errorHandler } from "./src/middlewares/ErrorHandlerMiddleware.js";

dotenv.config();
const app = new express();
app.disable("x-powered-by");

//Applying Middlewares
app.use(cookieParser());
app.use(trackRefresh);
app.use(express.json({ limit: process.env.MAX_JSON_SIZE }));
app.use(express.urlencoded({ limit: process.env.MAX_URL_ENCODED_SIZE }));

app.use(
  rateLimit({
    windowMs: process.env.REQ_LIMIT_TIME,
    limit: process.env.REQ_LIMIT_NUMBER,
  })
);
app.use(cors());
app.use(helmet());
app.use(hpp());
app.use(mongoSanitize());

//Connect DB
mongoose
  .connect(process.env.MONGO_URI, { autoIndex: true })
  .then(() => {
    console.log("DB Connected!");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", function (req, res) {
  res.send("Hello from SellSwipe");
});

app.use("/user/api/v1/", userRouter); //User Router
app.use("/admin/api/v1/", adminRouter); //Admin Router
app.use("/api/v1/", router); //Public Router

app.use(errorHandler);

export default app;
