import AdminModel from "../models/AdminModel.js";
import UserModel from "../models/UserModel.js";

export function adminAuthentication(...roles) {
  return function (req, res, next) {
    const role = req.headers.role;
    const id = req.headers.id;

    if (roles.includes(role)) {
      AdminModel.findOne({ _id: id, role: role })
        .then((admin) => {
          if (admin) {
            next();
          } else {
            res.status(200).json({
              status: "fail",
              message: "No account found with the id and role",
            });
          }
        })
        .catch((error) => {
          console.log(error);
          res
            .status(500)
            .json({ status: "error", message: "Something went wrong" });
        });
    } else {
      res.status(403).json({ status: "fail", message: "Permission denied" });
    }
  };
}

export const userAuthentication = async (req, res, next) => {
  try {
    const { id } = req.headers;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "User ID is required in the headers",
      });
    }

    const user = await UserModel.findById(id).exec();

    if (!user) {
      return res.status(403).json({
        status: "fail",
        message: "Permission denied or user account not found",
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "fail",
      message: "Something went wrong",
    });
  }
};
