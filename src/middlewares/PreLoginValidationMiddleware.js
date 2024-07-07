import UserModel from "../models/UserModel.js";

export const preLoginValidation = async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await UserModel.findOne({ email: email })
      .select("email emailVerified loginAttempt limitedLogin accountStatus")
      .exec();

    if (!user) {
      return res.status(200).json({
        status: "fail",
        code: 3,
        message: "No account associated with this email",
      });
    }

    if (user.accountStatus === "Restricted") {
      return res.status(200).json({
        status: "fail",
        code: 5,
        message: "Your account has been restricted.",
      });
    }

    if (!user.emailVerified) {
      return res.status(200).json({
        status: "fail",
        code: 6,
        message: "Email is not verified, redirect to OTP page",
      });
    }

    // Check if limitedLogin time has passed and reset loginAttempt and limitedLogin
    if (user.limitedLogin && user.limitedLogin <= Date.now()) {
      user.loginAttempt = 0;
      user.limitedLogin = "";
      await user.save();
    }

    if (user.loginAttempt > 10) {
      // Check if limitedLogin time has passed
      if (user.limitedLogin && user.limitedLogin > Date.now()) {
        return res.status(200).json({
          status: "fail",
          code: 6,
          message:
            "Failed to log in, maximum login attempt exceeded. Try again later",
        });
      } else {
        // Set limitedLogin to current time + 10 minutes
        user.limitedLogin = Date.now() + 10 * 60 * 1000; // 10 minutes in milliseconds
        await user.save();
        return res.status(200).json({
          status: "fail",
          code: 6,
          message:
            "Failed to log in, maximum login attempt exceeded. Try again later",
        });
      }
    }

    next();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "fail", message: "Something went wrong" });
  }
};
