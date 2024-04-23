import mongoose from "mongoose";

const SessionDetailsSchema = mongoose.Schema(
  {
    deviceName: {
      type: String,
    },
    lastLogin: {
      type: String,
    },
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
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
