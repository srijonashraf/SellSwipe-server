import mongoose from "mongoose";
import UserModel from "./../models/UserModel.js";
import {
  destroyOnCloudinary,
  uploadOnCloudinary,
} from "./../utility/Cloudinary.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../helper/TokenGeneratorHelper.js";
import SessionDetailsModel from "../models/SessionDetailsModel.js";
import OtpModel from "./../models/OtpModel.js";
import EmailSend from "../helper/EmailHelper.js";
import bcrypt from "bcrypt";
const ObjectID = mongoose.Types.ObjectId;

export const userRegistrationService = async (req) => {
  try {
    const reqBody = req.body;
    const userEmail = req.body.email;
    const existingUser = await UserModel.find({
      email: userEmail,
    }).count();
    if (!existingUser) {
      const response = await UserModel.create(reqBody);

      let EmailText = `
      <html>
      <body>
        <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
          <div style="margin: 50px auto; width: 70%; padding: 20px 0">
            <div style="border-bottom: 1px solid #eee">
              <a href="" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600">SellSwipe</a>
            </div>
            <p style="font-size: 1.1em">Hi,</p>
            <p>Hey, ${reqBody.name}, Welcome to SellSwipe. Your account has been successfully created. You will soon receive an additional email to verify your email address.</p>
            <p style="font-size: 0.9em;">Regards,<br />SellSwipe</p>
            <hr style="border: none; border-top: 1px solid #eee" />
            <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
              <p>SellSwipe Team</p>
              <p>Dhanmondi, Dhaka</p>
              <p>Bangladesh</p>
            </div>
          </div>
        </div>
        </body>
        </html>
      `;

      let EmailSubject = "Welcome to SellSwipe";

      await EmailSend(userEmail, EmailText, EmailSubject);
      await userEmailVerifyService(req);
      return { status: "success", data: response };
    }
    return { status: "fail", message: "This account already exist" };
  } catch (error) {
    console.log(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const userLoginService = async (req) => {
  try {
    const reqBody = req.body;
    const user = await UserModel.findOne({
      email: reqBody.email,
    }).exec();
    if (!user)
      return {
        status: "fail",
        message: "No account associated with this email",
      };

    if (user.accountStatus === "Restricted") {
      return {
        status: "fail",
        message: "Login Failed, Your account is Restricted",
      };
    }
    const isCorrectPassword = await user.isPasswordCorrect(reqBody.password);
    if (!isCorrectPassword) {
      user.loginAttempt += 1;
      await user.save();
      return {
        status: "fail",
        message: "Wrong credential",
      };
    }
    const packet = { _id: user._id, role: user.role };
    const accessTokenResponse = generateAccessToken(packet);
    const refreshTokenResponse = generateRefreshToken(packet);

    // //!!Free limit 45 Fire in a minute, if anything goes wrong check here.
    // Fetch location details based on IP address
    let location;
    try {
      const fetchResponse = await fetch(`http://ip-api.com/json/${req.ip}`);
      location = await fetchResponse.json();
      // console.log(location)
    } catch (fetchError) {
      console.error("Error fetching location:", fetchError);
      // Handle fetch error, maybe fallback to default location or log the error
      location = { error: "Unable to fetch location" };
    }
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

    if (user.sessionId && Array.isArray(user.sessionId)) {
      user.sessionId.push(session._id);
      user.lastLogin = new Date().toISOString();
      user.loginAttempt = 0;
      user.limitedLogin = "";
      await user.save();
    } else {
      console.error(
        "User sessionId is not defined or is not an array:",
        user.sessionId
      );
    }

    // Set the sessionId to the UserModel
    if (accessTokenResponse && refreshTokenResponse && session && user) {
      return {
        status: "success",
        id: user._id,
        email: user.email,
        name: user.name,
        accessToken: accessTokenResponse,
        refreshToken: refreshTokenResponse,
      };
    }
    return { status: "fail", message: "Failed to login" };
  } catch (error) {
    console.log(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const userAvatarUpdateService = async (req) => {
  try {
    let userID = new ObjectID(req.headers.id);
    const filePath = req.file.path; //For single file
    if (!filePath) {
      throw new Error("No files uploaded.");
    }

    //Upload on cloudinary
    const userAvatar = await uploadOnCloudinary(filePath);
    const response = await UserModel.findOne({ _id: userID }).exec();
    //At first delete the avatar if any
    if (response.avatar.pid) {
      await destroyOnCloudinary(response.avatar.pid);
    }

    response.avatar = {
      url: userAvatar.secure_url,
      pid: userAvatar.public_id,
    };

    await response.save();

    if (!response) {
      return { status: "fail", message: "Failed to update profile photo" };
    }
    return { status: "success", cloudinary: userAvatar, data: response };
  } catch (error) {
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const userNidUpdateRequestService = async (req) => {
  try {
    let userID = new ObjectID(req.headers.id);
    const filePaths = req.files;
    if (!filePaths) {
      throw new Error("No files uploaded.");
    }
    const { nidFront, nidBack } = filePaths;

    if (!nidFront || !nidBack) {
      throw new Error("File missing.");
    }

    //Todo: User can select any images of NID and can delete that 
    //Upload on Cloudinary
    const nidFrontResponse = await uploadOnCloudinary(nidFront[0].path);
    const nidBackResponse = await uploadOnCloudinary(nidBack[0].path);

    const user = await UserModel.findOne({ _id: userID }).exec();

    if (!user) {
      return { status: "fail", message: "User not found." };
    }

    //Delete Existing File
    if (user.nidFront && user.nidFront.pid) {
      await destroyOnCloudinary(user.nidFront.pid);
    }
    if (user.nidBack && user.nidBack.pid) {
      await destroyOnCloudinary(user.nidBack.pid);
    }

    //Save new file links
    user.nidFront = {
      url: nidFrontResponse.secure_url,
      pid: nidFrontResponse.public_id,
    };

    user.nidBack = {
      url: nidBackResponse.secure_url,
      pid: nidBackResponse.public_id,
    };

    user.nidSubmitted = true;

    await user.save();

    return { status: "success", data: user };
  } catch (error) {
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const userProfileUpdateService = async (req) => {
  try {
    let id = req.headers.id;
    let role = req.headers.role;

    const response = await UserModel.findOneAndUpdate(
      { _id: id, role: role },
      { $set: req.body },
      { new: true }
    ).select("-password");

    if (!response) {
      return { status: "fail", message: "Failed to update profile details" };
    }
    return {
      status: "success",
      message: "Profile details updated",
      data: response,
    };
  } catch (error) {
    console.log(error);
    return { status: "fail", message: "Something went wrong" };
  }
};
export const userProfileDetailsService = async (req) => {
  try {
    let userID = new ObjectID(req.headers.id);
    const user = await UserModel.findOne({ _id: userID }).select(
      "-password -sessionId -phoneVerified -nidVerified -emailVerified -accountStatus -warningCount"
    );
    if (!user) {
      return { status: "fail", message: "Failed to load user profile" };
    }
    return { status: "success", data: user };
  } catch (error) {
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

//!Redirect to email verification from frontend, without verifying email user will not be able to login.

export const userEmailVerifyService = async (req) => {
  try {
    let userEmail = req.query.email || req.body.email;
    let otp = Math.floor(100000 + Math.random() * 900000);
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      return { status: "fail", message: "No registered user found" };
    }

    const response = await OtpModel.create({
      userID: user._id,
      email: userEmail,
      otp: otp,
    });

    let EmailText = `
    <html>
    <body>
      <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
        <div style="margin: 50px auto; width: 70%; padding: 20px 0">
          <div style="border-bottom: 1px solid #eee">
            <a href="" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600">SellSwipe</a>
          </div>
          <p style="font-size: 1.1em">Hi,</p>
          <p>Thank you for choosing SellSwipe. Use the following OTP to verify your email address. OTP is valid for 3 minutes.</p>
          <h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${otp}</h2>
          <p style="font-size: 0.9em;">Regards,<br />SellSwipe</p>
          <hr style="border: none; border-top: 1px solid #eee" />
          <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
            <p>SellSwipe Team</p>
            <p>Dhanmondi, Dhaka</p>
            <p>Bangladesh</p>
          </div>
        </div>
      </div>
      </body>
      </html>
    `;

    let EmailSubject = "SellSwipe - Email Verification";

    await EmailSend(userEmail, EmailText, EmailSubject);

    return { status: "success", message: "6 digit OTP is sent successfully" };
  } catch (error) {
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const OTPVerifyService = async (req) => {
  try {
    let otp = req.query.otp;
    let email = req.query.email;
    const otpResponse = await OtpModel.findOne({
      otp: otp,
      email: email,
    });

    if (!otpResponse) {
      return { status: "fail", message: "OTP in invalid or expired" };
    }

    const currentTime = new Date();
    const createdAt = new Date(otpResponse.createdAt);
    const timeDifference = currentTime - createdAt;

    // 3 minutes in milliseconds; the expiration time of OTP
    const expirationTime = 3 * 60 * 1000;

    if (timeDifference > expirationTime) {
      otpResponse.expired = true;
      await otpResponse.save();
      return { status: "fail", message: "OTP has expired" };
    }

    otpResponse.otp = 0;
    await otpResponse.save();

    await UserModel.updateOne(
      { email: otpResponse.email },
      { emailVerified: true },
      { new: true }
    );
    return { status: "success", message: "OTP verified successfully" };
  } catch (error) {
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const recoverResetPasswordService = async (req, res) => {
  try {
    //!Apply URL based password recovery, user will receive a url basically domain/api/path/token and then they will send a GET requets and backend will verify using token
    let email = req.body.email;
    let otp = req.body.otp;
    let newPassword = req.body.newPassword;
    let confirmPassword = req.body.confirmPassword;

    if (newPassword !== confirmPassword) {
      return {
        status: "fail",
        message: "Password didn't matched, Password reset failed",
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    let response = await OtpModel.findOne({
      email: email,
      otp: otp,
    });

    if (!response) {
      return { status: "fail", message: "Password reset failed" };
    }

    let setPasswordResponse = await UserModel.findOneAndUpdate(
      { email: email },
      { $set: { password: hashedPassword } },
      {
        new: true,
      }
    );

    if (!setPasswordResponse) {
      return { status: "fail", message: "Password reset failed" };
    }
    response.otp = 0;
    await response.save();
    return { status: "success", message: "Password reset successfully" };
  } catch (error) {
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const userAllSessionService = async (req, res) => {
  try {
    let userID = new ObjectID(req.headers.id);
    const user = await UserModel.findOne({ _id: userID }).populate(
      "sessionId",
      "-accessToken -refreshToken -ipAddress -createdAt -updatedAt"
    );

    if (!user) {
      return { status: "fail", message: "User not found" };
    }

    return { status: "success", data: user.sessionId };
  } catch (error) {
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};

export const userLogoutFromSessionService = async (req, res) => {
  try {
    //TODO Add a middleware in app.js to check the cookies token with db token everytime, suppose any user just deleted a session so the token will be deleted from db but still stay on the client side this middlware will catch the issue and generate a error of Session Expired
    //!Note: AuthMiddleware already doing his job matching the session details with User Model. So we will add the above mentioned middlware later for more better and faster session inspect experience
    let sessionID = req.query.sessionId;
    const matchSessionWithUser = await UserModel.findOne({
      _id: req.headers.id,
      sessionId: sessionID,
    }).select("sessionId");

    if (!matchSessionWithUser) {
      return {
        status: "fail",
        message:
          "Failed to Logout from the Session. SessionID not found in User Model",
      };
    }

    const response = await SessionDetailsModel.deleteOne({ _id: sessionID });

    if (!response.deletedCount) {
      return { status: "fail", message: "Failed to Logout from Session" };
    }
    return { status: "success", message: "Logged out from the Session" };
  } catch (error) {
    console.error(error);
    return { status: "fail", message: "Something went wrong" };
  }
};
