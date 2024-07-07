import CategoryModel from "./../models/CategoryModel.js";
export const createCategoryService = async (req, next) => {
  try {
    let reqBody = req.body;
    const data = await CategoryModel.create(reqBody);
    if (!data) {
      return { status: "fail", message: "Failed to save Category" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

export const updateCategoryService = async (req, next) => {
  try {
    let CategoryID = req.query.categoryId;
    const data = await CategoryModel.findOneAndUpdate(
      { _id: CategoryID },
      { $set: req.body },
      { new: true }
    );
    if (!data) {
      return { status: "fail", message: "Failed to update Category" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryService = async (req, next) => {
  try {
    let CategoryID = req.query.categoryId;
    const data = await CategoryModel.deleteOne({ _id: CategoryID });
    if (!data) {
      return { status: "fail", message: "Failed to delete Category" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

export const listCategoryService = async (req, next) => {
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
