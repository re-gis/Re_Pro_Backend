const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "re_pro",
});

const deleteDoc = async (req, res) => {
  if (!user) return res.status(400).send({ message: "User not found!" });
  // Check if the name matches
  if (user.name !== req.params.user)
    return res.status(404).send({ message: "Cannot perform this action!" });
  // Check if the user is a secretary
  if (user.position !== "secretary")
    return res.status(404).send({ message: "Cannot perform this action!" });
  // delete the document
  const sql = `DELETE FROM documents WHERE reporter = '${req.params.user}' AND doc_id = '${req.params.id}'`;
  conn.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ message: "Error deleting document" });
    }
    console.log(result);
    res.send({ message: "Document deleted successfully" });
  });
};

module.exports = {
  deleteDoc,
};
