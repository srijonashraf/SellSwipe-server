import mongoose from "mongoose";

const PostDetailsSchema = mongoose.Schema(
  {
    postID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    img1: {
      type: String,
      required: true,
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
