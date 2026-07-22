const Room = require("../models/Room");

const isMember = (room, userId) => room.members.some((m) => m.toString() === userId.toString());
const hasRequested = (room, userId) =>
  room.joinRequests.some((r) => r.user.toString() === userId.toString());

const shapeRoom = (room, userId) => ({
  _id: room._id,
  name: room.name,
  description: room.description,
  memberCount: room.members.length,
  isMember: isMember(room, userId),
  hasRequested: hasRequested(room, userId),
  isAdmin: room.createdBy._id
    ? room.createdBy._id.toString() === userId.toString()
    : room.createdBy.toString() === userId.toString(),
  pendingRequestCount: room.joinRequests.length,
});

// @route GET /api/rooms
// If the user isn't in any room yet: show the most popular rooms as suggestions.
// Once they've joined at least one room: show ONLY the rooms they're in.
exports.getRooms = async (req, res) => {
  try {
    const myRoomsCount = await Room.countDocuments({ members: req.user._id });

    let rooms;
    if (myRoomsCount === 0) {
      rooms = await Room.find().populate("createdBy", "name");
      rooms = rooms.sort((a, b) => b.members.length - a.members.length).slice(0, 8);
    } else {
      rooms = await Room.find({ members: req.user._id }).populate("createdBy", "name");
    }

    const shaped = rooms.map((room) => shapeRoom(room, req.user._id));
    res.status(200).json({ success: true, rooms: shaped });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rooms", error: error.message });
  }
};

// @route GET /api/rooms/search?code=ABC123
exports.searchByCode = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ message: "A room code is required" });

    const room = await Room.findOne({ code: code.toUpperCase() }).populate("createdBy", "name");
    if (!room) return res.status(404).json({ message: "No room found with that code" });

    res.status(200).json({ success: true, room: shapeRoom(room, req.user._id) });
  } catch (error) {
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};

// @route POST /api/rooms
exports.createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Room name is required" });

    const existing = await Room.findOne({ name: name.trim() });
    if (existing) return res.status(409).json({ message: "A room with this name already exists" });

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

// @route GET /api/rooms/:id — full detail for the info panel, includes join requests if admin
exports.getRoomDetail = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("createdBy", "name")
      .populate("joinRequests.user", "name username avatarColor");
    if (!room) return res.status(404).json({ message: "Room not found" });

    const admin = room.createdBy._id.toString() === req.user._id.toString();
    const shaped = shapeRoom(room, req.user._id);

    res.status(200).json({
      success: true,
      room: {
        ...shaped,
        code: shaped.isMember ? room.code : undefined,
        joinRequests: admin ? room.joinRequests : [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch room", error: error.message });
  }
};

// @route POST /api/rooms/:id/request — send a join request
exports.requestToJoin = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (isMember(room, req.user._id)) {
      return res.status(400).json({ message: "You're already a member" });
    }
    if (hasRequested(room, req.user._id)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    room.joinRequests.push({ user: req.user._id });
    await room.save();

    res.status(200).json({ success: true, message: "Join request sent" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send request", error: error.message });
  }
};

// @route PATCH /api/rooms/:id/requests/:userId — admin only, accept or reject
exports.respondToJoinRequest = async (req, res) => {
  try {
    const { action } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the room admin can respond to requests" });
    }

    room.joinRequests = room.joinRequests.filter(
      (r) => r.user.toString() !== req.params.userId
    );

    if (action === "accept" && !isMember(room, req.params.userId)) {
      room.members.push(req.params.userId);
    }

    await room.save();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to respond to request", error: error.message });
  }
};
