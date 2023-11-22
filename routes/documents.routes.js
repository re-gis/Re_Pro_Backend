import express from "express";
export const documentRouter = express.Router();
import { protect } from "../middlewares/userAuth";
import { createDocument } from "../controllers/documents.controller";

const upload = multer({ storage: storage }).single("file");

documentRouter.post("/:user/doc/create", protect, upload.single("file"), createDocument);

// Delete a document
// documentRouter.delete("/:user/doc/:id/delete", protect, deleteDoc);

// Get my sent documents
// documentRouter.get("/:me/docs/sent", protect, getMyDocs);

// Get received documents
// documentRouter.get("/:me/docs/received", protect, getReceivedDocs);

// Get all church docs
// documentRouter.get("/all/docs", protect, getAllChurchDocs);

// module.exports = documentRouter;
