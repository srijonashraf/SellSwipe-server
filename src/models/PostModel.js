import mongoose from "mongoose";

const PostSchema = mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
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
    discountPercentage: {
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
    approvedBy: {
      type: Object,
    },
    isDeclined: {
      type: Boolean,
      default: false,
    },
    declinedBy: {
      type: Object,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: String,
    },
    editCount: {
      type: String,
    },
    reportAdmin: {
      type: Boolean,
    },
    reportedBy: {
      type: String,
    },
    viewsCount: {
      type: String,
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
    feedback: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const PostModel = mongoose.model("posts", PostSchema);

export default PostModel;
