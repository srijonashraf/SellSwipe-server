import mongoose from "mongoose";

const NotificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
    },
    message: {
      type: String,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    senderRole: {
      type: String,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    timestamp: {
      type: String,
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
