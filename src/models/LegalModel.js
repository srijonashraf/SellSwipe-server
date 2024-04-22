import mongoose from "mongoose";

const LegalSchema = mongoose.Schema(
  {
    type: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

const LegalModel = mongoose.model("legals", LegalSchema);

export default LegalModel;
