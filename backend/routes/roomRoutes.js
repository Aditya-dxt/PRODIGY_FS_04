const express = require("express");
const {
  getRooms,
  searchByCode,
  createRoom,
  getRoomDetail,
  requestToJoin,
  respondToJoinRequest,
} = require("../controllers/roomController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", getRooms);
router.get("/search", searchByCode);
router.post("/", createRoom);
router.get("/:id", getRoomDetail);
router.post("/:id/request", requestToJoin);
router.patch("/:id/requests/:userId", respondToJoinRequest);

module.exports = router;
