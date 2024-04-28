import UserModel from "../models/UserModel.js";

export const checkEmailVerification = async (req, res, next) => {
  const email = req.body.email;
  const user = await UserModel.findOne({ email: email }).select(
    "emailVerified"
  );

  if (!user.emailVerified) {
    return res.status(200).json({
      status: "fail",
      message: "Email is not verified, redirect to OTP page",
    });
  }
  next();
};
