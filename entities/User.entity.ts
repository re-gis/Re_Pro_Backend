require("dotenv").config();
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { EPosition } from "../enums/Enums";
import Document from "./document.entity";

@Entity("users")
export default class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", nullable: false })
  email: string;

  @Column({ type: "varchar", nullable: false })
  password: string;

  @Column({ type: "varchar", nullable: false })
  number: string;

  @Column({ type: "varchar", nullable: false,unique:true })
  name: string;

  @Column({ type: "varchar", nullable: true })
  profilePic?: string;

  @Column({ type: "varchar", nullable: true })
  cloudinaryId?: string;

  @Column({ type: "varchar", nullable: true })
  church?: string;

  @Column({ type: "varchar", nullable: true })
  language?: string;

  @Column({ type: "boolean", default: false })
  verified?: boolean;

  @Column({ type: "varchar", nullable: true })
  position?: EPosition;

  @Column({ type: "varchar", nullable: true })
  idNumber?: string;

  @OneToMany(() => Document, (doc) => doc.user)
  documents!: Document[];

  constructor(
    email: string,
    password: string,
    number: string,
    name: string,
    profilePic?: string,
    cloudId?: string,
    church?: string,
    language?: string,
    verified?: boolean,
    position?: EPosition,
    idNumber?: string
  ) {
    this.email = email;
    this.name = name;
    this.password = password;
    this.church = church;
    this.profilePic = profilePic;
    this.position = position;
    this.idNumber = idNumber;
    this.verified = verified;
    this.cloudinaryId = cloudId;
    this.number = number;
    this.language = language;
  }
}