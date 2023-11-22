"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDatabase = async () => {
    await mongoose_1.default
        //@ts-ignore
        .connect(process.env.MONGO_URI)
        .then((con) => console.log("Mongodb connected successfully..."))
        .catch((e) => console.log(e));
};
exports.connectDatabase = connectDatabase;
