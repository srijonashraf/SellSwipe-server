import mongoose from "mongoose";

const PostDetailsSchema = mongoose.Schema(
  {
    postID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    des: {
      type: String,
    },
    img1: {
      type: String,
    },
    img2: {
      type: String,
    },
    img3: {
      type: String,
    },
    img4: {
      type: String,
    },
    img5: {
      type: String,
    },
    size: {
      type: String,
    },
    color: {
      type: [String],
    },
    features: {
      type: String,
    },
    authenticity: {
      type: String,
    },
    condition: {
      type: String,
    },
    usedMonths: {
      type: String,
    },
    brandID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    categoryID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    keyword: {
      type: [String],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const PostDetailsModel = mongoose.model("postdetails", PostDetailsSchema);

export default PostDetailsModel;
