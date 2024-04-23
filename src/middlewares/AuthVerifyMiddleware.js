import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "../models/UserModel.js";
import AdminModel from "../models/AdminModel.js";
import { trackRefresh } from "./LastRefreshMiddleware.js";
dotenv.config({ path: "../../.env" });

export default async (req, res, next) => {
  try {
    let token = req.headers.accessToken || req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized Request, Token not found.",
      });
    }
    jwt.verify(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET,
      async (error, decoded) => {
        if (error) {
          return res.status(401).json({
            status: "fail",
            message: "Unauthorized, Token expired or broken.",
          });
        }

        let id = decoded["id"];
        let role = decoded["role"];

        if (role === "user") {
          const response = await UserModel.findOne({ _id: id }).select(
            "_id name email role"
          );
          if (!response) {
            return res.status(401).json({ status: "Invalid Access Token" });
          }
          req.headers.id = response._id;
          req.headers.role = response.role;
          req.headers.name = response.name;
        } else {
          const response = await AdminModel.findOne({ _id: id }).select(
            "_id name email role"
          );
          if (!response) {
            return res.status(401).json({ status: "Invalid Access Token" });
          }
          req.headers.id = response._id;
          req.headers.role = response.role;
          req.headers.name = response.name;
        }

        next();
      }
    );
  } catch (error) {
    return res
      .status(500)
      .json({ status: "fail", message: "Something went wrong" });
  }
};
