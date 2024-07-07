import { removeUnusedLocalFile } from "../helper/RemoveUnusedFilesHelper.js";
import UserModel from "../models/UserModel.js";

export const PrePostValidation = async (req, res, next) => {
  const userID = req.headers.id || req.cookies.id;

  try {
    const user = await UserModel.findById(userID)
      .select("nidVerified accountStatus")
      .exec();

    if (!user) {
      return res.status(200).json({
        status: "fail",
        code: 3,
        message: "No account associated with this email",
      });
    }

    if (!user.nidVerified) {
      if (req.files) {
        for (const file of req.files) {
          removeUnusedLocalFile(file.path);
        }
      }
      return res.status(200).json({
        status: "fail",
        code: 9,
        message: "Nid is not verified, You can not post any ad",
      });
    }

    if (user.accountStatus !== "Validate") {
      if (req.files) {
        for (const file of req.files) {
          removeUnusedLocalFile(file.path);
        }
      }
      return res.status(200).json({
        status: "fail",
        code: 8,
        message: "Your account status is not validate, You can not post.",
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
