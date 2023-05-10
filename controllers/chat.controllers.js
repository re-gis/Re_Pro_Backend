const ChatRoom = require("../models/ChatRoom/chat.room.model");

// Create chatroom
const createRoom = async (rq, rs) => {
  if (!user) return rs.status(401).send({ message: "User not found!" });
  try {
    const { name } = rq.body;
    if (!name)
      return rs.status(400).send({ message: "Chatroom name is required" });
    const createdBy = user.name;
    // Check if the name is available
    const chatName = await ChatRoom.findOne({ name });

    if (chatName)
      return rs.status(400).send({ message: "Chat room name not available!" });
    const newRoom = await ChatRoom.create({ name, createdBy });
    const roomId = newRoom._id;

    const message = "Chat room created successfully.";
    return rs.status(201).json({ roomId, message });
  } catch (error) {
    console.log(error);
    return rs.status(500).send({ message: "Error creating room" });
  }
};

// Get all rooms available
const getRooms = async (rq, rs) => {
  if (!user) return rs.status(400).send({ message: "User not found!" });
  const rooms = await ChatRoom.find();
  if (!rooms)
    return rs.status(400).send({ message: "No chatrooms available..." });
  rs.status(200).send({ rooms });
};

const getRoomById = async (rq, rs) => {
  const roomId = rq.params.id;
  // get room
  const room = await ChatRoom.findById(rq.params.id);
  if (!room)
    return rs.status(400).send({ message: "Room " + roomId + " not found!" });
  return rs.status(200).send({
    chatRoom: room,
    message: "Chat room fetched...",
  });
};

// et my chat rooms
const getMyRooms = async (req, res) => {
  if (!user) return res.status(400).send({ message: "User not found!" });
  if (user.name !== req.params.me)
    return res
      .status(400)
      .send({ message: "Not authorised to perform this action!" });
  // Get user's rooms
  const myRooms = await ChatRoom.find({ createdBy: user.name });
  if (!myRooms) return res.status(400).send({ message: "No chatrooms found!" });
  return res
    .status(200)
    .send({ myChatrooms: myRooms, message: "These are my chat rooms..." });
};

const joinRoom = async (rq, rs) => {
  // const 
};

const leaveRoom = async (rq, rs) => {
  console.log("Leave room");
};

const getRoomMessages = async (rq, rs) => {
  console.log("Get room messages");
};

const sendMessage = async (rq, rs) => {
  console.log("Send message");
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  joinRoom,
  leaveRoom,
  getRoomMessages,
  sendMessage,
  getMyRooms,
};
