import AdminModel from "./../models/AdminModel.js";
import SessionDetailsModel from "./../models/SessionDetailsModel.js";
import UserModel from "./../models/UserModel.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "./../helper/TokenGeneratorHelper.js";
export const adminLoginService = async (req) => {
  try {
    let reqBody = req.body;
    const data = await AdminModel.findOne(reqBody);
    if (!data) {
      return { status: "fail", message: "No user found" };
    } else {
      const packet = { _id: data._id, role: data.role };
      const accessTokenResponse = generateAccessToken(packet);
      const refreshTokenResponse = generateRefreshToken(packet);

      //!!Free limit 45 Fire in a minute, if anything goes wrong check here.
      const fetchResponse = await fetch(`http://ip-api.com/json/${req.ip}`);
      const location = await fetchResponse.json();

      //Set session details to DB
      const sessionBody = {
        deviceName: req.headers["user-agent"],
        lastLogin: new Date().toISOString(),
        accessToken: accessTokenResponse,
        refreshToken: refreshTokenResponse,
        location: location,
        ipAddress: req.ip,
      };

      const session = await SessionDetailsModel.create(sessionBody);

      //Set the sessionId to the AdminModel
      data.sessionId.push(session._id);
      await data.save();

      if (accessTokenResponse && refreshTokenResponse && session) {
        return {
          status: "success",
          id: data._id,
          email: data.email,
          name: data.name,
          accessToken: accessTokenResponse,
          refreshToken: refreshTokenResponse,
        };
      } else {
        return { status: "fail", message: "Failed to create session details" };
      }
    }
  } catch (error) {
    console.error(error);
    return { status: "fail", message: "Something went wrong", data: error };
  }
};

export const addNewAdminService = async (req) => {
  try {
    let reqBody = req.body;
    const data = await AdminModel.create(reqBody);
    if (!data) {
      return { status: "fail", message: "Failed to add new admin" };
    }
    //Added superAdmin info in the ref
    data.ref = { name: req.headers.name, id: req.headers.id };
    await data.save();
    return { status: "success", data: data };
  } catch (error) {
    console.log(error);
    return { status: "fail", message: "Something went wrong", data: error };
  }
};

export const deleteAdminService = async (req) => {
  try {
    let id = req.query.id;
    const data = await AdminModel.deleteOne({ _id: id });
    if (!data) {
      return { status: "fail", message: "Failed to delete admin" };
    }
    return { status: "success", data: data };
  } catch (error) {
    console.log(error);
    return { status: "fail", message: "Something went wrong", data: error };
  }
};

export const adminListService = async (req) => {
  try {
    const data = await AdminModel.find({ role: "Admin" });
    if (!data) {
      return { status: "fail", message: "Failed to load admin list" };
    }
    return { status: "success", data: data };
  } catch (error) {
    console.log(error);
    return { status: "fail", message: "Something went wrong", data: error };
  }
};

export const userListService = async (req) => {
  try {
    const data = await UserModel.find({ role: "User" });
    if (!data) {
      return { status: "fail", message: "Failed to load user list" };
    }
    return { status: "success", data: data };
  } catch (error) {
    console.log(error);
    return { status: "fail", message: "Something went wrong", data: error };
  }
};

export const warnedAccountListService = async (req) => {
  try {
    const data = await UserModel.find({ accountStatus: "Warning" });
    if (!data) {
      return { status: "fail", message: "Failed to load warning account list" };
    }
    return { status: "success", data: data };
  } catch (error) {
    console.log(error);
    return { status: "fail", message: "Something went wrong", data: error };
  }
};

export const restrictedAccountListService = async (req) => {
  try {
    const data = await UserModel.find({ accountStatus: "Restricted" });
    if (!data) {
      return {
        status: "fail",
        message: "Failed to load restricted account list",
      };
    }
    return { status: "success", data: data };
  } catch (error) {
    console.log(error);
    return { status: "fail", message: "Something went wrong", data: error };
  }
};

export const withdrawRestrictionsService = async (req) => {
  try {
    let id = req.query.id;
    const data = await UserModel.findOneAndUpdate(
      { _id: id },
      { $set: { accountStatus: "Validate" } },
      { new: true }
    );
    if (!data) {
      return { status: "fail", message: "Failed to withdraw restriction" };
    }
    return { status: "success", data: data };
  } catch (error) {
    console.log(error);
    return { status: "fail", message: "Something went wrong", data: error };
  }
};
