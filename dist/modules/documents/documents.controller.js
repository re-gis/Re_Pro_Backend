"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDoc = exports.getMyDocs = exports.createDocument = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = __importDefault(require("../../entities/User.entity"));
const authorizeGoogleDrive_1 = require("../../utils/authorizeGoogleDrive");
const document_entity_1 = __importDefault(require("../../entities/document.entity"));
const Enums_1 = require("../../enums/Enums");
//  create document and save it
const createDocument = async (req, res) => {
    try {
        const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
        const docRepo = (0, typeorm_1.getRepository)(document_entity_1.default);
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Please log in to continue." });
        }
        const userInRepo = await userRepo.findOne({
            where: { number: user.number, email: user.email },
            relations: ["documents"],
        });
        if (!userInRepo) {
            return res.status(404).json({ message: "User not found." });
        }
        const { document } = req.files;
        const { description } = req.body;
        if (!document || Object.keys(req.files).length === 0) {
            return res
                .status(400)
                .json({ message: "No file uploaded. Please select a file." });
        }
        if (!description) {
            return res.status(400).json({ message: "Description is required." });
        }
        const authClient = await (0, authorizeGoogleDrive_1.authorizeGoogleDrive)();
        const fileUrl = await (0, authorizeGoogleDrive_1.uploadFileToGoogleDrive)(authClient, document.tempFilePath);
        const originalLink = (0, authorizeGoogleDrive_1.getViewLink)(fileUrl);
        if (!originalLink) {
            return res
                .status(500)
                .json({ message: "Error getting file link from Google Drive." });
        }
        const doc = new document_entity_1.default(document.name, description, originalLink, userInRepo);
        if (!userInRepo.documents) {
            userInRepo.documents = [];
        }
        userInRepo.documents.push(doc);
        await userRepo.save(userInRepo);
        await docRepo.save(doc);
        return res.status(200).json({ message: "Document saved successfully." });
    }
    catch (error) {
        console.error("Error in createDocument:", error);
        return res.status(500).json({ message: "Internal server error." + error.message });
    }
};
exports.createDocument = createDocument;
// get documents of user
const getMyDocs = async (req, res) => {
    try {
        const docRepo = (0, typeorm_1.getRepository)(document_entity_1.default);
        const user = req.user;
        console.log(req.params.user);
        if (!user)
            return res.status(404).json({ message: "user not found" });
        if (user.name !== req.params.user)
            return res.status(401).json({ message: "user  not authorized" });
        const documents = await docRepo.find({
            where: {
                user: { id: user.id },
            },
        });
        console.log(documents);
        return res
            .status(200)
            .json({ message: "successfully fetched", documents: documents });
    }
    catch (e) {
        return res.status(500).json({ message: "Internal server error." });
    }
};
exports.getMyDocs = getMyDocs;
// delete document
const deleteDoc = async (req, res) => {
    const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
    const docRepo = (0, typeorm_1.getRepository)(document_entity_1.default);
    const user = req.user;
    const userName = req.params.user;
    const docId = parseInt(req.params.id);
    console.log(userName, docId);
    if (!user) {
        return res.status(401).json({ message: "Please log in to continue." });
    }
    const userInRepo = await userRepo.findOne({
        where: { name: userName },
        relations: ["documents"],
    });
    console.log(userInRepo);
    if (!userInRepo) {
        return res.status(404).json({ message: "User not found." });
    }
    //  check if doc is found in the repository
    const docToDelete = await docRepo.findOne({
        where: { id: docId },
        relations: ["user"],
    });
    if (!docToDelete) {
        return res.status(404).json({ message: "Document not found" });
    }
    console.log(user.id, docToDelete.user.id);
    // Check if the user is authorized to delete the document
    if (userInRepo.position == Enums_1.EPosition.SUPER ||
        userInRepo.position == Enums_1.EPosition.SECRETARY ||
        user.id == docToDelete.user.id) {
        //  extract fileId form usrl
        const fileId = (0, authorizeGoogleDrive_1.extractFileIdFromUrl)(docToDelete.filepath);
        //  delete document id db
        await docRepo.remove(docToDelete);
        //   delete document in google drive
        const authClient = await (0, authorizeGoogleDrive_1.authorizeGoogleDrive)();
        await (0, authorizeGoogleDrive_1.deleteFileFromGoogleDrive)(fileId, authClient);
        //  update user 
        userInRepo.documents = userInRepo.documents.filter((doc) => doc.id == docId);
        await userRepo.save(userInRepo);
        return res.status(200).json({ message: "document have been deleted successfully" });
    }
    else if ((userInRepo === null || userInRepo === void 0 ? void 0 : userInRepo.id) != user.id) {
        return res.status(404).json({ message: "please login to continue" });
    }
    else {
        return res.status(401).json({ message: "You are not authorized to perform this action." });
    }
};
exports.deleteDoc = deleteDoc;
//  unwanted
// export const createDocument = async (
//   req: IRequest,
//   res: IResponse
// ): Promise<IResponse> => {
//   try {
//     const userRepo: Repository<User> = getRepository(User);
//     const docRepo: Repository<Document> = getRepository(Document);
//     const user: User = req.user;
//     if (!user)
//       return res.status(401).json({ message: "please login to continue..." });
//     const u = await userRepo.findOne({
//       where: { number: user.number, email: user.email },
//     });
//     if (!u) return res.status(404).json({ message: "User not found!" });
//     if (!req.files || Object.keys(req.files).length === 0) {
//       return res.status(400).json({ message: "No files were uploaded." });
//     }
//     const { description } = req.body;
//     if (!description)
//       return res
//         .status(401)
//         .json({ message: "Document description is required!" });
//     const uploadedDoc = req.files.document;
//     if (uploadedDoc.name.split(".")[1] == "docx") {
//       uploadedDoc.name = uploadedDoc.name + ".docx";
//     }
//     const pathToUploads = path.join(__dirname, '/uploads');
//     const filePath = path.join(pathToUploads, uploadedDoc.name);
//     uploadedDoc.mv(filePath, (err: any) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ message: "Error while uploading the document..." });
//       }
//     });
//     const doc = new Document(uploadedDoc.name + u.number, description, filePath, u);
//     if (!u.documents) {
//       u.documents = [];
//     }
//     u.documents.push(doc);
//     await userRepo.save(u);
//     await docRepo.save(doc);
//     return res
//       .status(201)
//       .json({ message: "Document uploaded successfully..." });
//     // save the doc
//   } catch (e) {
//     console.log(e);
//     return res.status(500).json({ message: "Internal server error..." });
//   }
// };
// // // Get my sent docs
// export const getMyDocs = async (req:IRequest, res:IResponse) => {
//   const docRepo: Repository<Document> = getRepository(Document);
//   const user =req.user
//   console.log(req.params.user);
//   if(!user) return res.status(404).json({message:"user not found"})
//   if(user.name !== req.params.user) return res.status(401).json({message:"user  not authorized"})
//   const documents =  await docRepo.find(
//     {where:{
//       user:{id :user.id}
//     }}
//   )
//   console.log(documents);
//   return res.status(200).json({message:"successfully fetched",documents:documents})
//   // ger user
//   // if (!user) return res.status(400).send({ message: "User not found!" });
//   // if (user.name !== req.params.me)
//   //   return res
//   //     .status(400)
//   //     .send({ message: "Not authorised to perform this action!" });
//   // // Get the user docs
//   // const sql = `SELECT * FROM documents WHERE reporter='${user.name}'`;
//   // conn.query(sql, async (err, data) => {
//   //   if (err)
//   //     return res.status(500).send({ message: "Internal server error..." });
//   //   if (data.length === 0)
//   //     return res.status(400).send({ message: "No sent documents found!" });
//   //   return res.status(200).send({
//   //     userDoc: data,
//   //     message: "User document fetched!",
//   //   });
//   // });
// };
// // // Get received docs
// // const getReceivedDocs = async (req, res) => {
// //   if (!user) return res.status(400).send({ message: "User not found!" });
// //   if (user.name !== req.params.me)
// //     return res
// //       .status(400)
// //       .send({ message: "Not authorised to perform this action!" });
// //   // Get received docs
// //   const sql = `SELECT * FROM documents WHERE receiver = '${user.name}'`;
// //   conn.query(sql, async (err, data) => {
// //     if (err)
// //       return res.status(500).send({ message: "Internal server error..." });
// //     if (data.length === 0)
// //       return res.status(400).send({ message: "No received documents found!" });
// //     return res.status(200).send({
// //       userDoc: data,
// //       message: "Received docs fetched!",
// //     });
// //   });
// // };
// // // Get all docs according to the church
// // const getAllChurchDocs = async (req, res) => {
// //   if (!user) return res.status(400).send({ message: "User not found!" });
// //   // Check if is the secretary
// //   if (user.position.toLowerCase() !== "secretary")
// //     return res.status(403).send({
// //       message: "Not authorised to perform this action! " + user.position,
// //     });
// //   // Get the docs
// //   const sql = `SELECT * FROM documents WHERE church='${user.church}'`;
// //   conn.query(sql, async (err, data) => {
// //     if (err)
// //       return res.status(500).send({ message: "Internal server error..." });
// //     if (data.length === 0)
// //       return res.status(400).send({ message: "No documents found!" });
// //     return res.status(200).send({
// //       church: user.church,
// //       documents: data,
// //       message: "These are the documents of " + user.church,
// //     });
// //   });
// // };
// // module.exports = {
// //   deleteDoc,
// //   getMyDocs,
// //   getReceivedDocs,
// //   getAllChurchDocs,
// // };
