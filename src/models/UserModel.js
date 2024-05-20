import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      immutable: true, // Can't be changed
    },
    name: {
      type: String,
    },
    role: {
      type: String,
      default: "User",
    },
    avatar: {
      url: String,
      pid: String, // pid = public_id of cloudinary
    },
    password: {
      type: String,
      required: [true, "Please enter a Password"],
    },
    nidNumber: {
      type: Number,
    },
    nidFront: {
      url: String,
      pid: String,
    },
    nidBack: {
      url: String,
      pid: String,
    },
    nidSubmitted: {
      type: Boolean, // If NID is submitted then the field for nidFront and nidBack will be disabled
      default: false,
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
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
    },
    accountStatus: {
      type: String,
      default: "Validate", //Validated, Warning, Restricted
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
      ref: "sessiondetails" //It will connect a reference to SessionModel which will make it easier to extract value in UserModel from SessionModel
    },
    loginAttempt: {
      type: Number,
      default: 0,
    },
    limitedLogin: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.isPasswordCorrect = async function (password) {
  try {
    const response = await bcrypt.compare(password, this.password);
    return response;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const UserModel = mongoose.model("user", UserSchema);

export default UserModel;
