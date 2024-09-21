import { currentTime } from "../constants/CurrectTime.js";
import { errorCodes } from "../constants/ErrorCodes.js";
import UserModel from "../models/UserModel.js";

export const preLoginValidation = async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await UserModel.findOne({ email: email })
      .select("email emailVerified loginAttempt loginFreezeUntil accountStatus")
      .exec();

    if (!user) {
      return res.status(200).json({
        status: "fail",
        code: errorCodes.NOT_FOUND.code,
        message: errorCodes.NOT_FOUND.message,
      });
    }

    if (user.accountStatus === "Restricted") {
      return res.status(200).json({
        status: "fail",
        code: errorCodes.ACCOUNT_RESTRICTED_ERROR.code,
        message: errorCodes.ACCOUNT_RESTRICTED_ERROR.message,
      });
    }

    if (!user.emailVerified) {
      return res.status(200).json({
        status: "fail",
        code: errorCodes.EMAIL_NOT_VERIFIED.code,
        message: errorCodes.EMAIL_NOT_VERIFIED.message,
      });
    }

    // Reset login attempts if freeze time has passed
    if (user.loginFreezeUntil && user.loginFreezeUntil <= currentTime()) {
      user.loginAttempt = 0;
      user.loginFreezeUntil = null;
      await user.save();
    }

    if (user.loginAttempt >= 10) {
      if (!user.loginFreezeUntil) {
        user.loginFreezeUntil = currentTime() + 10 * 60 * 1000;
        await user.save();
      }

      return res.status(429).json({
        status: "fail",
        code: errorCodes.MAXIMUM_LOGIN_EXCEEDED.code,
        message: errorCodes.MAXIMUM_LOGIN_EXCEEDED.message,
      });
    }

    next();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "fail", message: "Something went wrong" });
  }
};
