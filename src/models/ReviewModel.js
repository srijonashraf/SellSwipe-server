import mongoose from "mongoose";

const ReviewSchema = mongoose.Schema(
  {
    postID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    review: {
      type: String,
    },
    rating: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

const ReviewModel = mongoose.model("reviews", ReviewSchema);

export default ReviewModel;
