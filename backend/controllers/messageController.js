const Message = require("../models/Message");
const Room = require("../models/Room");
const Conversation = require("../models/Conversation");

// @route GET /api/messages/room/:roomId
exports.getRoomMessages = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const isMember = room.members.some(
      (m) => m.toString() === req.user._id.toString(),
    );

    const query = { room: req.params.roomId };
    if (!isMember) {
      query.createdAt = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
    }

    const messages = await Message.find(query)
      .populate("sender", "name avatarColor")
      .sort({ createdAt: 1 })
      .limit(200);

    res
      .status(200)
      .json({ success: true, messages, isMember, readOnly: !isMember });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch messages", error: error.message });
  }
};

// @route GET /api/messages/conversation/:conversationId
exports.getConversationMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (
      !conversation.participants.some(
        (p) => p.toString() === req.user._id.toString(),
      )
    ) {
      return res
        .status(403)
        .json({ message: "You are not part of this conversation" });
    }

    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate("sender", "name avatarColor")
      .sort({ createdAt: 1 })
      .limit(200);

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch messages", error: error.message });
  }
};
