import AdminModel from "../models/AdminModel.js";

export function checkPermission(...permission) {
  return function (req, res, next) {
    const role = req.headers.role;
    const id = req.headers.id;

    if (permission.includes(role)) {
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
