import { inputSanitizer } from "../middlewares/RequestValidateMiddleware.js";
import LegalModel from "./../models/LegalModel.js";

export const createLegalService = async (req, next) => {
  try {
    const reqBody = req.body;
    inputSanitizer(reqBody);
    const data = await LegalModel.create(reqBody);
    if (!data) {
      return { status: "fail", message: "Failed to save Legal" };
    }
    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const updateLegalService = async (req, next) => {
  try {
    const legalID = req.params.id;

    const data = await LegalModel.findOneAndUpdate(
      { _id: legalID },
      { $set: req.body },
      { new: true }
    );

    if (!data) {
      return { status: "fail", message: "Failed to update Legal" };
    }
    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const deleteLegalService = async (req, next) => {
  try {
    const legalID = req.params.id;
    const data = await LegalModel.deleteOne({ _id: legalID });
    if (!data) {
      return { status: "fail", message: "Failed to delete Legal" };
    }
    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const getLegalListService = async (req, next) => {
  try {
    const data = await LegalModel.find().select("-createdAt -updatedAt");
    if (!data) {
      return { status: "fail", message: "Failed to load Legal list" };
    }
    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};
