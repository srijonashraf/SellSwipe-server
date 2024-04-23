import BrandModel from "./../models/BrandModel.js";
export const createBrandService = async (req) => {
  try {
    let reqBody = req.body;
    const data = await BrandModel.create(reqBody);
    if (!data) {
      return { status: "fail", message: "Failed to save Brand" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    return { status: "fail", data: error };
  }
};

export const updateBrandService = async (req) => {
  try {
    let BrandID = req.query.brandId;
    const data = await BrandModel.findOneAndUpdate(
      { _id: BrandID },
      { $set: req.body },
      { new: true }
    );
    if (!data) {
      return { status: "fail", message: "Failed to update Brand" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    return { status: "fail", data: error };
  }
};

export const deleteBrandService = async (req) => {
  try {
    let BrandID = req.query.brandId;
    const data = await BrandModel.deleteOne({ _id: BrandID });
    if (!data) {
      return { status: "fail", message: "Failed to delete Brand" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    return { status: "fail", data: error };
  }
};

export const listBrandService = async (req) => {
  try {
    const data = await BrandModel.find().select("-createdAt -updatedAt");
    if (!data) {
      return { status: "fail", message: "Failed to load Brand list" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    return { status: "fail", data: error };
  }
};
