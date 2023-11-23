const express = require("express");
const protect = require("../../middlewares/userAuth");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
} = require("../controllers/chat.controllers");
const chatRouter = express.Router();

chatRouter.route("/").post(protect, accessChat);
chatRouter.route("/").get(protect, fetchChats);
chatRouter.route("/group").post(protect, createGroupChat);
chatRouter.route("/rename").put(protect, renameGroup);
chatRouter.route("/remove").delete(protect, removeFromGroup);
chatRouter.route("/groupadd").put(protect, addToGroup);

module.exports = chatRouter;
