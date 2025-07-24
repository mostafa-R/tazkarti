import fs from "fs";
import multer from "multer";

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const eventUpload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");

    if (isImage || isVideo) cb(null, true);
    else cb(new Error("Invalid file type"), false);
  },
});

export const uploadEventMedia = eventUpload.fields([
  { name: "images", maxCount: 10 },
  { name: "trailerVideo", maxCount: 1 },
]);
