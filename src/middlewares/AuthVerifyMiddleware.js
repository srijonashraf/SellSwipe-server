import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "../models/UserModel.js";
import AdminModel from "../models/AdminModel.js";
import SessionDetailsModel from "../models/SessionDetailsModel.js";
dotenv.config({ path: "../../.env" });

export default async (req, res, next) => {
  try {
    const token = req.headers.accessToken || req.cookies.accessToken;
    const refreshToken = req.headers.refreshToken || req.cookies.refreshToken;

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

        const { id, role } = decoded;

        // Fetch user or admin details based on the role
        const user =
          role === "User"
            ? await UserModel.findOne({ _id: id }).select("_id name email role")
            : await AdminModel.findOne({ _id: id }).select(
                "_id name email role"
              );

        if (!user) {
          return res
            .status(401)
            .json({ status: "fail", message: "Invalid Access Token" });
        }

        // Check if a session exists for the user/admin with the provided tokens
        const session = await SessionDetailsModel.findOne({
          userID: id,
          accessToken: token,
          refreshToken: refreshToken,
        }).select("_id");

        if (!session) {
          return res.status(401).json({
            status: "fail",
            message: "Invalid or expired Access Token",
          });
        }

        // Attach user details to request headers
        req.headers.id = user._id;
        req.headers.role = user.role;
        req.headers.name = user.name;

        // Set cookies for client
        const cookieOption = {
          maxAge: Math.floor(Date.now() / 1000) + 6 * 24 * 60 * 60,
          httpOnly: true,
        };
        res.cookie("id", user._id, cookieOption);
        res.cookie("name", user.name, cookieOption);

        next();
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "fail",
      message: "Something went wrong",
    });
  }
};
