const ChatRoom = require("../models/ChatRoom/chat.room.model");

const createRoom = async(rq, rs) => {
    if(!user) return res.status(401).send({message: 'User not found!'})
    try {
        const {name} = rq.body;
        if(!name) return rs.status(400).send({message: 'Chatroom name is required'})
        const createdBy = user.name;
        const newRoom = await ChatRoom.create({ name, createdBy });
        const roomId = newRoom._id;

        const message = "Chat room created successfully.";
        return rs.status(201).json({ roomId, message });
    } catch (error) {
        console.log(error)
        return rs.status(500).send({message: 'Error creating room'})
    }
}


const getRooms = async(rq, rs) => {
    console.log('get rooms')
}


const getRoomById = async(rq, rs)=> {
    console.log('Get room by id')
}


const joinRoom = async(rq, rs) => {
    console.log('Join room')
}


const leaveRoom = async(rq, rs) => {
    console.log('Leave room')
}

const getRoomMessages = async(rq, rs) => {
    console.log('Get room messages')
}

const sendMessage = async(rq, rs) => {
    console.log('Send message')
}



module.exports = {
    createRoom,
    getRooms,
    getRoomById,
    joinRoom,
    leaveRoom,
    getRoomMessages,
    sendMessage
}