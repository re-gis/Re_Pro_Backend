const mysql = require("mysql");

// const { Chat } = require("../models/chat.Model");
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "re_pro",
});

const Chat = require("../models/chat.Model");

const accessChat = async (req, res) => {
  const { userNum } = req.body;
  if (!userNum) return res.status(400).send({ message: "No user number!" });
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: user.number } } },
      { users: { $elemMatch: { $eq: userNum } } },
    ],
  });

  if (isChat.length === 0) {
    const name = user.name;
    // Create a new chat
    const newChat = new Chat({
      users: [user.number, userNum],
      groupAdmin: user.number,
    });
    await newChat.save();
    isChat = newChat;
    return res.status(200).send({ chat: isChat });
  }

  return res.status(200).send({ chat: isChat });
};

const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: user.number } },
    }).sort({ updatedAt: -1 });

    if (chats.length === 0)
      return res.status(400).send({ message: "No chats found!" });

    return res.status(200).send(chats);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error..." });
  }
};

const createGroupChat = async (req, res) => {
  try {
    if (!req.body.users || !req.body.name)
      return res.status(403).send({ message: "All inputs are required!" });
    let { name, users } = req.body;
    if (users.length <= 2)
      return res.status(403).send({
        message: "More than two members are required to form a group chat!",
      });

    const grpValid = await Chat.findOne({ name });
    if (!grpValid) {return res.status({ message: "Group name taken!" })};
    // Create chat group
    users.push(user.number);
    const group = await Chat.create({
      chatName: name,
      users: users,
      isGroupChat: true,
      groupAdmin: user.number,
    });
    if (!group)
      return res.status(500).send({ message: "Internal server error..." });
    return res.status(201).send({ message: "Chat created!", chat: group });
  } catch (error) {
    console.log(error);
  }
};

const renameGroup = async (req, res) => {};

const removeFromGroup = async (req, res) => {};

const addToGroup = async (req, res) => {};

module.exports = {
  accessChat,
  renameGroup,
  addToGroup,
  fetchChats,
  createGroupChat,
  removeFromGroup,
};
