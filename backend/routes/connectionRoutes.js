const express = require("express");
const {
  getMyRequests,
  sendRequest,
  respondToRequest,
  getConnectionStatus,
} = require("../controllers/connectionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/requests", getMyRequests);
router.get("/status/:userId", getConnectionStatus);
router.post("/", sendRequest);
router.patch("/:id", respondToRequest);

module.exports = router;
