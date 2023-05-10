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
  if (user.position !== "Secretary")
    return res.status(404).send({ message: "Cannot perform this action!" });
  // delete the document
  const sql = `DELETE FROM documents WHERE reporter = '${req.params.user}' AND doc_id = '${req.params.id}'`;
  conn.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ message: "Error deleting document" });
    }
    res.send({ message: "Document deleted successfully" });
  });
};


// Get my sent docs
const getMyDocs = async(req, res) => {
  if(!user) return res.status(400).send({message: 'User not found!'})
  if(user.name !== req.params.me) return res.status(400).send({message: 'Not authorised to perform this action!'})
  // Get the user docs
  const sql = `SELECT * FROM documents WHERE reporter='${user.name}'`
  conn.query(sql, async(err, data) => {
    if(err) return res.status(500).send({message: 'Internal server error...'})
    if(data.length === 0) return res.status(400).send({message: 'No sent documents found!'})
    return res.status(200).send({
      userDoc:data,
      message:'User document fetched!'
    })
  })
}


// Get received docs
const getReceivedDocs = async(req, res) => {
  if(!user) return res.status(400).send({message: 'User not found!'})
  if(user.name !== req.params.me) return res.status(400).send({message: 'Not authorised to perform this action!'})
  // Get received docs
  const sql = `SELECT * FROM documents WHERE receiver = '${user.name}'`
  conn.query(sql, async(err, data) => {
    if(err) return res.status(500).send({message: 'Internal server error...'})
    if(data.length === 0) return res.status(400).send({message: 'No received documents found!'})
    return res.status(200).send({
      userDoc: data,
      message: 'Received docs fetched!'
    })
  })
}


// Get all docs according to the church
const getAllChurchDocs = async(req, res) => {
  if(!user) return res.status(400).send({message: 'User not found!'})
  // Check if is the secretary
  if(user.position !== 'Secretary') return res.status(403).send({message: 'Not authorised to perform this action! '+user.position})
  // Get the docs
  const sql = `SELECT * FROM documents WHERE church='${user.church}'`
  conn.query(sql, async(err, data) => {
    if(err) return res.status(500).send({message: 'Internal server error...'})
    if(data.length === 0) return res.status(400).send({message: 'No documents found!'})
    return res.status(200).send({
      church: user.church,
      documents: data,
      message: 'These are the documents of '+ user.church
    })
  })
}

module.exports = {
  deleteDoc,
  getMyDocs,
  getReceivedDocs,
  getAllChurchDocs
};
