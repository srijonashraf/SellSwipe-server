import UserModel from "../models/UserModel.js";

export const checkNidVerification = async (req, res, next) => {
  const userID = req.headers.id;
  const user = await UserModel.findOne({ _id: userID }).select("nidVerified");
  if (!user.nidVerified) {
    return res.status(200).json({
      status: "fail",
      message: "Nid is not verified, You can not post any ad",
    });
  }
  next();
};
