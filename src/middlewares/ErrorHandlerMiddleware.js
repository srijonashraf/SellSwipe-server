export const errorHandler = async (err, req, res, next) => {
  if (res.headersSent) {
    console.error("Error occurred after headers were sent:", err);
    return;
  }
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  console.log(err);
  return res.status(200).json({
    status: "fail",
    code: statusCode,
    message: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : {},
    err:err
  });
};
