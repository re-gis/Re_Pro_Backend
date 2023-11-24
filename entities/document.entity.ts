require("dotenv").config();
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "./User.entity";

@Entity("documents")
export default class Document {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", nullable: false })
  filename: string;

  @Column({ type: "varchar", nullable: false })
  filepath: string;

  @Column({ type: "varchar", nullable: false })
  description: string;

  @Column({ type: "timestamp" })
  uploadDate: Date;

  @ManyToOne(() => User, (user) => user.documents,{
    onDelete:"CASCADE"
  })
  @JoinColumn({ name: "userId" })
  user: User;

  constructor(filename: string, desc: string, filepath: string, user: User) {
    this.filename = filename;
    this.filepath = filepath;
    this.description = desc;
    this.user = user;
    this.uploadDate = new Date();
  }

  @BeforeInsert()
  setDefaultDate() {
    this.uploadDate = new Date();
  }
}
