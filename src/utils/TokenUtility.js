import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: `../../.env` });

export const generateAccessToken = (body) => {
  let payload = {
    exp:
      Math.floor(Date.now() / 1000) +
      parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION),
    id: body._id,
    role: body.role,
  };
  return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET);
};

export const generateRefreshToken = (body) => {
  let payload = {
    exp:
      Math.floor(Date.now() / 1000) +
      parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION),
    id: body._id,
    role: body.role,
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET);
};
