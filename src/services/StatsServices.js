import PostModel from "../models/PostModel.js";
import UserModel from "../models/UserModel.js";
import CategoryModel from "./../models/CategoryModel.js";
import BrandModel from "./../models/BrandModel.js";

export const getTotalUsersService = async (req, next) => {
  try {
    const result = await UserModel.countDocuments({});
    return { status: "success", totalUsers: result };
  } catch (error) {
    next(error);
  }
};

export const getTotalPostsService = async (req, next) => {
  try {
    const result = await PostModel.countDocuments({});
    return { status: "success", totalPosts: result };
  } catch (error) {
    next(error);
  }
};

export const getTotalCategoriesService = async (req, next) => {
  try {
    const result = await CategoryModel.countDocuments({});
    return { status: "success", totalCategories: result };
  } catch (error) {
    next(error);
  }
};

export const getTotalBrandsService = async (req, next) => {
  try {
    const result = await BrandModel.countDocuments({});
    return { status: "success", totalBrands: result };
  } catch (error) {
    next(error);
  }
};
