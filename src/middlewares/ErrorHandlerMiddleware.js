import { errorCodes } from "../constants/ErrorCodes.js";

export const errorHandler = async (err, req, res, next) => {
  const statusCode = err.statusCode || errorCodes.INTERNAL_SERVER_ERROR.code;
  const message = err.message || errorCodes.INTERNAL_SERVER_ERROR.message;
  const details = typeof err.details === "object" ? err.details : {};

  return res.status(200).json({
    status: "fail",
    code: err.statusCode,
    message,
    ...details,
  });
};
