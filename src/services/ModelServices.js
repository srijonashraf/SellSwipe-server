import BrandModel from "./../models/BrandModel.js";

export const createModelService = async (req, next) => {
  try {
    let modelsToAdd = [];
    const brandID = req.query.brandId;
    const reqModels = req.body.modelsName;

    /**
     * At first fetch the brand
     * Then extract models from there and map the name field
     * Match the extracted models with the requested model names and filter out the new models
     */

    const data = await BrandModel.findById(brandID);
    if (!data) {
      return { status: "fail", message: "No brand found" };
    }
    const existingModels = data.models.map((model) => model.name.toLowerCase());

    //If no model is found then push the whole req body cause all of them are new
    if (!existingModels) {
      modelsToAdd = reqModels;
    }

    //If any model found then filter them
    if (existingModels) {
      modelsToAdd = reqModels.filter(
        (model) => !existingModels.includes(model.toLowerCase())
      );
    }

    const formattedmodelsToAdd = modelsToAdd.map((model) => ({ name: model }));

    if (modelsToAdd.length > 0) {
      const newModels = await BrandModel.findOneAndUpdate(
        { _id: brandID },
        { $addToSet: { models: { $each: formattedmodelsToAdd } } },
        {
          new: true,
        }
      );

      if (newModels.modifiedCount < 1) {
        return { status: "fail", message: "Failed to save model" };
      } else {
        return { status: "success", data: newModels };
      }
    }

    return { status: "fail", message: "No new model found" };
  } catch (error) {
    next(error);
  }
};

export const updateModelService = async (req, next) => {
  try {
    let modelName = req.body.name;
    let modelID = req.query.modelId;
    const data = await BrandModel.findOneAndUpdate(
      { "models._id": modelID },
      {
        $set: {
          "models.$.name": modelName,
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
    next(error);
  }
};

export const deleteModelService = async (req, next) => {
  try {
    let modelID = req.query.modelId;
    const data = await BrandModel.findOneAndUpdate(
      { "models._id": modelID },
      { $pull: { models: { _id: modelID } } },
      { new: true }
    );
    if (!data) {
      return { status: "fail", message: "Failed to delete Model" };
    } else {
      return {
        status: "success",
        data: [],
        message: "Model deleted successfully",
      };
    }
  } catch (error) {
    next(error);
  }
};

export const listModelService = async (req, next) => {
  try {
    let BrandID = req.query.brandId;
    const data = await BrandModel.find({ _id: BrandID }).select(
      "-_id brandName models"
    );
    if (!data) {
      return { status: "fail", message: "Failed to load Model list" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};
