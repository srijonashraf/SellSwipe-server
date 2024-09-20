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
import adminRouter from "./src/routes/AdminApi.js";
import publicRouter from "./src/routes/PublicApi.js";
import userRouter from "./src/routes/UserApi.js";
import sharedRouter from "./src/routes/SharedApi.js";
import useragent from "express-useragent";
import { errorHandler } from "./src/middlewares/ErrorHandlerMiddleware.js";

dotenv.config();
const app = new express();
app.disable("x-powered-by");
app.use(cookieParser());
app.use(trackRefresh);
app.use(express.json({ limit: process.env.MAX_JSON_SIZE }));
app.use(
  express.urlencoded({
    limit: process.env.MAX_URL_ENCODED_SIZE,
    extended: false,
  })
);
app.use(useragent.express());

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

//Connect to DB
mongoose
  .connect(process.env.MONGO_URI, { autoIndex: true })
  .then(() => {
    console.log("DB Connected!");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", function (req, res) {
  res.send(
    '<h1 style="display: flex; align-items: center; justify-content: center; margin-top:50px">Hello from SellSwipe</h1>'
  );
});

app.use("/api/v1/", publicRouter); //Public Router
app.use("/api/v1/user", userRouter); // Protected Router
app.use("/api/v1/admin", adminRouter); //Admin Router
app.use("/api/v1/shared", sharedRouter); //Admin Router

app.use("*", (req, res) => {
  res.status(404).send({
    status: "fail",
    message: `Requested path ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

export default app;
