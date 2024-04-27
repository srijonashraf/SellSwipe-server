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
    photo: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Please enter a Password"],
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
    emailVerified: {
      type: Boolean,
      default: false,
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

const UserModel = mongoose.model("users", UserSchema);

export default UserModel;
