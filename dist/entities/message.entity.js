"use strict";
// const mongoose = require("mongoose");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const messageModel = mongoose.Schema(
//   {
//     sender: {
//       type: String,
//       required: true,
//     },
//     content: {
//       type: String,
//       trim: true,
//     },
//     chat: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Chat",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );
// const Message = mongoose.model("Message", messageModel);
// module.exports = Message;
const typeorm_1 = require("typeorm");
const chat_Model_1 = __importDefault(require("./chat.Model"));
let Message = class Message {
    constructor(sender, content, chat) {
        this.sender = sender;
        this.content = content;
        this.chat = chat;
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Message.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 255, nullable: false }),
    __metadata("design:type", String)
], Message.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chat_Model_1.default, (chat) => chat.messages),
    (0, typeorm_1.JoinColumn)({ name: "chatId" }),
    __metadata("design:type", chat_Model_1.default)
], Message.prototype, "chat", void 0);
Message = __decorate([
    (0, typeorm_1.Entity)(),
    __metadata("design:paramtypes", [String, String, chat_Model_1.default])
], Message);
exports.default = Message;
