const express = require("express");
const { register, login, getMe, searchUsers } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/users", protect, searchUsers);

module.exports = router;
