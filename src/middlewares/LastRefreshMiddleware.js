import UserModel from "./../models/UserModel.js";
import { v4 as uuidv4 } from "uuid";
export const trackRefresh = async (req, res, next) => {
  const currentTime = new Date().toISOString();
  const guestId = req.cookies.guestId || uuidv4();
  res.cookie("guestId", guestId, { maxAge: 900000, httpOnly: true }); // Max age set to 15 minutes (900,000 milliseconds)
  res.cookie("lastRefresh", currentTime, { maxAge: 900000, httpOnly: true }); // Max age set to 15 minutes (900,000 milliseconds)

  //Send refresh log to database if user is logged in
  let id = req.cookies.id;
  if (id) {
    const response = await UserModel.updateOne(
      { _id: id },
      { lastRefresh: currentTime },
      { new: true }
    );
  }
  next();
};
