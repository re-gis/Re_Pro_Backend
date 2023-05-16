const express = require("express");
const {
  deleteDoc,
  getMyDocs,
  getReceivedDocs,
  getAllChurchDocs,
} = require("../controllers/documents.controller");
const protect = require("../middlewares/userAuth");
const documentRouter = express.Router();

// Delete a document
documentRouter.delete("/:user/doc/:id/delete", protect, deleteDoc);

// Get my sent documents
documentRouter.get("/:me/docs/sent", protect, getMyDocs);

// Get received documents
documentRouter.get("/:me/docs/received", protect, getReceivedDocs);

// Get all church docs
documentRouter.get("/all/docs", protect, getAllChurchDocs);

module.exports = documentRouter;
