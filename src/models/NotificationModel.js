import mongoose from "mongoose";

const NotificationSchema = mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
    },
    type:{
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    senderRole: {
      type: String,
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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
