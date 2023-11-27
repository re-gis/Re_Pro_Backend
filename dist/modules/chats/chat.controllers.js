"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameGroup = exports.createGroupChat = exports.fetchMyChats = exports.accessChat = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = __importDefault(require("../../entities/User.entity"));
const chat_Model_1 = require("../../entities/chat.Model");
const accessChat = async (req, res) => {
    try {
        const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
        const { userNum } = req.body;
        const user = req.user;
        const lU = await userRepo.findOne({ where: { email: user.email } });
        if (!lU)
            return res.status(404).json({ message: "User nto found!" });
        if (!userNum)
            return res.status(400).json({ message: "No user number!" });
        // check if user is valid
        const euser = await userRepo.findOne({ where: { number: userNum } });
        if (!euser) {
            return res.status(404).json({ message: `User ${userNum} not found!` });
        }
        let isChat = await chat_Model_1.Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: lU.number } } },
                { users: { $elemMatch: { $eq: userNum } } },
            ],
        });
        if (isChat.length === 0) {
            const name = lU.name;
            // Create a new chat
            const newChat = new chat_Model_1.Chat({
                users: [lU.number, userNum],
                groupAdmin: lU.number,
            });
            await newChat.save();
            return res.status(200).json({ chat: newChat });
        }
        return res.status(200).json({ chat: isChat });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error..." });
    }
};
exports.accessChat = accessChat;
const fetchMyChats = async (req, res) => {
    try {
        const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
        const user = req.user;
        const lU = await userRepo.findOne({ where: { email: user.email } });
        if (!lU)
            return res.status(404).json({ message: "User not found!" });
        const chats = await chat_Model_1.Chat.find({
            users: { $elemMatch: { $eq: lU.number } },
        }).sort({ updatedAt: -1 });
        if (chats.length === 0)
            return res.status(400).json({ message: "No chats found!" });
        return res.status(200).json(chats);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error..." });
    }
};
exports.fetchMyChats = fetchMyChats;
const createGroupChat = async (req, res) => {
    try {
        const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
        const user = req.user;
        const lU = await userRepo.findOne({ where: { email: user.email } });
        if (!lU)
            return res.status(404).json({ message: "User not found!" });
        if (!req.body.users || !req.body.name)
            return res.status(400).json({ message: "All inputs are required!" });
        let name = req.body.name;
        let users = req.body.users;
        // existence of the users
        let i;
        for (i = 0; i < users.length; i++) {
            const u = await userRepo.findOne({ where: { number: users[i] } });
            if (!u)
                return res.status(404).json({ message: `User ${users[i]} not found!` });
        }
        if (users.length <= 2)
            return res.status(400).json({
                message: "More than two members are required to form a group chat!",
            });
        const grpValid = await chat_Model_1.Chat.findOne({ name });
        if (grpValid)
            return res.status(400).json({ message: "Group name already taken!" });
        // Create chat group
        users.push(lU.number);
        const group = await chat_Model_1.Chat.create({
            chatName: name,
            users: users,
            isGroupChat: true,
            groupAdmin: lU.number,
        });
        if (!group)
            return res.status(500).json({ message: "Internal server error..." });
        return res.status(201).json({ message: "Chat created!", chat: group });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error..." });
    }
};
exports.createGroupChat = createGroupChat;
const renameGroup = async (req, res) => {
    try {
        const { chatName } = req.body;
        const chatId = req.params.id;
        const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
        const user = req.user;
        const lUser = await userRepo.findOne({ where: { email: user.email } });
        if (!lUser)
            return res.status(404).json({ message: "User not found!" });
        if (!chatId)
            return res.status(500).json({ message: "Something occurred!" });
        if (!chatName)
            return res.status(400).json({ message: "Chat name required!" });
        // check if the one to update is the owner
        const eChat = await chat_Model_1.Chat.findById(chatId);
        if (!eChat)
            return res.status(404).json({ message: `Chat ${chatId} not found!` });
        if (eChat.groupAdmin != lUser.number)
            return res
                .status(403)
                .json({ message: "You are not authorised to perform this action..." });
        const updatedChat = await chat_Model_1.Chat.findByIdAndUpdate(chatId, {
            chatName,
        }, {
            new: true,
        });
        return res.status(201).json({ message: "Updated chat", updatedChat });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error..." });
    }
};
exports.renameGroup = renameGroup;
// const removeFromGroup = async (req, res) => {};
// const addToGroup = async (req, res) => {};
// module.exports = {
//   accessChat,
//   renameGroup,
//   addToGroup,
//   fetchChats,
//   createGroupChat,
//   removeFromGroup,
// };
