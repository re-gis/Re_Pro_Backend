const express = require("express");
const userRouter = require("./routes/user.routes");
const connectDatabase = require("./config/mongodb/db");
const app = express();
require("dotenv").config();
const fileUploader = require("express-fileupload");
const conn = require("./config/mysql/mysql");
const connectDB = require("./config/mysql/mysql");
const fileUpload = require("express-fileupload");
const currencyRouter = require("./routes/currency.routes");
const documentRouter = require("./routes/documents.routes");


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect database
connectDatabase(); // Mongobd
connectDB(); // MySQL


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
app.use('/api/currency', currencyRouter)

// Document apis
app.use('/api/document', documentRouter)

app.listen(process.env.PORT, () => {
  console.log(`server listening port ${process.env.PORT}`);
});
