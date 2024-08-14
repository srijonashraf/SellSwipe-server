import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath, userId) => {
  try {
    if (!localFilePath) return null;

    //Assets will be uploading in the dedicated folder named 'sellswipe'
    const folderPath = `sellswipe/user/${userId}`;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: folderPath,
    });

    if (!response) {
      console.log("Failed to upload file");
      fs.unlinkSync(localFilePath); // Ensure the file is deleted if the upload fails
      return null;
    }

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    return null;
  }
};

export const uplaodOnCloudinaryWebAssets = async (localFilePath, location) => {
  try {
    if (!localFilePath) return null;

    //Assets will be uploading in the dedicated folder named 'sellswipe'
    const folderPath = `sellswipe/web/${location}`;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: folderPath,
    });

    if (!response) {
      console.log("Failed to upload file");
      fs.unlinkSync(localFilePath); // Ensure the file is deleted if the upload fails
      return null;
    }

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    return null;
  }
};

export const destroyOnCloudinary = async (pid) => {
  try {
    if (!pid) return null;
    const response = await cloudinary.uploader.destroy(pid, {
      invalidate: true,
    });

    if (!response) {
      console.log("Failed to destroy file");
      return null;
    }
    return response;
  } catch (error) {
    return null;
  }
};
