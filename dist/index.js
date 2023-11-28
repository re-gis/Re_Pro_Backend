"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable */
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const user_routes_1 = require("./modules/users/user.routes");
const typeorm_1 = require("typeorm");
const db_1 = require("./config/mongodb/db");
const admin_routes_1 = require("./modules/admin/admin.routes");
const documents_routes_1 = require("./modules/documents/documents.routes");
const chat_routes_1 = require("./modules/chats/chat.routes");
// Fileuploader
app.use((0, express_fileupload_1.default)({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 1024 * 1024 * 1024 },
    safeFileNames: true,
    preserveExtension: true,
}));
(0, typeorm_1.createConnection)()
    .then((con) => console.log("Postgres connected successfully!"))
    .catch((e) => console.log(e));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
// static files
app.use("/uploads", express_1.default.static("uploads"));
// Connect database
(0, db_1.connectDatabase)(); // MongoDB
// Swagger documentation
// app.use("/documentation", swaggerUi.serve, swaggerUi.setup());
app.use("/api/documents", documents_routes_1.documentRouter);
// Use cors
app.use((0, cors_1.default)());
// user apis
app.use("/api/users", user_routes_1.userRouter);
// admin apis
app.use("/api/admin", admin_routes_1.adminRouter);
// Currency apis
// app.use("/api/currency", currencyRouter);
// Room chat apis
app.use("/api/chat", chat_routes_1.chatRouter);
const server = app.listen(process.env.PORT, () => {
    console.log(`server listening port ${process.env.PORT}`);
});
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});
//@ts-ignore
server.maxHttpBufferSize = 1e8;
io.on("connection", (socket) => {
    console.log("connected");
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });
    socket.on("join chat", (room) => {
        socket.join(room);
        console.log(`User joined room ${room}`);
    });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
    socket.on("new message", (newMsgReceived) => {
        var chat = newMsgReceived.chat;
        if (!chat.users)
            return console.log("Chat users not defined!");
        chat.users.forEach((user) => {
            if (user._id === newMsgReceived.jsoner._id)
                return;
            socket.in(user._id).emit("message received", newMsgReceived);
        });
        socket.on("file", (data) => {
            const fileBuffer = Buffer.from(data.file.data);
            const filename = Date.now() + "-" + data.file.name;
            fs_1.default.writeFileSync("./uploads/" + filename, fileBuffer);
            socket.emit("file-uploaded", { url: `/uploads/${filename}` });
            socket.emit("new-file-message", { url: `/uploads/${filename}` });
        });
        socket.off("setup", (userData) => {
            console.log("disconnected");
            socket.leave(userData._id);
        });
    });
});
