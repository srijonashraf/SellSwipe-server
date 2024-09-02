import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
    },
    role: {
      type: String,
      enum: ["User"],
      default: "User",
    },
    avatar: {
      url: {
        type: String,
        default: "",
      },
      pid: {
        type: String,
        default: "",
      },
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
      type: Boolean,
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
      default: false,
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
      enum: ["Validate", "Warning", "Restricted"],
      default: "Validate",
    },
    warningCount: {
      type: Number,
    },
    lastRefresh: {
      type: String,
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
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error("Error hashing password: ", error);
  }
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
