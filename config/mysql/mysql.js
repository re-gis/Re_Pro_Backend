const mysql = require("mysql");

const connectDB = async () => {
  try {
    const conn = mysql.createConnection(
      {
        host: "localhost",
        user: "root",
        password: "",
        database: "re_pro",
      },

      console.log("MySQL database connected...")
    );
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

module.exports = connectDB;
