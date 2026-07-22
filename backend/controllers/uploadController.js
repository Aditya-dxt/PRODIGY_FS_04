const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const MAX_SIZE = 8 * 1024 * 1024; // 8MB

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
});

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

exports.uploadMiddleware = upload.single("file");

exports.handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileType = IMAGE_TYPES.includes(req.file.mimetype) ? "image" : "file";

  res.status(201).json({
    success: true,
    attachment: {
      url: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType,
    },
  });
};
