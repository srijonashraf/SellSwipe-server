import mongoose from "mongoose";

const PostDetailsSchema = mongoose.Schema(
  {
    postID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "posts",
    },
    description: {
      type: String,
      required: true,
    },
    img1: {
      url: { type: String, required: true },
      pid: { type: String, required: true },
    },
    img2: {
      url: String,
      pid: String,
    },
    img3: {
      url: String,
      pid: String,
    },
    img4: {
      url: String,
      pid: String,
    },
    size: {
      type: [String],
      required: true,
    },
    color: {
      type: [String],
      required: true,
    },
    authenticity: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      required: true,
    },
    usedMonths: {
      type: String,
      required: true,
    },
    brandID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    modelID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    categoryID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    keyword: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const PostDetailsModel = mongoose.model("postdetails", PostDetailsSchema);

export default PostDetailsModel;
