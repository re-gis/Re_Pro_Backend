import express, { NextFunction } from "express";
import { protect } from "../../middlewares/userAuth";
import { createDocument, deleteDoc, getMyDocs } from "./documents.controller";
import { storage } from "../../config/Multer";
import multer from "multer";
import IRequest from "../../interfaces/IRequest";
import IResponse from "../../interfaces/IResponse";
export const documentRouter = express.Router();

type MulterRequestHandler = (
  req: IRequest,
  res: IResponse,
  next: NextFunction
) => any;

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1 GB in bytes
  },
});

const multerUpload: MulterRequestHandler = (req, res, next) => {
  (upload.single("document") as any)(req, res, next);
};



documentRouter.post("/upload",protect,createDocument)


// unwanted
// documentRouter.post("/upload", protect, createDocument);

// // Delete a document
documentRouter.delete("/:user/doc/:id/delete", protect, deleteDoc);

// // Get my sent documents
documentRouter.get("/docs/:user", protect,getMyDocs);

// documentRouter.get("/:me/docs/sent", protect, getMyDocs);

// // Get received documents
// // documentRouter.get("/:me/docs/received", protect, getReceivedDocs);

// // Get all church docs
// // documentRouter.get("/all/docs", protect, getAllChurchDocs);

// // module.exports = documentRouter;
