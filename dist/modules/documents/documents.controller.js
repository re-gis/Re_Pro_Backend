"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDocument = void 0;
const User_entity_1 = __importDefault(require("../../entities/User.entity"));
const typeorm_1 = require("typeorm");
const document_entity_1 = __importDefault(require("../../entities/document.entity"));
const createDocument = async (req, res) => {
    try {
        const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
        const docRepo = (0, typeorm_1.getRepository)(document_entity_1.default);
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: "please login to continue..." });
        const u = await userRepo.findOne({
            where: { number: user.number, email: user.email },
        });
        if (!u)
            return res.status(404).json({ message: "User not found!" });
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: "No files were uploaded." });
        }
        const { description } = req.body;
        if (!description)
            return res
                .status(401)
                .json({ message: "Document description is required!" });
        const uploadedDoc = req.files.document;
        if (uploadedDoc.name.split(".")[1] == "ocx") {
            uploadedDoc.name = uploadedDoc.name + ".docx";
        }
        const path = "E:\\Workspace\\Re_Pro\\backend\\uploads\\" + uploadedDoc.name;
        uploadedDoc.mv(path, (err) => {
            if (err) {
                return res
                    .status(500)
                    .json({ message: "Error while uploading the document..." });
            }
        });
        const doc = new document_entity_1.default(uploadedDoc.name + u.number, description, path, u);
        if (!u.documents) {
            u.documents = [];
        }
        u.documents.push(doc);
        await userRepo.save(u);
        await docRepo.save(doc);
        return res
            .status(201)
            .json({ message: "Document uploaded successfully..." });
        // save the doc
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error..." });
    }
};
exports.createDocument = createDocument;
// const deleteDoc = async (req, res) => {
//   if (!user) return res.status(400).send({ message: "User not found!" });
//   // Check if the name matches
//   if (user.name !== req.params.user)
//     return res.status(404).send({ message: "Cannot perform this action!" });
//   // Check if the user is a secretary
//   if (user.position.toLowerCase() !== "secretary")
//     return res.status(404).send({ message: "Cannot perform this action!" });
//   // Confirm deleting
//   const p = req.body.password;
//   const uP = user.password;
//   if (!p)
//     return res
//       .status(400)
//       .send({ message: "Please provide password to confirm..." });
//   // compare passwords
//   const vP = await bcrypt.compare(p, uP);
//   if (!vP)
//     return res.status(400).send({ message: "Invalid password provided!" });
//   // Select the doc
//   const sql = `SELECT * FROM documents WHERE doc_id = '${req.params.id}' AND church = '${user.church}'`;
//   conn.query(sql, async (err, data) => {
//     if (err)
//       return res.status(500).send({ message: "Internal server error..." });
//     if (data.length === 0)
//       return res.status(400).send({
//         message: `No doc in ${user.church} church found with ${req.params.id} id!`,
//       });
//     // delete the document
//     const sql = `DELETE FROM documents WHERE church = '${user.church}' AND doc_id = '${req.params.id}'`;
//     conn.query(sql, (err, result) => {
//       if (err) {
//         console.log(err);
//         return res.status(400).send({ message: "Error deleting document" });
//       }
//       res.send({ message: "Document deleted successfully" });
//     });
//   });
// };
// // Get my sent docs
// const getMyDocs = async (req, res) => {
//   if (!user) return res.status(400).send({ message: "User not found!" });
//   if (user.name !== req.params.me)
//     return res
//       .status(400)
//       .send({ message: "Not authorised to perform this action!" });
//   // Get the user docs
//   const sql = `SELECT * FROM documents WHERE reporter='${user.name}'`;
//   conn.query(sql, async (err, data) => {
//     if (err)
//       return res.status(500).send({ message: "Internal server error..." });
//     if (data.length === 0)
//       return res.status(400).send({ message: "No sent documents found!" });
//     return res.status(200).send({
//       userDoc: data,
//       message: "User document fetched!",
//     });
//   });
// };
// // Get received docs
// const getReceivedDocs = async (req, res) => {
//   if (!user) return res.status(400).send({ message: "User not found!" });
//   if (user.name !== req.params.me)
//     return res
//       .status(400)
//       .send({ message: "Not authorised to perform this action!" });
//   // Get received docs
//   const sql = `SELECT * FROM documents WHERE receiver = '${user.name}'`;
//   conn.query(sql, async (err, data) => {
//     if (err)
//       return res.status(500).send({ message: "Internal server error..." });
//     if (data.length === 0)
//       return res.status(400).send({ message: "No received documents found!" });
//     return res.status(200).send({
//       userDoc: data,
//       message: "Received docs fetched!",
//     });
//   });
// };
// // Get all docs according to the church
// const getAllChurchDocs = async (req, res) => {
//   if (!user) return res.status(400).send({ message: "User not found!" });
//   // Check if is the secretary
//   if (user.position.toLowerCase() !== "secretary")
//     return res.status(403).send({
//       message: "Not authorised to perform this action! " + user.position,
//     });
//   // Get the docs
//   const sql = `SELECT * FROM documents WHERE church='${user.church}'`;
//   conn.query(sql, async (err, data) => {
//     if (err)
//       return res.status(500).send({ message: "Internal server error..." });
//     if (data.length === 0)
//       return res.status(400).send({ message: "No documents found!" });
//     return res.status(200).send({
//       church: user.church,
//       documents: data,
//       message: "These are the documents of " + user.church,
//     });
//   });
// };
// module.exports = {
//   deleteDoc,
//   getMyDocs,
//   getReceivedDocs,
//   getAllChurchDocs,
// };
