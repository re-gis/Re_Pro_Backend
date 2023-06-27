const mysql = require("mysql");

const connectDB = async () => {
  try {
    const conn = mysql.createConnection(
      {
        host: "sql8.freesqldatabase.com",
        user: "sql8628661",
        password: "gZN1nxK1DC",
        database: "sql8628661",
        port: "3306",
      },

      console.log("MySQL database connected...")
    );
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

module.exports = connectDB;
