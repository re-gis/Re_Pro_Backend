import mongoose from "mongoose";

const chatModel = new mongoose.Schema(
  {
    chatName: {
      type: String,
      trim: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        type: String,
        required: true,
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.model("Chat", chatModel);
