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
import protectedRouter from "./src/routes/protected.api.js";
import publicRouter from "./src/routes/public.api.js";
import useragent from "express-useragent";

dotenv.config();
const app = new express();
app.disable("x-powered-by");

//Applying Middlewares
app.use(cookieParser());
app.use(trackRefresh);
app.use(express.json({ limit: process.env.MAX_JSON_SIZE }));
app.use(express.urlencoded({ limit: process.env.MAX_URL_ENCODED_SIZE }));
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

//Connect DB
mongoose
  .connect(process.env.MONGO_URI, { autoIndex: true })
  .then(() => {
    console.log("DB Connected!");
  })
  .catch((err) => {
    console.log(err);
  });

// app.get('/', function (req, res) {
//   const userAgentResponse = req.useragent;
//   res.send(JSON.stringify(userAgentResponse, null, 2)); // Pretty print JSON
// });

app.get("/", function (req, res) {
  res.send(
    '<h1 style="display: flex; align-items: center; justify-content: center; margin-top:50px">Hello from SellSwipe</h1>'
  );
});

//Checking the client ip address
app.get("/test", function (req, res, next) {
  const userAgentResponse = req.useragent;
  const reqIp = req.ip;
  const reqHeader = req.headers["x-forwarded-for"];
  const reqConnection = req.connection.remoteAddress;
  console.log(req)
  console.log(reqIp, reqHeader, reqConnection);
  res.json({
    reqIp: reqIp,
    reqHeader: reqHeader,
    reqConnection: reqConnection,
  });
});

app.use("/api/v1/", publicRouter); //Public Router
app.use("/user/api/v1/", protectedRouter); // Protected Router
app.use("/admin/api/v1/", adminRouter); //Admin Router

export default app;
