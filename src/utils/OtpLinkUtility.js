import dotenv from "dotenv";
import OtpModel from "../models/OtpModel.js";
import { baseUrl } from "../constants/BaseUrl.js";
import jwt from "jsonwebtoken";
import { currentTime } from "../constants/CurrectTime.js";
import { emailTypes } from "../constants/emailTypes.js";
import { verificationTypes } from "../constants/verificationTypes.js";
dotenv.config();
export const otpLinkUtility = async (req, email, userId, emailType) => {
  let otp = Math.floor(100000 + Math.random() * 900000);
  let token = jwt.sign({ email }, process.env.JWT_GENERAL_TOKEN_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRE_TIME,
  });

  let link;

  switch (emailType) {
    case emailTypes.EMAIL_VERIFICATION:
      link = `${baseUrl(
        req
      )}/auth/verify/email?userId=${userId}&token=${token}&method=${
        verificationTypes.LINK_VERIFICATION
      }`;
      break;

    case emailTypes.RESET_PASSWORD:
      link = `${baseUrl(
        req
      )}/auth/verify/token?userId=${userId}&token=${token}&method=${
        verificationTypes.LINK_VERIFICATION
      }`;
      break;

    default:
      throw new Error("Invalid email type");
  }

  await OtpModel.create({
    userID: userId,
    email: email,
    otp: otp,
    token: token,
    initiated: currentTime,
    expiresAt: currentTime + parseInt(process.env.OTP_EXPIRE_TIME),
    expired: false,
  });

  return { otp, link };
};
