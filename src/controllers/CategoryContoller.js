import {
    createCategoryService,
    deleteCategoryService,
    listCategoryService,
    updateCategoryService,
  } from "./../services/CategoryServices.js";
  export const createCategory = async (req, res) => {
    const result = await createCategoryService(req);
    res.status(200).json(result);
  };
  
  export const updateCategory = async (req, res) => {
    const result = await updateCategoryService(req);
    res.status(200).json(result);
  };
  
  export const deleteCategory = async (req, res) => {
    const result = await deleteCategoryService(req);
    res.status(200).json(result);
  };
  
  export const listCategory = async (req, res) => {
    const result = await listCategoryService(req);
    res.status(200).json(result);
  };
  