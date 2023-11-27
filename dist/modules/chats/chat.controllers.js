"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessChat = void 0;
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
// const fetchChats = async (req, res) => {
//   try {
//     const chats = await Chat.find({
//       users: { $elemMatch: { $eq: user.number } },
//     }).sort({ updatedAt: -1 });
//     if (chats.length === 0)
//       return res.status(400).send({ message: "No chats found!" });
//     return res.status(200).send(chats);
//   } catch (error) {
//     return res.status(500).send({ message: "Internal server error..." });
//   }
// };
// const createGroupChat = async (req, res) => {
//   try {
//     if (!req.body.users || !req.body.name)
//       return res.status(400).send({ message: "All inputs are required!" });
//     let { name, users } = req.body;
//     if (users.length <= 2)
//       return res.status(400).send({
//         message: "More than two members are required to form a group chat!",
//       });
//     const grpValid = await Chat.findOne({ name });
//     if (grpValid)
//       return res.status(400).send({ message: "Group name already taken!" });
//     // Create chat group
//     users.push(user.number);
//     const group = await Chat.create({
//       chatName: name,
//       users: users,
//       isGroupChat: true,
//       groupAdmin: user.number,
//     });
//     if (!group)
//       return res.status(500).send({ message: "Internal server error..." });
//     return res.status(201).send({ message: "Chat created!", chat: group });
//   } catch (error) {
//     console.log(error);
//   }
// };
// const renameGroup = async (req, res) => {
//   try {
//     const { chatId, chatName } = req.body;
//     if (!chatId)
//       return res.status(500).send({ message: "Something occurred!" });
//     if (!chatName)
//       return res.status(400).send({ message: "Chat name required!" });
//     const updatedChat = await Chat.findByIdAndUpdate(
//       chatId,
//       {
//         chatName,
//       },
//       {
//         new: true,
//       }
//     );
//     // get the chat
//     const chat = await Chat.findById(chatId);
//     if (!chat) return res.status(400).send({ message: "Something occurred!" });
//     return res.status(201).send({ message: "Updated chat", chat });
//   } catch (error) {
//     return res.status(500).send({ message: "Internal server error..." });
//   }
// };
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
