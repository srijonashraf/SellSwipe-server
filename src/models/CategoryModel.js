import mongoose from "mongoose";

const SubCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const CategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      unique: true,
      required: true,
    },
    categoryImg: {
      url: { type: String },
      pid: { type: String },
    },
    subCategories: [SubCategorySchema],
  },
  { timestamps: true, versionKey: false }
);

const CategoryModel = mongoose.model("categories", CategorySchema);

export default CategoryModel;
