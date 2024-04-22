import mongoose from "mongoose";

const ProductSliderSchema = mongoose.Schema(
  {
    postID: {
      type: mongoose.Schema.Types.ObjectId,
    },
    CategoryID: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ProductSliderModel = ("productsliders", ProductSliderSchema);

export default ProductSliderModel;
