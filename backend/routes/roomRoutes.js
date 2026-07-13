const express = require("express");
const { getRooms, createRoom, joinRoom, leaveRoom } = require("../controllers/roomController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.route("/").get(getRooms).post(createRoom);
router.post("/:id/join", joinRoom);
router.post("/:id/leave", leaveRoom);

module.exports = router;
