import mongoose from "mongoose";

const SessionDetailsSchema = mongoose.Schema(
  {
    deviceName: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: String,
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
