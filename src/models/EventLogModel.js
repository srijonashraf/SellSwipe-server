import mongoose from "mongoose";

const EventSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    endPoint: {
      type: String,
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    role: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    timestamps: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const EventModel = mongoose.model("eventlogs", EventSchema);

export default EventModel;
