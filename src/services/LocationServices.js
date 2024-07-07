import DivisionModel from "./../models/DivisionModel.js";
import DistrictModel from "./../models/DistrictModel.js";
import mongoose from "mongoose";
import AreaModel from "./../models/AreaModel.js";
const ObjectID = mongoose.Types.ObjectId;

//Division
export const createDivisionService = async (req, next) => {
  try {
    let reqBody = req.body;
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
    let DivisionID = req.query.divisionId;
    const data = await DivisionModel.findOneAndUpdate(
      { _id: DivisionID },
      { $set: req.body },
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
    let DivisionID = req.query.divisionId;
    const data = await DivisionModel.deleteOne({ _id: DivisionID });
    if (!data) {
      return { status: "fail", message: "Failed to delete Division" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

export const listDivisionService = async (req, next) => {
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
    let DivisionID = new ObjectID(req.query.divisionId);
    const data = await DistrictModel.create(req.body);
    data.divisionID = DivisionID;
    await data.save();
    if (!data) {
      return { status: "fail", message: "Failed to save District" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

export const updateDistrictService = async (req, next) => {
  try {
    let DistrictID = req.query.districtId;
    const data = await DistrictModel.findOneAndUpdate(
      { _id: DistrictID },
      { $set: req.body },
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
    let DistrictID = req.query.districtId;
    const data = await DistrictModel.deleteOne({ _id: DistrictID });
    if (!data) {
      return { status: "fail", message: "Failed to delete District" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

export const listDistrictService = async (req, next) => {
  try {
    let DivisionID = new ObjectID(req.query.divisionId);
    const data = await DistrictModel.find({ divisionID: DivisionID }).select(
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
    let DistrictID = new ObjectID(req.query.districtId);
    const data = await AreaModel.create(req.body);
    data.districtID = DistrictID;
    await data.save();
    if (!data) {
      return { status: "fail", message: "Failed to save Area" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

// export const createAreaService = async (req,next) => {
//   try {
//     let DistrictID = new ObjectID(req.query.districtId);
//     const areaNames = req.body.areaNames; // Assuming the array of area names is passed as 'areaNames'

//     // Array to store created areas
//     const createdAreas = [];

//     for (let areaName of areaNames) {
//       const areaData = { areaName: areaName, districtID: DistrictID };
//       const createdArea = await AreaModel.create(areaData);
//       createdAreas.push(createdArea);
//     }

//     if (createdAreas.length === 0) {
//       return { status: "fail", message: "Failed to save any area" };
//     } else {
//       return { status: "success", data: createdAreas };
//     }
//   } catch (error) {
//   next(error)
//   }
// };

//Req body for this: {
//   {"areaNames": [
//     "Baliadangi",
//        "Haripur",
//        "Pirganj(Thakurgaon)",
//        "Ranishankail",
//        "Thakurgaon Sadar",
//        "Shibganj (Thakurgaon Sadar)"
//      ]
//  }

export const updateAreaService = async (req, next) => {
  try {
    let AreaID = req.query.areaId;
    const data = await AreaModel.findOneAndUpdate(
      { _id: AreaID },
      { $set: req.body },
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
    let AreaID = req.query.areaId;
    const data = await AreaModel.deleteOne({ _id: AreaID });
    if (!data) {
      return { status: "fail", message: "Failed to delete Area" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};

export const listAreaService = async (req, next) => {
  try {
    let DistrictID = new ObjectID(req.query.districtId);
    const data = await AreaModel.find({ districtID: DistrictID }).select(
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
