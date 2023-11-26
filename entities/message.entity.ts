// const mongoose = require("mongoose");


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


import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import Chat from "./chat.Model";

@Entity()
export default class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  sender: string;

  @Column({ type: "text", nullable: true })
  content: string;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  @JoinColumn({ name: "chatId" })
  chat: Chat;

  constructor(sender: string, content: string, chat: Chat) {
    this.sender = sender;
    this.content = content;
    this.chat = chat;
  }

}