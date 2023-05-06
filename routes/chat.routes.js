const express = require('express');
const chatRouter = express.Router();
const { createRoom, getRooms, getRoomById, joinRoom, leaveRoom, getRoomMessages, sendMessage } = require('../controllers/chat.controllers');
const protect = require('../middlewares/userAuth');

// create room
chatRouter.post('/room/create', protect,createRoom)

// get rooms
chatRouter.get('/rooms', getRooms)

// get room by id
chatRouter.get('/room/:id', getRoomById)

// join room
chatRouter.post('/room/:id/join', joinRoom)

// leave room
chatRouter.post('/room/:id/leave', leaveRoom)

// get room messages
chatRouter.get('/room/:id/messages', getRoomMessages)

// send message
chatRouter.post('/room/:id/message', sendMessage)





module.exports = chatRouter;


