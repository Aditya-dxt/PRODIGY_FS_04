const express = require("express");
const { uploadMiddleware, handleUpload } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, uploadMiddleware, handleUpload);

module.exports = router;
