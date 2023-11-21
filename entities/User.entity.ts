import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { EPosition } from "../enums/Enums";
import { string } from "joi";

require("dotenv").config();

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

  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar" })
  profilePic?: string;

  @Column({ type: "varchar" })
  cloudinaryId?: string;

  @Column({ type: "varchar" })
  church?: string;

  @Column({ type: "varchar" })
  language?: string;

  @Column({ type: "boolean", default: false })
  verified?: boolean;

  @Column({ type: "varchar" })
  position?: EPosition;

  @Column({ type: "varchar" })
  idNumber?: string;

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
