import UserModel from "../models/UserModel.js";

export const checkEmailVerification = async (req, res, next) => {
  const email = req.body.email;
  const user = await UserModel.findOne({ email: email }).select(
    "emailVerified"
  );

  if (!user) {
    return res.status(200).json({
      status: "fail",
      message: "No account associated with this email",
    });
  }

  if (!user.emailVerified) {
    //Call VerifyEmail API
    return res.status(200).json({
      status: "fail",
      message: "Email is not verified, redirect to OTP page",
    });
  }
  next();
};
