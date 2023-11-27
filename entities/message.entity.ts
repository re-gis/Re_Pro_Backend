import mongoose from "mongoose";

const messageModel = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model("Message", messageModel);
