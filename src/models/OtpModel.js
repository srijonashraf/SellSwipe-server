import mongoose from "mongoose";

const OtpSchema = mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
    },
    otp: {
      type: Number,
    },
    token: {
      type: String,
    },
    initiated: {
      type: Number,
      default: Date.now,
    },
    expiresAt: {
      type: Number,
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

const OtpModel = mongoose.model("otps", OtpSchema);

export default OtpModel;
