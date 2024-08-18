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
      userId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      name: {
        type: String,
      },
      role: {
        type: String,
      },
    },
    isDeclined: {
      type: Boolean,
      default: false,
    },
    declinedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      name: {
        type: String,
      },
      role: {
        type: String,
      },
    },
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
      },
    ],
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
    feedback: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        role: {
          type: String,
        },
        comment: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const PostModel = mongoose.model("posts", PostSchema);

export default PostModel;
