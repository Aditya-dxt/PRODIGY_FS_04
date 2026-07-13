const express = require("express");
const {
  getMyRequests,
  sendRequest,
  respondToRequest,
} = require("../controllers/connectionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/requests", getMyRequests);
router.post("/", sendRequest);
router.patch("/:id", respondToRequest);

module.exports = router;