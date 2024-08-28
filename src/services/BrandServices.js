import { removeUnusedLocalFile } from "../utils/FileCleanUpUtility.js";
import {
  destroyOnCloudinary,
  uplaodOnCloudinaryWebAssets,
} from "../utils/CloudinaryUtility.js";
import BrandModel from "./../models/BrandModel.js";
export const createBrandService = async (req, next) => {
  try {
    let cloudinaryResponse = {};
    let brandImg = {};
    const { brandName } = req.body;
    
    const existing = await BrandModel.countDocuments({
      brandName: { $regex: brandName, $options: "i" },
    }).exec();

    if (existing > 0) {
      removeUnusedLocalFile(req.file.path);
      return { status: "fail", message: "Brand already exists" };
    } else {
      // Upload image to cloudinary
      if (req.file && !existing) {
        cloudinaryResponse = await uplaodOnCloudinaryWebAssets(
          req.file.path,
          "brand"
        );
        brandImg = {
          url: cloudinaryResponse.secure_url,
          pid: cloudinaryResponse.public_id,
        };
      }

      // Query
      const query = {
        brandName: brandName,
        brandImg: brandImg || null,
      };

      const data = await BrandModel.create(query);
      if (!data) {
        return { status: "fail", message: "Failed to save Brand" };
      } else {
        return { status: "success", data: data };
      }
    }
  } catch (error) {
    next(error);
  }
};

export const updateBrandService = async (req, next) => {
  try {
    let cloudinaryResponse = {};
    let brandName = "";
    const brandID = req.params.brandId;

    // Find the brand first
    const data = await BrandModel.findById(brandID);
    //Set the updated brand name if available else set the old one
    brandName = req.body.brandName || data.brandName;

    if (!data) {
      if (req.file) {
        removeUnusedLocalFile(req.file.path);
      }
      return { status: "fail", message: "Failed to update Brand" };
    }

    let brandImg = data.brandImg; // Preserve the old image data initially

    if (req.file && data) {
      // Delete old image first
      destroyOnCloudinary(data.brandImg.pid);
      cloudinaryResponse = await uplaodOnCloudinaryWebAssets(
        req.file.path,
        "brand"
      );
      brandImg = {
        url: cloudinaryResponse.secure_url,
        pid: cloudinaryResponse.public_id,
      };
    }

    // Update brand data
    data.brandName = brandName;
    data.brandImg = brandImg || null;

    // Save the updated brand
    await data.save();

    return { status: "success", data: data };
  } catch (error) {
    next(error);
  }
};

export const deleteBrandService = async (req, next) => {
  try {
    const brandID = req.params.brandId;
    const data = await BrandModel.findOneAndDelete({ _id: brandID });
    if (!data) {
      return { status: "fail", message: "Failed to delete Brand" };
    } else {
      destroyOnCloudinary(data.brandImg.pid);
      return {
        status: "success",
        data: [],
        message: "Brand deleted successfully",
      };
    }
  } catch (error) {
    next(error);
  }
};

export const getBrandListService = async (req, next) => {
  try {
    const data = await BrandModel.find().select("-createdAt -updatedAt");
    if (!data) {
      return { status: "fail", message: "Failed to load Brand list" };
    } else {
      return { status: "success", data: data };
    }
  } catch (error) {
    next(error);
  }
};
