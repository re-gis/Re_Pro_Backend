/* eslint-disable */
require("dotenv").config();
import express from "express";
const app = express();
import swaggerUi from "swagger-ui-express";
import fileUploader from "express-fileupload";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import { Socket } from "socket.io";
import { userRouter } from "./modules/users/user.routes";
import { createConnection } from "typeorm";
import { connectDatabase } from "./config/mongodb/db";
import { adminRouter } from "./modules/admin/admin.routes";
import { documentRouter } from "./modules/documents/documents.routes";
import { chatRouter } from "./modules/currency/chats/chat.routes";
import http from "http";
import { currencyRouter } from "./modules/currency/currency.routes";
// Fileuploader
app.use(
  fileUploader({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 1024 * 1024 * 1024 },
    safeFileNames: true,
    preserveExtension: true,
  })
);

createConnection()
  .then((con) => console.log("Postgres connected successfully!"))
  .catch((e) => console.log(e));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// static files
app.use("/uploads", express.static("uploads"));

// Connect database

connectDatabase(); // MongoDB

// Swagger documentation

// app.use("/documentation", swaggerUi.serve, swaggerUi.setup());

app.use("/api/documents", documentRouter);

// Use cors
app.use(cors());

// user apis
app.use("/api/users", userRouter);

// admin apis
app.use("/api/admin", adminRouter);

// Currency apis
app.use("/api/currency", currencyRouter);

// Room chat apis
app.use("/api/chat", chatRouter);

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

io.on("connection", (socket: Socket) => {
  console.log("connected");

  socket.on("setup", (userData: { _id: string }) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room: string) => {
    socket.join(room);
    console.log(`User joined room ${room}`);
  });

  socket.on("typing", (room: string) => socket.in(room).emit("typing"));

  socket.on("stop typing", (room: string) =>
    socket.in(room).emit("stop typing")
  );

  socket.on(
    "new message",
    (newMsgReceived: {
      chat: { users: { _id: string }[] };
      jsoner: { _id: string };
    }) => {
      var chat = newMsgReceived.chat;

      if (!chat.users) return console.log("Chat users not defined!");
      chat.users.forEach((user) => {
        if (user._id === newMsgReceived.jsoner._id) return;
        socket.in(user._id).emit("message received", newMsgReceived);
      });

      socket.on(
        "file",
        (data: { file: { data: Uint8Array; name: string } }) => {
          try {
            const { data: fileData, name: originalFilename } = data.file;

            // Convert Uint8Array to Buffer
            const fileBuffer = Buffer.from(fileData);

            // Generate a unique filename with a timestamp
            const filename = `${Date.now()}-${originalFilename}`;

            // Write the file to the server in the "./uploads/" directory
            const filePath = `./uploads/${filename}`;
            fs.writeFileSync(filePath, fileBuffer);

            // Emit events to the sender
            socket.emit("file-uploaded", { url: `/uploads/${filename}` });
            socket.emit("new-file-message", { url: `/uploads/${filename}` });

            console.log(`File ${originalFilename} uploaded successfully.`);
          } catch (error: any) {
            // Handle any errors that may occur during file processing
            console.error("Error processing file:", error.message);
            socket.emit("file-upload-error", {
              message: "Error processing file.",
            });
          }
        }
      );

      socket.off("setup", (userData: { _id: string }) => {
        console.log("disconnected");
        socket.leave(userData._id);
      });
    }
  );
});
