import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("currencies")
export default class Currency {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", nullable: false })
  number: string;

  @Column({ type: "varchar", nullable: false })
  owner: string;

  @Column({ type: "datetime" })
  date: Date;

  @Column({ type: "varchar", nullable: false })
  totalAmount: string;

  @Column({ type: "varchar", nullable: false })
  expenses: string;

  @Column({ type: "varchar", nullable: false })
  profit: string;

  @Column({ type: "varchar", nullable: false })
  loss: string;

  constructor(
    number: string,
    owner: string,
    totalAmount: string,
    expenses: string,
    profit: string,
    loss: string
  ) {
    this.number = number;
    this.owner = owner;
    this.date = new Date();
    this.totalAmount = totalAmount;
    this.expenses = expenses;
    this.profit = profit;
    this.loss = loss;
  }
}
