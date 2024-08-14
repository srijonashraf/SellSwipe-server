import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      unique: true,
      required: true,
    },
    brandImg: {
      url: { type: String },
      pid: { type: String },
    },
    models: [
      {
        name: {
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
