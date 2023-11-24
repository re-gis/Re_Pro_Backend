"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentRouter = void 0;
const express_1 = __importDefault(require("express"));
const userAuth_1 = require("../../middlewares/userAuth");
const documents_controller_1 = require("./documents.controller");
const Multer_1 = require("../../config/Multer");
const multer_1 = __importDefault(require("multer"));
exports.documentRouter = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: Multer_1.storage,
    limits: {
        fileSize: 1024 * 1024 * 1024, // 1 GB in bytes
    },
});
const multerUpload = (req, res, next) => {
    upload.single("document")(req, res, next);
};
exports.documentRouter.post("/upload", userAuth_1.protect, documents_controller_1.createDocument);
// Delete a document
// documentRouter.delete("/:user/doc/:id/delete", protect, deleteDoc);
// Get my sent documents
exports.documentRouter.get("/docs/sent/:user?", userAuth_1.protect, documents_controller_1.getMyDocs);
// documentRouter.get("/:me/docs/sent", protect, getMyDocs);
// Get received documents
// documentRouter.get("/:me/docs/received", protect, getReceivedDocs);
// Get all church docs
// documentRouter.get("/all/docs", protect, getAllChurchDocs);
// module.exports = documentRouter;
