import BrandModel from "./../models/BrandModel.js";
export const createModelService = async (req) => {
  try {
    let BrandID = req.query.brandId;
    const data = await BrandModel.findOneAndUpdate(
      { _id: BrandID },
      { $addToSet: { models: req.body } },
      { new: true }
    );
    if (!data) {
      return { status: "fail", message: "Failed to save Model" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    return { status: "fail", data: error };
  }
};

export const updateModelService = async (req) => {
  try {
    let ModelID = req.query.modelId;
    const data = await BrandModel.findOneAndUpdate(
      { "models._id": ModelID },
      {
        $set: {
          "models.$.modelName": req.body.modelName,
          "models.$.modelImg": req.body.modelImg,
        },
      },
      { new: true }
    );
    if (!data) {
      return { status: "fail", message: "Failed to update Model" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    return { status: "fail", data: error };
  }
};

export const deleteModelService = async (req) => {
  try {
    let ModelID = req.query.modelId;
    const data = await BrandModel.findOneAndUpdate(
      { "models._id": ModelID },
      { $pull: { models: { _id: ModelID } } },
      { new: true }
    );
    if (!data) {
      return { status: "fail", message: "Failed to delete Model" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    return { status: "fail", data: error };
  }
};

export const listModelService = async (req) => {
  try {
    let BrandID = req.query.brandId;
    const data = await BrandModel.find({ _id: BrandID }).select("-_id brandName models");
    if (!data) {
      return { status: "fail", message: "Failed to load Model list" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    return { status: "fail", data: error };
  }
};
