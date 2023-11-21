import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
require("dotenv").config();

@Entity("otps")
export default class Otp {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", nullable: false, unique: true })
  number: string;

  @Column({ type: "varchar", nullable: false })
  otp: string;

  constructor(number: string, otp: string) {
    this.number = number;
    this.otp = otp;
  }
}
