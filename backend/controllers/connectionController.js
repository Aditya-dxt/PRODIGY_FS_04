const Connection = require("../models/Connection");

// GET /api/connections/requests — incoming pending requests
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Connection.find({ recipient: req.user._id, status: "pending" })
      .populate("requester", "name username avatarColor")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch requests", error: error.message });
  }
};

// POST /api/connections  { recipientId } — explicit "Connect" button, no message required
exports.sendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot connect with yourself" });
    }

    const existing = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId },
        { requester: recipientId, recipient: req.user._id },
      ],
    });
    if (existing) {
      return res.status(409).json({ message: `Connection already ${existing.status}` });
    }

    const connection = await Connection.create({ requester: req.user._id, recipient: recipientId });
    res.status(201).json({ success: true, connection });
  } catch (error) {
    res.status(500).json({ message: "Failed to send request", error: error.message });
  }
};

// PATCH /api/connections/:id  { action: 'accept' | 'reject' }
exports.respondToRequest = async (req, res) => {
  try {
    const { action } = req.body;
    const connection = await Connection.findById(req.params.id);
    if (!connection) return res.status(404).json({ message: "Request not found" });
    if (connection.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to respond to this request" });
    }

    connection.status = action === "accept" ? "accepted" : "rejected";
    await connection.save();
    res.status(200).json({ success: true, connection });
  } catch (error) {
    res.status(500).json({ message: "Failed to respond to request", error: error.message });
  }
};

// Helper used by the socket handler to check connection status between two users
exports.findConnection = (userA, userB) =>
  Connection.findOne({
    $or: [
      { requester: userA, recipient: userB },
      { requester: userB, recipient: userA },
    ],
  });