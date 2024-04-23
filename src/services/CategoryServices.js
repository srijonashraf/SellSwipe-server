import CategoryModel from "./../models/CategoryModel.js";
export const createCategoryService = async (req) => {
  try {
    let reqBody = req.body;
    const data = await CategoryModel.create(reqBody);
    if (!data) {
      return { status: "fail", message: "Failed to save Category" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    return { status: "fail", data: error };
  }
};

export const updateCategoryService = async (req) => {
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
    return { status: "fail", data: error };
  }
};

export const deleteCategoryService = async (req) => {
  try {
    let CategoryID = req.query.categoryId;
    const data = await CategoryModel.deleteOne({ _id: CategoryID });
    if (!data) {
      return { status: "fail", message: "Failed to delete Category" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    return { status: "fail", data: error };
  }
};

export const listCategoryService = async (req) => {
  try {
    const data = await CategoryModel.find().select("-createdAt -updatedAt");
    if (!data) {
      return { status: "fail", message: "Failed to load Category list" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    return { status: "fail", data: error };
  }
};
