const jwt = require("jsonwebtoken");
const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "re_pro",
});

const protect = async (req, res, next) => {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      //Getting the token from the header
      token = req.headers.authorization.split(" ")[1];

      //Verify the token
      jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) return res.status(400).send({ message: "Invalid token!" });
        const user_id = decoded.id;

        // Get user from database
        const sql = `SELECT * FROM users WHERE user_id = '${user_id}'`;
        conn.query(sql, (error, data) => {
          if (error) {
            console.log(error);
            return res
              .status(500)
              .send({ message: "Internal server error..." });
          } else {
            user = data[0];
            next();
          }
        });
      });
    } else {
      return res.json({
        message: "Not authorized",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

module.exports = protect;
