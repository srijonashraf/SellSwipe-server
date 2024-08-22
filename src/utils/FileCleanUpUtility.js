import fs from "fs";
export const removeUnusedLocalFile = (filePath) => {
  if (filePath) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(
          `Failed to delete unused local file: ${filePath}. Error: ${err.message}`
        );
        return;
      }
      console.log("Successfully deleted unused local files");
    });
  }
};
