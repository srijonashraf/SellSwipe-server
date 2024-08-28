import mongoose from "mongoose";

const NotificationSchema = mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reference: {
      type: Object,
    },
    readStatus: {
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
