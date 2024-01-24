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

// chatRouter.route("/").post(protect, accessChat);
// chatRouter.route("/").get(protect, fetchChats);
// chatRouter.route("/group").post(protect, createGroupChat);
// chatRouter.route("/rename").put(protect, renameGroup);
// chatRouter.route("/remove").delete(protect, removeFromGroup);
// chatRouter.route("/groupadd").put(protect, addToGroup);

// module.exports = chatRouter;

import express from "express";
import {
  accessChat,
  createGroupChat,
  fetchMyChats,
  renameGroup,
} from "./chat.controllers";
import { isVerified, protect } from "../../../middlewares/userAuth";
export const chatRouter = express.Router();

chatRouter.post("/", protect, isVerified(), accessChat);
chatRouter.get("/", protect, isVerified(), fetchMyChats);
chatRouter.put("/:id/rename", protect, isVerified(), renameGroup);
chatRouter.post("/group", protect, isVerified(), createGroupChat);
