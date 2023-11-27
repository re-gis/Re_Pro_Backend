"use strict";
// const express = require("express");
// const protect = require("../../middlewares/userAuth");
// const {
//   accessChat,
//   fetchChats,
//   createGroupChat,
//   renameGroup,
//   removeFromGroup,
//   addToGroup,
// } = require("../controllers/chat.controllers");
// const chatRouter = express.Router();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
// chatRouter.route("/").post(protect, accessChat);
// chatRouter.route("/").get(protect, fetchChats);
// chatRouter.route("/group").post(protect, createGroupChat);
// chatRouter.route("/rename").put(protect, renameGroup);
// chatRouter.route("/remove").delete(protect, removeFromGroup);
// chatRouter.route("/groupadd").put(protect, addToGroup);
// module.exports = chatRouter;
const express_1 = __importDefault(require("express"));
const chat_controllers_1 = require("./chat.controllers");
const userAuth_1 = require("../../middlewares/userAuth");
exports.chatRouter = express_1.default.Router();
exports.chatRouter.post("/", userAuth_1.protect, (0, userAuth_1.isVerified)(), chat_controllers_1.accessChat);
exports.chatRouter.get("/", userAuth_1.protect, (0, userAuth_1.isVerified)(), chat_controllers_1.fetchMyChats);
exports.chatRouter.put("/:id/rename", userAuth_1.protect, (0, userAuth_1.isVerified)(), chat_controllers_1.renameGroup);
exports.chatRouter.post("/group", userAuth_1.protect, (0, userAuth_1.isVerified)(), chat_controllers_1.createGroupChat);
