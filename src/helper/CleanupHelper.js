import { destroyOnCloudinary } from "../utility/Cloudinary/Cloudinary.js";
import { removeUnusedLocalFile } from "./RemoveUnusedFilesHelper.js";

// Helper function to clean up files
export const cleanupFiles = (files) => {
  if (files && files.nidFront) {
    for (const file of files.nidFront) {
      removeUnusedLocalFile(file.path);
    }
  }
  if (files && files.nidBack) {
    for (const file of files.nidBack) {
      removeUnusedLocalFile(file.path);
    }
  }
};

// Helper function to delete existing files on Cloudinary
export const deleteExistingFiles = (user) => {
  if (user.nidFront && user.nidFront.pid) {
    destroyOnCloudinary(user.nidFront.pid);
  }
  if (user.nidBack && user.nidBack.pid) {
    destroyOnCloudinary(user.nidBack.pid);
  }
};
