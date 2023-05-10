const express = require("express");
const userRouter = require("./routes/user.routes");
const connectDatabase = require("./config/mongodb/db");
const app = express();
require("dotenv").config();
const fileUploader = require("express-fileupload");
const mysql = require("mysql");
const connectDB = require("./config/mysql/mysql");
const currencyRouter = require("./routes/currency.routes");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
const protect = require("./middlewares/userAuth");
const documentRouter = require("./routes/documents.routes");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "re_pro",
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Connect database
connectDatabase(); // MongoDB
connectDB(); // MySQL

// Swagger documentation

app.use("/documentation", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/* Upload a document
   ----------------- */

// Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".");
    const e = ext[ext.length - 1];
    // console.log(ext[ext.length-1])
    cb(null, `${file.originalname}.${e}`);
  },
});

// Upload a document
const upload = multer({ storage: storage }).single("file");

app.post("/api/docs/:user/create", protect, (req, res) => {
  if (!user) return res.status(400).send({ message: "User not found!" });

  if (user.name !== req.params.user)
    return res.status(404).send({ message: "Cannot perform this action!" });
  // upload a word document

  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ message: "Error uploading file" });
    }

    // Save the link to database
    const path = __dirname + "\\" + req.file.path;
    const receiver = req.body.receiver;
    const reporter = req.params.user;
    const details = req.body.details;
    const subject = req.body.subject;
    const doc_name = Date.now() + req.file.originalname;
    const church = req.body.church;

    // console.log({path, receiver, reporter, details, subject})
    // save to database
    const sql = `INSERT INTO documents (receiver, reporter, details, subject, path, doc_name, church) VALUES ('${receiver}', '${reporter}', '${details}', '${subject}', '${path}', '${doc_name}', '${church}')`;
    conn.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(400).send({ message: "Error saving to database" });
      }
      const sql = `SELECT * FROM documents WHERE reporter='${user.name}'`
      conn.query(sql, async(err, data) => {
        if(err) return res.status(500).send({message: 'Internal server error...'})
        if(data.length === 0) return res.status(400).send({message:'Document not found!'})
        res.send({ doc:data[0], message: "File uploaded successfully" });
      })
    });
  });
});

app.use("/api/docs", documentRouter);

// Use cors
app.use(cors());

// Fileuploader
app.use(
  fileUploader({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// user apis
app.use("/api/users", userRouter);

// Currency apis
app.use("/api/currency", currencyRouter);

// Room chat apis
app.use("/api/chat", require("./routes/chat.routes"));

app.listen(process.env.PORT, () => {
  console.log(`server listening port ${process.env.PORT}`);
});
