import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import Message from "./message.entity";

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
}