import { errorCodes } from "../constants/ErrorCodes.js";
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
        code: errorCodes.NOT_FOUND.code,
        message: errorCodes.NOT_FOUND.message,
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
        code: errorCodes.NID_NOT_VERIFIED.code,
        message: errorCodes.NID_NOT_VERIFIED.message,
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
        code: errorCodes.ACCOUNT_IS_NOT_VAlID.code,
        message: errorCodes.ACCOUNT_IS_NOT_VAlID.message,
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
