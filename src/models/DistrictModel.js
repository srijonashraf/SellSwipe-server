import mongoose from "mongoose";

const DistrictSchema = mongoose.Schema(
  {
    districtName: {
      type: String,
      unique: true,
      required: true,
    },
    divisionID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const DistrictModel = mongoose.model("districts", DistrictSchema);

export default DistrictModel;
