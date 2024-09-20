import mongoose from "mongoose";

const SliderSchema = mongoose.Schema(
  {
    postID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    categoryID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const SliderModel = mongoose.model(
  "sliders",
  SliderSchema
);

export default SliderModel;
