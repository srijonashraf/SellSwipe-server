import UserModel from "../models/UserModel.js";

export const checkLoginAttempts = async (req, res, next) => {
  const email = req.body.email;
  const user = await UserModel.findOne({ email: email }).select(
    "email loginAttempt limitedLogin"
  );

  if (!user) {
    return res.status(200).json({
      status: "fail",
      message: "No account associated with this email",
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
        message:
          "Failed to log in, maximum login attempt exceeded. Try again later",
      });
    } else {
      // Set limitedLogin to current time + 10 minutes
      user.limitedLogin = Date.now() + 10 * 60 * 1000; // 10 minutes in milliseconds
      await user.save();
      return res.status(200).json({
        status: "fail",
        message:
          "Failed to log in, maximum login attempt exceeded. Try again later",
      });
    }
  }

  next();
};
