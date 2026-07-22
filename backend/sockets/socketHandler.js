const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Room = require("../models/Room");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Connection = require("../models/Connection");

// Tracks which socket IDs belong to which user, so presence only flips to
// "offline" once ALL of a user's tabs/devices have disconnected.
const socketsByUser = new Map();

function addSocket(userId, socketId) {
  if (!socketsByUser.has(userId)) socketsByUser.set(userId, new Set());
  socketsByUser.get(userId).add(socketId);
}

function removeSocket(userId, socketId) {
  const set = socketsByUser.get(userId);
  if (!set) return true;
  set.delete(socketId);
  if (set.size === 0) {
    socketsByUser.delete(userId);
    return true; // fully offline
  }
  return false;
}

function initSocket(io) {
  // Authenticate every socket connection using the same JWT used for REST calls
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("User no longer exists"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    addSocket(userId, socket.id);

    // Join a personal room so we can push DMs/notifications to this user
    // directly regardless of which room/conversation view they're on.
    socket.join(`user:${userId}`);

    // Auto-join the socket to every room this user is already a member of
    const rooms = await Room.find({ members: userId }).select("_id");
    rooms.forEach((room) => socket.join(`room:${room._id}`));

    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit("presence:update", { userId, isOnline: true });

    // ---- Room subscribe/unsubscribe ----
    // Anyone can subscribe to receive live updates (used for the 24h read-only
    // preview too) — actually SENDING a message is what's gated by membership.
    socket.on("room:subscribe", (roomId) => {
      socket.join(`room:${roomId}`);
    });

    socket.on("room:unsubscribe", (roomId) => {
      socket.leave(`room:${roomId}`);
    });

    // ---- Sending a message (room or DM) ----
    socket.on("message:send", async (payload, ack) => {
      try {
        const { type, targetId, content, attachment } = payload;
        if (!content?.trim() && !attachment?.url) {
          return ack?.({ success: false, message: "Message cannot be empty" });
        }

        let message;

        if (type === "room") {
          const room = await Room.findById(targetId);
          if (!room || !room.members.some((m) => m.toString() === userId)) {
            return ack?.({ success: false, message: "You are not a member of this room" });
          }

          message = await Message.create({
            room: targetId,
            sender: userId,
            content: content || "",
            attachment: attachment || undefined,
          });
          message = await message.populate("sender", "name avatarColor");

          io.to(`room:${targetId}`).emit("message:new", { type: "room", roomId: targetId, message });
        } else if (type === "dm") {
          const conversation = await Conversation.findById(targetId);
          if (!conversation || !conversation.participants.some((p) => p.toString() === userId)) {
            return ack?.({ success: false, message: "You are not part of this conversation" });
          }

          const otherId = conversation.participants
            .find((p) => p.toString() !== userId)
            .toString();

          let connection = await Connection.findOne({
            $or: [
              { requester: userId, recipient: otherId },
              { requester: otherId, recipient: userId },
            ],
          });

          const isConnected = connection?.status === "accepted";

          if (!isConnected) {
            if (connection?.status === "rejected") {
              return ack?.({
                success: false,
                message: "This connection request was declined — you can no longer message this user.",
              });
            }

            const messageCount = await Message.countDocuments({ conversation: targetId });
            if (messageCount >= 1) {
              return ack?.({
                success: false,
                message:
                  "You've already sent your one message — waiting for them to accept your connection request.",
              });
            }

            // The very first message to a stranger doubles as a connection request
            if (!connection) {
              connection = await Connection.create({ requester: userId, recipient: otherId });
            }
          }

          message = await Message.create({
            conversation: targetId,
            sender: userId,
            content: content || "",
            attachment: attachment || undefined,
          });
          message = await message.populate("sender", "name avatarColor");

          conversation.lastMessageAt = new Date();
          await conversation.save();

          conversation.participants.forEach((participantId) => {
            io.to(`user:${participantId}`).emit("message:new", {
              type: "dm",
              conversationId: targetId,
              message,
            });
          });
        } else {
          return ack?.({ success: false, message: "Invalid message type" });
        }

        ack?.({ success: true, message });
      } catch (err) {
        ack?.({ success: false, message: "Failed to send message" });
      }
    });

    // ---- Typing indicators ----
    socket.on("typing:start", ({ type, targetId }) => {
      const event = { userId, name: socket.user.name, type, targetId };
      if (type === "room") {
        socket.to(`room:${targetId}`).emit("typing:update", { ...event, isTyping: true });
      } else {
        socket.to(`user:${targetId}`).emit("typing:update", { ...event, isTyping: true });
      }
    });

    socket.on("typing:stop", ({ type, targetId }) => {
      const event = { userId, name: socket.user.name, type, targetId };
      if (type === "room") {
        socket.to(`room:${targetId}`).emit("typing:update", { ...event, isTyping: false });
      } else {
        socket.to(`user:${targetId}`).emit("typing:update", { ...event, isTyping: false });
      }
    });

    // ---- Disconnect ----
    socket.on("disconnect", async () => {
      const fullyOffline = removeSocket(userId, socket.id);
      if (fullyOffline) {
        const lastSeen = new Date();
        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });
        io.emit("presence:update", { userId, isOnline: false, lastSeen });
      }
    });
  });
}

module.exports = initSocket;
