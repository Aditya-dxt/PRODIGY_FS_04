const express = require("express");
const { getConversations, startConversation } = require("../controllers/conversationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.route("/").get(getConversations).post(startConversation);

module.exports = router;
