import mongoose from "mongoose";

const DistrictSchema = mongoose.Schema(
  {
    districtName: {
      type: String,
      unique: true,
    },
    divisionID: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const DistrictModel = mongoose.model("districts", DistrictSchema);

export default DistrictModel;
