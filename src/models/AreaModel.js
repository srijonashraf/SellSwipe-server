import mongoose from "mongoose";

const AreaSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
    },
    districtID: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const AreaModel = mongoose.model("areas", AreaSchema);

export default AreaModel;
