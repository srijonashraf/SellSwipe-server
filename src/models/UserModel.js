import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    email: {
      type: String,
    },
    name: {
      type: String,
    },
    role: {
      type: String,
      default: "User",
    },
    photo: {
      type: String,
    },
    password: {
      type: String,
    },
    nidNumber: {
      type: Number,
    },
    nidFront: {
      type: String,
    },
    nidBack: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    nidVerified: {
      type: Boolean,
    },
    phoneVerified: {
      type: String,
    },
    accountStatus: {
      type: String,
    },
    warningCount: {
      type: Number,
    },
    lastLogin: {
      type: String,
    },
    lastRefresh: {
      type: String,
    },
    sessionId: {
      type: [mongoose.Schema.Types.ObjectId],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const UserModel = mongoose.model("users", UserSchema);

export default UserModel;
