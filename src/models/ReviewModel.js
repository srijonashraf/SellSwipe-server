import mongoose from "mongoose";

const ReviewSchema = mongoose.Schema(
  {
    postID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "posts",
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    reportedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        role: {
          type: String,
        },
        causeOfReport: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

const ReviewModel = mongoose.model("reviews", ReviewSchema);

export default ReviewModel;
