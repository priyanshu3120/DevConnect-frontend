const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxLength: 2000,
    },
  },
  { timestamps: true }
);

chatSchema.index({ senderId: 1, receiverId: 1 });
chatSchema.index({ createdAt: -1 });

const ChatMessage = mongoose.model("ChatMessage", chatSchema);

module.exports = ChatMessage;
