import mongoose from "mongoose";

const OtpSchema = mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    email: {
      type: String,
    },
    otp: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const OtpModel = mongoose.model("opts", OtpSchema);

export default OtpModel;
