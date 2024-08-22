import mongoose from "mongoose";

const ProductSliderSchema = mongoose.Schema(
  {
    postID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    CategoryID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ProductSliderModel = mongoose.model(
  "productsliders",
  ProductSliderSchema
);

export default ProductSliderModel;
