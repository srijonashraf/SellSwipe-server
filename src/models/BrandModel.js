import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      unique: true,
    },
    brandImg: {
      type: String,
    },
    models: [
      {
        modelName: {
          type: String,
          unique: true,
        },
        modelImg: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const BrandModel = mongoose.model("brands", BrandSchema);
export default BrandModel;
