"use strict";
// const mongoose = require("mongoose")
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
const typeorm_1 = require("typeorm");
const message_entity_1 = __importDefault(require("./message.entity"));
const { Entity, PrimaryGeneratedColumn } = require("typeorm");
// const chatModel = mongoose.Schema(
//   {
//     chatName: {
//       type: String,
//       trim: true,
//     },
//     isGroupChat: {
//       type: Boolean,
//       default: false,
//     },
//     users: [
//       {
//         type: String,
//         required: true
//       },
//     ],
//     latestMessage: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Message",
//     },
//     groupAdmin: {
//       type: String,
//       required: true
//     },
//   },
//   {
//     timestamps: true,
//   }
// );
// const Chat = mongoose.model("Chat", chatModel);
// module.exports = Chat;
let Chat = class Chat {
    constructor(chatName, isGroupChat, users) {
        this.chatName = chatName;
        this.isGroupChat = isGroupChat;
        this.users = users;
    }
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Chat.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: false }),
    __metadata("design:type", String)
], Chat.prototype, "chatName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Boolean)
], Chat.prototype, "isGroupChat", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => message_entity_1.default),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", message_entity_1.default)
], Chat.prototype, "latestMessage", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Array)
], Chat.prototype, "users", void 0);
Chat = __decorate([
    Entity("chats"),
    __metadata("design:paramtypes", [String, Boolean, Array])
], Chat);
exports.default = Chat;
