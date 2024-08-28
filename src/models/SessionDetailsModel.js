import mongoose from "mongoose";

const SessionDetailsSchema = mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    deviceName: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    location: {
      type: Object,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const SessionDetailsModel = mongoose.model(
  "sessiondetails",
  SessionDetailsSchema
);

export default SessionDetailsModel;
