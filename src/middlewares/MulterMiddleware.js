import multer from "multer";
import path from "path";
import fs from "fs";
const UPLOAD_DESTINATION = "./uploads";

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOAD_DESTINATION)) {
  try {
    fs.mkdirSync(UPLOAD_DESTINATION);
    console.log(`Uploads directory created at ${UPLOAD_DESTINATION}`);
  } catch (err) {
    console.error(`Error creating uploads directory: ${err.message}`);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DESTINATION);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName = file.originalname
      .replace(fileExt, "")
      .toLowerCase()
      .split(" ")
      .join("-");
    cb(null, fileName + "-" + Date.now() + fileExt);
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000, //1MB
  },

  //Set file filter
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpg", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg, .jpeg, png format allowed"));
    }
  },
});
