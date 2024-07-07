import {
  createModelService,
  deleteModelService,
  listModelService,
  updateModelService,
} from "./../services/ModelServices.js";
export const createModel = async (req, res, next) => {
  const result = await createModelService(req, next);
  res.status(200).json(result);
};

export const updateModel = async (req, res, next) => {
  const result = await updateModelService(req, next);
  res.status(200).json(result);
};

export const deleteModel = async (req, res, next) => {
  const result = await deleteModelService(req, next);
  res.status(200).json(result);
};

export const listModel = async (req, res, next) => {
  const result = await listModelService(req, next);
  res.status(200).json(result);
};
