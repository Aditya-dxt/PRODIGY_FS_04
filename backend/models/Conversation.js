const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: [(arr) => arr.length === 2, "A conversation must have exactly 2 participants"],
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate conversations between the same two users
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
