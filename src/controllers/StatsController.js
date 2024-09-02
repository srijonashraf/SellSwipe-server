import {
  getTotalBrandsService,
  getTotalCategoriesService,
  getTotalPostsService,
  getTotalUsersService,
} from "../services/StatsServices.js";

export const getTotalUsers = async (req, res, next) => {
  const result = await getTotalUsersService(req, next);
  res.status(200).json(result);
};

export const getTotalPosts = async (req, res, next) => {
  const result = await getTotalPostsService(req, next);
  res.status(200).json(result);
};

export const getTotalCategories = async (req, res, next) => {
  const result = await getTotalCategoriesService(req, next);
  res.status(200).json(result);
};
export const getTotalBrands = async (req, res, next) => {
  const result = await getTotalBrandsService(req, next);
  res.status(200).json(result);
};
