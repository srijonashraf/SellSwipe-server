import {
  createLegalService,
  deleteLegalService,
  getLegalListService,
  updateLegalService,
} from "./../services/LegalServices.js";
export const createLegal = async (req, res, next) => {
  const result = await createLegalService(req, next);
  res.status(200).json(result);
};

export const updateLegal = async (req, res, next) => {
  const result = await updateLegalService(req, next);
  res.status(200).json(result);
};

export const deleteLegal = async (req, res, next) => {
  const result = await deleteLegalService(req, next);
  res.status(200).json(result);
};

export const getLegalList = async (req, res, next) => {
  const result = await getLegalListService(req, next);
  res.status(200).json(result);
};
