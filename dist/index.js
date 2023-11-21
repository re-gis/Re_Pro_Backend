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
const user_routes_1 = require("./routes/user.routes");
const postgres_1 = __importDefault(require("./config/postgres/postgres"));
// const conn = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "re_pro",
// });
// Postgres
(0, postgres_1.default)();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
// static files
app.use("/uploads", express_1.default.static("uploads"));
// Fileuploader
app.use((0, express_fileupload_1.default)({
    useTempFiles: true,
    tempFileDir: "/tmp/",
}));
// Connect database
// connectDatabase(); // MongoDB
// connectDB(); // MySQL
// Swagger documentation
// app.use("/documentation", swaggerUi.serve, swaggerUi.setup());
/* Upload a document
   ----------------- */
// Multer
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads");
//   },
//   filename: function (req, file, cb) {
//     const ext = file.originalname.split(".");
//     const e = ext[ext.length - 1];
//     // console.log(ext[ext.length-1])
//     cb(null, `${file.originalname}.${e}`);
//   },
// });
// // Upload a document
// const upload = multer({ storage: storage }).single("file");
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
app.use((0, cors_1.default)());
// user apis
app.use("/api/users", user_routes_1.userRouter);
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
