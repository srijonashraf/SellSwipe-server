import path from "path";
import {
  createBrandService,
  deleteBrandService,
  listBrandService,
  updateBrandService,
} from "./../services/BrandServices.js";
export const createBrand = async (req, res, next) => {
  const result = await createBrandService(req, next);
  res.status(200).json(result);
};

export const updateBrand = async (req, res, next) => {
  const result = await updateBrandService(req, next);
  res.status(200).json(result);
};

export const deleteBrand = async (req, res, next) => {
  const result = await deleteBrandService(req, next);
  res.status(200).json(result);
};

export const listBrand = async (req, res, next) => {
  const result = await listBrandService(req, next);
  res.status(200).json(result);
};
