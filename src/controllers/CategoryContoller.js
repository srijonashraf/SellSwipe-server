import {
  createCategoryService,
  deleteCategoryService,
  listCategoryService,
  updateCategoryService,
} from "./../services/CategoryServices.js";
export const createCategory = async (req, res, next) => {
  const result = await createCategoryService(req, next);
  res.status(200).json(result);
};

export const updateCategory = async (req, res, next) => {
  const result = await updateCategoryService(req, next);
  res.status(200).json(result);
};

export const deleteCategory = async (req, res, next) => {
  const result = await deleteCategoryService(req, next);
  res.status(200).json(result);
};

export const listCategory = async (req, res, next) => {
  const result = await listCategoryService(req, next);
  res.status(200).json(result);
};
