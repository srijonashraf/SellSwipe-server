import mongoose from "mongoose";

const EventSchema = mongoose.Schema(
  {
    type: {
      type: String,
    },
    endPoint: {
      type: String,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    role: {
      type: String,
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
