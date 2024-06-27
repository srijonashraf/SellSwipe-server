import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "../models/UserModel.js";
import AdminModel from "../models/AdminModel.js";
import SessionDetailsModel from "../models/SessionDetailsModel.js";
dotenv.config({ path: "../../.env" });

export default async (req, res, next) => {
  try {
    let token = req.headers.accessToken || req.cookies.accessToken;
    let refreshToken = req.headers.refreshToken || req.cookies.refreshToken;

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

        if (role === "User") {
          const response = await UserModel.findOne({ _id: id }).select(
            "_id name email role sessionId"
          );
          if (!response) {
            return res.status(401).json({ status: "fail", message:"Invalid Access Token" });
          }

          /*Check if the accessToken matches with sessionDetails' accessToken
          and sessionId match with the user's sessionId in database*/

          const extractSessionToken = await SessionDetailsModel.findOne({
            accessToken: token,
            refreshToken: refreshToken,
            _id: { $in: response.sessionId }, //Check if the session details id exist in the user's sessionId array
          }).select("_id");

          if (!extractSessionToken) {
            return res.status(401).json({
              status: "fail",
              message: "Invalid or expired Access Token",
            });
          }

          req.headers.id = response._id;
          req.headers.role = response.role;
          req.headers.name = response.name;

          let cookieOption = {
            maxAge: Math.floor(Date.now() / 1000) + 6 * 24 * 60 * 60,
            httpOnly: true,
          };
          res.cookie("id", response._id, cookieOption);
          res.cookie("name", response.name, cookieOption);
        } else {
          const response = await AdminModel.findOne({ _id: id }).select(
            "_id name email role sessionId"
          );
          if (!response) {
            return res.status(401).json({ status: "fail", message:"Invalid Access Token" });
          }

          /*Check if the accessToken matches with sessionDetails' accessToken
            and sessionId match with the admin's sessionId in database*/

          const extractSessionToken = await SessionDetailsModel.findOne({
            accessToken: token,
            refreshToken: refreshToken,
            _id: { $in: response.sessionId }, //Check if the session details id exist in the admin's sessionId array
          }).select("_id");

          if (!extractSessionToken) {
            return res.status(401).json({
              status: "fail",
              message: "Invalid or expired Access Token",
            });
          }

          req.headers.id = response._id;
          req.headers.role = response.role;
          req.headers.name = response.name;

          let cookieOption = {
            maxAge: Math.floor(Date.now() / 1000) + 6 * 24 * 60 * 60,
            httpOnly: true,
          };

          res.cookie("id", response._id, cookieOption);
          res.cookie("name", response.name, cookieOption);
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
