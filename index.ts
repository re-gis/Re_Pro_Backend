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
// Postgres
// const connectionUrl =
//   "postgres://merci:6OLP6t3tLKfsY5pAcbi1b4Tq9mTb7zrp@dpg-cleteurl00ks739tmgd0-a.oregon-postgres.render.com/re_pro";

// createConnection({
//   type: "postgres",
//   url: connectionUrl,
//   synchronize: true,
//   logging: true,
//   entities: ["dist/entities/*.js"],
// })
//   .then((conn) => {
//     console.log("Connected successfully to PostgreSQL...");
//   })
//   .catch((error) => {
//     console.error("Error connecting to PostgreSQL:", error);
//   });

createConnection()
  .then((con) => console.log("Postgres connected successfully!"))
  .catch((e) => console.log(e));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// static files
app.use("/uploads", express.static("uploads"));

// Fileuploader
app.use(
  fileUploader({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Connect database

connectDatabase()// MongoDB
// connectDB(); // MySQL

// Swagger documentation

// app.use("/documentation", swaggerUi.serve, swaggerUi.setup());

/* Upload a document
   ----------------- */



// // Upload a document
// app.post("/api/docs/:user/create", upload, async (req:IRequest, res:IResponse) => {
//   try {
//     const user = req.params.user; // Make sure this is what you intend.

//     if (!user) {
//       return res.status(400).json({ message: "User not found!" });
//     }

//     if (user !== req.params.user) {
//       return res.status(404).json({ message: "Cannot perform this action!" });
//     }

//     if (!req.file) {
//       return res.status(403).json({
//         message: "Please select a document to upload",
//       });
//     }

//     // Save the link to database
//     const docPath = path.join(__dirname, "uploads", req.file.filename);
//     const { receiver, details, subject, church } = req.body;

//     const sql = `INSERT INTO documents (
//       receiver,
//       reporter,
//       details,
//       subject,
//       path,
//       doc_name,
//       church
//     ) VALUES (
//       '${receiver}',
//       '${user}',
//       '${details}',
//       '${subject}',
//       '${docPath}',
//       '${req.file.filename}',
//       '${church}'
//     )`;

//     conn.query(sql, (err, result) => {
//       if (err) {
//         console.log(err);
//         return res.status(400).json({ message: "Error saving to database" });
//       }
//       const query = `SELECT * FROM documents WHERE reporter='${user}'`;
//       conn.query(query, (err, data) => {
//         if (err)
//           return res.status(500).json({ message: "Internal server error..." });
//         if (data.length === 0)
//           return res.status(400).json({ message: "Document not found!" });
//         res.json({ doc: data, message: "File uploaded successfully" });
//       });
//     });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ message: "Internal server error..." });
//   }
// });

/* ----------------------------------------------------------- */

// /* Download the document */
// app.get("/api/docs/:user/doc/:id/download", protect, (req, res) => {
//   const sql = `SELECT * FROM documents WHERE id='${req.params.id}'`;
//   conn.query(sql, (err, result) => {
//     if (err) {
//       console.log(err);
//       return res.status(400).json({ message: "Error downloading file" });
//     }
//     if (result.length === 0)
//       return res.status(400).json({ message: "Document not found!" });
//     const path = result[0].path;
//     return res.status(200).download(path);
//   });
// });

/* ---------------------------------------------------------------- */

// app.use("/api/docs", documentRouter);

// Use cors
app.use(cors());

// user apis
app.use("/api/users", userRouter);

// Currency apis
// app.use("/api/currency", currencyRouter);

// Room chat apis
// app.use("/api/chat", require("./routes/chat.routes"));

const server = app.listen(process.env.PORT, () => {
  console.log(`server listening port ${process.env.PORT}`);
});

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

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
          const fileBuffer = Buffer.from(data.file.data);
          const filename = Date.now() + "-" + data.file.name;

          fs.writeFileSync("./uploads/" + filename, fileBuffer);
          socket.emit("file-uploaded", { url: `/uploads/${filename}` });
          socket.emit("new-file-message", { url: `/uploads/${filename}` });
        }
      );

      socket.off("setup", (userData: { _id: string }) => {
        console.log("disconnected");
        socket.leave(userData._id);
      });
    }
  );
});
