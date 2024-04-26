import mongoose from "mongoose";

const OtpSchema = mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    email: {
      type: String,
      lowercase: true,
    },
    otp: {
      type: String,
    },
    expired: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const OtpModel = mongoose.model("opts", OtpSchema);

export default OtpModel;
