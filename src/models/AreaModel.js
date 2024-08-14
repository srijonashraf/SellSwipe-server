import mongoose from "mongoose";

const AreaSchema = mongoose.Schema(
  {
    areaName: {
      type: String,
      unique: true,
      required: true,
    },
    districtID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const AreaModel = mongoose.model("areas", AreaSchema);

export default AreaModel;
