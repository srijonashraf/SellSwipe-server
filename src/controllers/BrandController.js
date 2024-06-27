import path from "path";
import {
  createBrandService,
  deleteBrandService,
  listBrandService,
  updateBrandService,
} from "./../services/BrandServices.js";
export const createBrand = async (req, res) => {
  const result = await createBrandService(req);
  res.status(200).json(result);
};

export const updateBrand = async (req, res) => {
  const result = await updateBrandService(req);
  res.status(200).json(result);
};

export const deleteBrand = async (req, res) => {
  const result = await deleteBrandService(req);
  res.status(200).json(result);
};

export const listBrand = async (req, res) => {
  const result = await listBrandService(req);
  res.status(200).json(result);
};
