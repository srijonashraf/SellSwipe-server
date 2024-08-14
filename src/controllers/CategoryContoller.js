import {
  createCategoryService,
  createSubCategoryService,
  deleteCategoryService,
  deleteSubCategoryService,
  listCategoryService,
  updateCategoryService,
  updateSubCategoryService,
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

export const createSubCategory = async (req, res, next) => {
  const result = await createSubCategoryService(req, next);
  res.status(200).json(result);
};

export const updateSubCategory = async (req, res, next) => {
  const result = await updateSubCategoryService(req, next);
  res.status(200).json(result);
};

export const deleteSubCategory = async (req, res, next) => {
  const result = await deleteSubCategoryService(req, next);
  res.status(200).json(result);
};
