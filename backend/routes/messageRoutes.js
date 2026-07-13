const express = require("express");
const { getRoomMessages, getConversationMessages } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/room/:roomId", getRoomMessages);
router.get("/conversation/:conversationId", getConversationMessages);

module.exports = router;
