import DivisionModel from "./../models/DivisionModel.js";
import DistrictModel from "./../models/DistrictModel.js";
import mongoose from "mongoose";
import AreaModel from "./../models/AreaModel.js";
import { inputSanitizer } from "../middlewares/RequestValidateMiddleware.js";

//Division
export const createDivisionService = async (req, next) => {
  try {
    const reqBody = req.body;
    inputSanitizer(reqBody);
    const data = await DivisionModel.create(reqBody);
    if (!data) {
      return { status: "fail", message: "Failed to save Division" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

export const updateDivisionService = async (req, next) => {
  try {
    const divisionID = req.params.id;
    const { divisionName } = req.body;
    inputSanitizer(req.body);
    const data = await DivisionModel.findOneAndUpdate(
      { _id: divisionID },
      { $set: { divisionName: divisionName } },
      { new: true }
    );
    if (!data) {
      return { status: "fail", message: "Failed to update Division" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

export const deleteDivisionService = async (req, next) => {
  try {
    const divisionID = req.params.id;
    const data = await DivisionModel.deleteOne({ _id: divisionID });
    if (!data) {
      return { status: "fail", message: "Failed to delete Division" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

export const getDivisionListService = async (req, next) => {
  try {
    const data = await DivisionModel.find().select("-createdAt -updatedAt");
    if (!data) {
      return { status: "fail", message: "Failed to load Division list" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

//District
export const createDistrictService = async (req, next) => {
  try {
    const reqBody = req.body;
    const divisionID = req.params.divisionId;
    reqBody.divisionID = divisionID;

    const data = await DistrictModel.create(reqBody);

    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const updateDistrictService = async (req, next) => {
  try {
    const reqBody = req.body;
    inputSanitizer(reqBody);
    const districtID = req.params.id;
    const data = await DistrictModel.findOneAndUpdate(
      { _id: districtID },
      { $set: reqBody },
      { new: true }
    );
    if (!data) {
      return { status: "fail", message: "Failed to update District" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

export const deleteDistrictService = async (req, next) => {
  try {
    const districtID = req.params.id;
    const data = await DistrictModel.deleteOne({ _id: districtID });
    if (!data) {
      return { status: "fail", message: "Failed to delete District" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

export const getDistrictListService = async (req, next) => {
  try {
    let divisionID = req.params.divisionId;
    const data = await DistrictModel.find({ divisionID: divisionID }).select(
      "-createdAt -updatedAt"
    );
    if (!data) {
      return { status: "fail", message: "Failed to load District list" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

//Area

export const createAreaService = async (req, next) => {
  try {
    const reqBody = req.body;
    const districtID = req.params.districtId;
    reqBody.districtID = districtID;

    const data = await AreaModel.create(reqBody);
    if (!data) {
      return { status: "fail", message: "Failed to save Area" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};


export const updateAreaService = async (req, next) => {
  try {
    const reqBody = req.body;
    inputSanitizer(reqBody);
    const areaID = req.params.id;
    const data = await AreaModel.findOneAndUpdate(
      { _id: areaID },
      { $set: reqBody },
      { new: true }
    );
    if (!data) {
      return { status: "fail", message: "Failed to update Area" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

export const deleteAreaService = async (req, next) => {
  try {
    const areaID = req.params.id;
    const data = await AreaModel.deleteOne({ _id: areaID });
    if (!data) {
      return { status: "fail", message: "Failed to delete Area" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

export const getAreaListService = async (req, next) => {
  try {
    const districtID = req.params.districtId;
    const data = await AreaModel.find({ districtID: districtID }).select(
      "-createdAt -updatedAt"
    );
    if (!data) {
      return { status: "fail", message: "Failed to load Area list" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};
