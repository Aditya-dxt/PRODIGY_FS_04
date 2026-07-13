const Room = require("../models/Room");

// @route GET /api/rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    const roomsWithMembership = rooms.map((room) => ({
      ...room.toObject(),
      isMember: room.members.some((m) => m.toString() === req.user._id.toString()),
      memberCount: room.members.length,
    }));

    res.status(200).json({ success: true, rooms: roomsWithMembership });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rooms", error: error.message });
  }
};

// @route POST /api/rooms
exports.createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const existing = await Room.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: "A room with this name already exists" });
    }

    const room = await Room.create({
      name: name.trim(),
      description: description || "",
      createdBy: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({ success: true, room });
  } catch (error) {
    res.status(500).json({ message: "Failed to create room", error: error.message });
  }
};

// @route POST /api/rooms/:id/join
exports.joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
    }

    res.status(200).json({ success: true, room });
  } catch (error) {
    res.status(500).json({ message: "Failed to join room", error: error.message });
  }
};

// @route POST /api/rooms/:id/leave
exports.leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.members = room.members.filter((m) => m.toString() !== req.user._id.toString());
    await room.save();

    res.status(200).json({ success: true, message: "Left room" });
  } catch (error) {
    res.status(500).json({ message: "Failed to leave room", error: error.message });
  }
};
