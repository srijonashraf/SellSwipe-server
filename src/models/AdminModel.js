import mongoose from "mongoose";
import bcrypt from "bcrypt";

const AdminSchema = mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["Admin", "SuperAdmin"],
      default: "Admin",
      required: true,
    },
    ref: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
      },
      name: {
        type: String,
      },
    },
    approvedPosts: {
      type: [mongoose.Schema.Types.ObjectId],
    },
    declinedPosts: {
      type: [mongoose.Schema.Types.ObjectId],
    },
    warnedAccounts: {
      type: [mongoose.Schema.Types.ObjectId],
    },
    restrictedAccounts: {
      type: [mongoose.Schema.Types.ObjectId],
    },
    sessionId: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "sessiondetails",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // Skip hashing if password is not modified
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error("Error hashing password: ", error);
  }
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
