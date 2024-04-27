import mongoose from "mongoose";
import bcrypt from "bcrypt";

const AdminSchema = mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
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
      type: Object, //Appointed By
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
    sessionId: {
      type: [mongoose.Schema.Types.ObjectId],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

AdminSchema.methods.isPasswordCorrect = async function (password) {
  try {
    const response = await bcrypt.compare(password, this.password);
    return response;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const AdminModel = mongoose.model("admins", AdminSchema);

export default AdminModel;
