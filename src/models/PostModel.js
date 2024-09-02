import mongoose from "mongoose";

// Define the subschemas
const AdminRefSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
    },
    name: {
      type: String,
    },
    role: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

const ReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    role: {
      type: String,
    },
    causeOfReport: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

const FeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admins",
    },
    role: {
      type: String,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

// Define the main post schema
const PostSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Boolean,
    },
    discountPrice: {
      type: Number,
    },
    mainImg: {
      url: String,
      pid: String,
    },
    stock: {
      type: String,
      required: true,
    },
    otherPhone: {
      type: String,
      required: true,
    },
    onReview: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: AdminRefSchema,
    isDeclined: {
      type: Boolean,
      default: false,
    },
    declinedBy: AdminRefSchema,
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    editCount: {
      type: Number,
      default: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    reportedBy: [ReportSchema],
    viewsCount: {
      type: Number,
      default: 0,
    },
    divisionID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    districtID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    areaID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    feedback: [FeedbackSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const PostModel = mongoose.model("posts", PostSchema);

export default PostModel;
