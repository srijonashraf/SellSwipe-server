import mongoose from "mongoose";

const NotificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    sender: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      role: { type: String, required: true },
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reference: {
      type: Object,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const NotificationModel = mongoose.model("notifications", NotificationSchema);

export default NotificationModel;
