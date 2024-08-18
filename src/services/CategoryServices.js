import CategoryModel from "./../models/CategoryModel.js";
import { removeUnusedLocalFile } from "./../helper/RemoveUnusedFilesHelper.js";
import {
  destroyOnCloudinary,
  uplaodOnCloudinaryWebAssets,
} from "./../utility/Cloudinary.js";

export const createCategoryService = async (req, next) => {
  try {
    let cloudinaryResponse = {};
    let categoryImg = {};
    const { categoryName } = req.body;

    // Check if the category already exists
    const existing = await CategoryModel.countDocuments({
      categoryName: categoryName,
    }).exec();

    if (existing > 0) {
      removeUnusedLocalFile(req.file.path);
      return { status: "fail", message: "Category already exists" };
    } else {
      //Upload image to cloudinary
      if (req.file && !existing) {
        cloudinaryResponse = await uplaodOnCloudinaryWebAssets(
          req.file.path,
          "category"
        );
        categoryImg = {
          url: cloudinaryResponse.secure_url,
          pid: cloudinaryResponse.public_id,
        };
      }

      //Query
      const query = {
        categoryName: categoryName,
        categoryImg: categoryImg || null,
      };

      const data = await CategoryModel.create(query);
      if (!data) {
        return { status: "fail", message: "Failed to save Category" };
      } else {
        return { status: "success", data: data };
      }
    }
  } catch (error) {
    next(error);
  }
};

export const updateCategoryService = async (req, next) => {
  try {
    let cloudinaryResponse = {};
    let categoryName = "";
    const categoryID = req.params.categoryId;

    //Find the category at first
    const data = await CategoryModel.findById(categoryID);

    //Set the updated category name if available else set the old one
    categoryName = req.body.categoryName || data.categoryName;

    if (!data) {
      if (req.file) {
        removeUnusedLocalFile(req.file.path);
      }
      return { status: "fail", message: "Failed to update Category" };
    }

    let categoryImg = data.categoryImg; // Preserve the old image data initially

    if (req.file && data) {
      //At first deleting old one.
      destroyOnCloudinary(data.categoryImg.pid);
      cloudinaryResponse = await uplaodOnCloudinaryWebAssets(
        req.file.path,
        "category"
      );
      categoryImg = {
        url: cloudinaryResponse.secure_url,
        pid: cloudinaryResponse.public_id,
      };
    }

    // Update category data
    data.categoryName = categoryName;
    data.categoryImg = categoryImg || null;

    // Save the updated category
    await data.save();

    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryService = async (req, next) => {
  try {
    const categoryID = req.params.categoryId;
    const data = await CategoryModel.findOneAndDelete({ _id: categoryID });
    if (!data) {
      return { status: "fail", message: "Failed to delete Category" };
    } else {
      destroyOnCloudinary(data.categoryImg.pid);
      return {
        status: "success",
        data: [],
        message: "Category deleted successfully",
      };
    }
  } catch (error) {
    next(error);
  }
};

export const getCategoryListService = async (req, next) => {
  try {
    const data = await CategoryModel.find().select("-createdAt -updatedAt");
    if (!data) {
      return { status: "fail", message: "Failed to load Category list" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

export const createSubCategoryService = async (req, next) => {
  try {
    let subCategoriesToAdd = [];
    const categoryID = req.params.categoryId;
    const reqSubCategories = req.body.subCategoryNames;

    /**
     * At first fetch the categories
     * Then extract subcategories from there and  map the name field
     * Match the extracted subcategories with the requested subcategories and filter out the new subcategories
     */

    const data = await CategoryModel.findById(categoryID);
    if (!data) {
      return { status: "fail", message: "No category found" };
    }
    const existingSubCategories = data.subCategories.map((subCategory) =>
      subCategory.name.toLowerCase()
    );

    //If no subcategory is found then push the whole req body cause all of them are new
    if (!existingSubCategories) {
      subCategoriesToAdd = reqSubCategories;
    }

    //If any subcategory found then filter them
    if (existingSubCategories) {
      subCategoriesToAdd = reqSubCategories.filter(
        (subCategory) =>
          !existingSubCategories.includes(subCategory.toLowerCase())
      );
    }

    const formattedSubCategoriesToAdd = subCategoriesToAdd.map(
      (subCategory) => ({ name: subCategory })
    );

    if (subCategoriesToAdd.length > 0) {
      const newSubCategories = await CategoryModel.updateOne(
        { _id: categoryID },
        { $addToSet: { subCategories: { $each: formattedSubCategoriesToAdd } } }
      );

      if (newSubCategories.modifiedCount < 1) {
        return { status: "fail", message: "Failed to save sub categories" };
      } else {
        return {
          status: "success",
          data: [],
          message: "All sub categories added",
        };
      }
    }

    return { status: "fail", message: "No new sub category found" };
  } catch (error) {
    next(error);
  }
};

export const updateSubCategoryService = async (req, next) => {
  try {
    const categoryId = req.params.categoryId;
    const subCategoryId = req.params.id;
    const subCategoryName = req.body.name;
    //Check if the sub category already exist
    const exists = await CategoryModel.findOne({
      _id: categoryId,
      subCategories: {
        $elemMatch: { name: subCategoryName },
      },
    });
    if (exists) {
      return { status: "fail", message: "This sub category is already exist" };
    }
    const data = await CategoryModel.updateOne(
      { "subCategories._id": subCategoryId },
      {
        $set: {
          "subCategories.$.name": subCategoryName,
        },
      },
      { new: true }
    );
    if (data.modifiedCount === 0) {
      return { status: "fail", message: "Failed to save sub Category" };
    }
    return {
      status: "success",
      message: "Sub category updated successfully",
      data: data,
    };
  } catch (error) {
    next(error);
  }
};

export const deleteSubCategoryService = async (req, next) => {
  try {
    const { id } = req.params;
    const data = await CategoryModel.updateOne(
      {
        "subCategories._id": id,
      },
      {
        $pull: {
          subCategories: { _id: id },
        },
      },
      { new: true }
    );
    if (data.modifiedCount < 1) {
      return { status: "fail", message: "Failed to delete sub category" };
    } else {
      return {
        status: "success",
        data: [],
        message: "Sub category deleted successfully",
      };
    }
  } catch (error) {
    next(error);
  }
};
