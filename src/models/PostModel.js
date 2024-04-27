import mongoose from "mongoose";

const PostSchema = mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    title: {
      type: String,
    },
    price: {
      type: String,
    },
    discount: {
      type: String,
    },
    discountPrice: {
      type: String,
    },
    mainImg: {
      type: String,
    },
    stock: {
      type: String,
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
    },
    districtID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    areaID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    address: {
      type: String,
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
