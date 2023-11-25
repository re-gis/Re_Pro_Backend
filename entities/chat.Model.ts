<<<<<<< HEAD
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import Message from "./message.entity";

=======
// const mongoose = require("mongoose")

import { Column, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import User from "./User.entity";
import Message from "./message.entity";

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

>>>>>>> main
@Entity("chats")
export default class Chat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", nullable: false })
  chatName: string;

  @Column({ nullable: false })
  isGroupChat: boolean;

  @OneToOne(() => Message)
  @JoinColumn()
  latestMessage?: Message;

  @Column()
  users: number[];

  messages?: Message[];

  constructor(chatName: string, isGroupChat: boolean, users: number[]) {
    this.chatName = chatName;
    this.isGroupChat = isGroupChat;
    this.users = users;
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> main
