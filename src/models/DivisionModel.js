import mongoose from "mongoose";

const DivisionSchema = mongoose.Schema(
  {
    divisionName: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const DivisionModel = mongoose.model("divisions", DivisionSchema);

export default DivisionModel;
