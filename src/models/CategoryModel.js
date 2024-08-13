import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      unique: true,
    },
    categoryImg: {
      type: String,
    },
    subCategories: [
      {
        name: {
          type: String,
          unique: true,
        },
        image: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

const CategoryModel = mongoose.model("categories", CategorySchema);

export default CategoryModel;
