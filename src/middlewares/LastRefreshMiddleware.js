import { currentTime } from "../constants/CurrectTime.js";
import UserModel from "./../models/UserModel.js";
import { v4 as uuidv4 } from "uuid";

export const trackRefresh = async (req, res, next) => {
  const guestId = req.cookies.guestId || uuidv4();

  // Set cookies with a max age of 15 minutes (900000 ms)
  res.cookie("guestId", guestId, { maxAge: 900000, httpOnly: true });
  res.cookie("lastRefresh", currentTime(), { maxAge: 900000, httpOnly: true });

  const userId = req.cookies.id || req.headers.id;
  if (userId) {
    try {
      await UserModel.updateOne(
        { _id: userId },
        { $set: { lastRefresh: currentTime() } }
      );
    } catch (error) {
      console.error("Error updating user last refresh time:", error);
    }
  }
  next();
};
