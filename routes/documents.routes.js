const express = require("express");
const { deleteDoc, getMyDocs, getReceivedDocs } = require("../controllers/documents.controller");
const protect = require("../middlewares/userAuth");
const documentRouter = express.Router();

// Delete a document
documentRouter.delete("/:user/doc/:id/delete", protect, deleteDoc);

// Get my sent documents
documentRouter.get('/:me/docs/sent', protect, getMyDocs)

// Get received documents
documentRouter.get('/:me/docs/received', protect, getReceivedDocs)

module.exports = documentRouter;
