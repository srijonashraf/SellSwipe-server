import {
  createAreaService,
  createDistrictService,
  createDivisionService,
  deleteAreaService,
  deleteDistrictService,
  deleteDivisionService,
  listAreaService,
  listDistrictService,
  listDivisionService,
  updateAreaService,
  updateDistrictService,
  updateDivisionService,
} from "./../services/LocationServices.js";

//Division
export const createDivision = async (req, res) => {
  const result = await createDivisionService(req);
  res.status(200).json(result);
};

export const updateDivision = async (req, res) => {
  const result = await updateDivisionService(req);
  res.status(200).json(result);
};

export const deleteDivision = async (req, res) => {
  const result = await deleteDivisionService(req);
  res.status(200).json(result);
};

export const listDivision = async (req, res) => {
  const result = await listDivisionService(req);
  res.status(200).json(result);
};

//District

export const createDistrict = async (req, res) => {
  const result = await createDistrictService(req);
  res.status(200).json(result);
};

export const updateDistrict = async (req, res) => {
  const result = await updateDistrictService(req);
  res.status(200).json(result);
};

export const deleteDistrict = async (req, res) => {
  const result = await deleteDistrictService(req);
  res.status(200).json(result);
};

export const listDistrict = async (req, res) => {
  const result = await listDistrictService(req);
  res.status(200).json(result);
};

//Area

export const createArea = async (req, res) => {
  const result = await createAreaService(req);
  res.status(200).json(result);
};

export const updateArea = async (req, res) => {
  const result = await updateAreaService(req);
  res.status(200).json(result);
};

export const deleteArea = async (req, res) => {
  const result = await deleteAreaService(req);
  res.status(200).json(result);
};

export const listArea = async (req, res) => {
  const result = await listAreaService(req);
  res.status(200).json(result);
};
