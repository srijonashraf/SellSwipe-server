import mongoose from "mongoose";

const AdminSchema = mongoose.Schema(
  {
    email: {
      type: String,
    },
    name: {
      type: String,
    },
    password: {
      type: String,
    },
    role: {
      type: String, //Admin/SuperAdmin
    },
    ref: {
      type: String, //Appointed By
    },
    approvedPosts: {
      type: [String],
    },
    declinedPosts: {
      type: [String],
    },
    warnedAccounts: {
      type: [String],
    },
    restrictedAccounts: {
      type: [String],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const AdminModel = mongoose.model("admins", AdminSchema);

export default AdminModel;
