import multer from "multer";
import IRequest from "../interfaces/IRequest";
import path from "path";

// Multer
export const storage = multer.diskStorage({
  destination: function (req: IRequest, file: any, cb: any) {
    cb(null, "uploads");
  },
  filename: function (req: IRequest, file: any, cb: any) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${Date.now()}.${ext}`);
  },
});
