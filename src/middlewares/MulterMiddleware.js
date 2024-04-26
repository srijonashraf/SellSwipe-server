import multer from "multer";
import path from "path";
import fs from "fs";
const UPLOAD_DESTINATION = "./uploads";

//Create folder if its not exist
fs.mkdirSync(UPLOAD_DESTINATION, { recursive: true });

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
    cb(null, fileName + Date.now() + fileExt);
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000,
  },

  //Set file filter
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg, .jpeg, format allowed"));
    }
  },
});
