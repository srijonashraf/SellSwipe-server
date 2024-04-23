import {
  createModelService,
  deleteModelService,
  listModelService,
  updateModelService,
} from "./../services/ModelServices.js";
export const createModel = async (req, res) => {
  const result = await createModelService(req);
  res.status(200).json(result);
};

export const updateModel = async (req, res) => {
  const result = await updateModelService(req);
  res.status(200).json(result);
};

export const deleteModel = async (req, res) => {
  const result = await deleteModelService(req);
  res.status(200).json(result);
};

export const listModel = async (req, res) => {
  const result = await listModelService(req);
  res.status(200).json(result);
};
