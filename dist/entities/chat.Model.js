"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const chatModel = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Message",
    },
    groupAdmin: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
exports.Chat = mongoose_1.default.model("Chat", chatModel);
