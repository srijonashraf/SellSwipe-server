
export const trackRefresh = async (req, res, next) => {
  const currentTime = new Date().toISOString();
  //! Store the lastRefresh inside Usermodel
  res.cookie("lastRefresh", currentTime, { maxAge: 900000, httpOnly: true }); // Max age set to 15 minutes (900,000 milliseconds)

  next();
};