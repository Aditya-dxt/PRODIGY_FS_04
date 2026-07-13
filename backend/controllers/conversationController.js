const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// @route GET /api/conversations — list current user's DM threads
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate("participants", "name email avatarColor isOnline lastSeen")
      .sort({ lastMessageAt: -1 });

    const withLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({ conversation: conv._id }).sort({
          createdAt: -1,
        });
        const otherUser = conv.participants.find(
          (p) => p._id.toString() !== req.user._id.toString()
        );
        return {
          _id: conv._id,
          otherUser,
          lastMessage,
          lastMessageAt: conv.lastMessageAt,
        };
      })
    );

    res.status(200).json({ success: true, conversations: withLastMessage });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch conversations", error: error.message });
  }
};

// @route POST /api/conversations  { userId }  — get or create a DM thread with someone
exports.startConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot start a conversation with yourself" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId], $size: 2 },
    }).populate("participants", "name email avatarColor isOnline lastSeen");

    if (!conversation) {
      conversation = await Conversation.create({ participants: [req.user._id, userId] });
      conversation = await conversation.populate(
        "participants",
        "name email avatarColor isOnline lastSeen"
      );
    }

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({ message: "Failed to start conversation", error: error.message });
  }
};
