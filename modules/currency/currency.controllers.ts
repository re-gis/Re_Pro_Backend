import { Repository, getRepository } from "typeorm";
import IRequest from "../../interfaces/IRequest";
import IResponse from "../../interfaces/IResponse";
import Currency from "../../entities/currency.entity";
import User from "../../entities/User.entity";
import bcryptjs from "bcryptjs";

export const createFund = async (req: IRequest, res: IResponse) => {
  const e: number = req.body.expenses ? req.body.expenses : 0;
  const a: number = req.body.totalAmount ? req.body.totalAmount : 0;
  const expenses = `RWF ${e}`;
  const totalAmount = `RWF ${a}`;
  const currencyRepo: Repository<Currency> = getRepository(Currency);
  await currencyRepo.clear();
  const user: User = req.user;
  const userRepo: Repository<User> = getRepository(User);
  const u = await userRepo.findOne({ where: { email: user.email } });
  if (!u) return res.status(404).json({ message: "User not found!" });

  if (a > e) {
    // if the expenses are less than the total amount
    const profit: string = `RWF ${a - e}`;
    // save them to the database
    const c = currencyRepo.create({
      expenses,
      number: u.number,
      profit,
      loss: "RWF 0",
      owner: u.email,
      totalAmount: totalAmount,
    });

    if (!(await currencyRepo.save(c))) {
      return res
        .status(500)
        .json({ message: "Error while saving the currency" });
    }
    return res
      .status(201)
      .json({ message: "Currency successfully created...", Currency: c });
  } else if (e > a) {
    // if the expenses are greater than the total amount
    const loss: string = `RWF ${e - a}`;
    const c = currencyRepo.create({
      expenses,
      number: u.number,
      profit: "RWF 0",
      loss,
      owner: u.email,
      totalAmount: totalAmount,
    });

    if (!(await currencyRepo.save(c))) {
      return res
        .status(500)
        .json({ message: "Error while saving the currency..." });
    }

    return res
      .status(201)
      .json({ message: "Currency saved successfully...", Currency: c });
  } else {
    // if they are equal
    const c = currencyRepo.create({
      expenses,
      number: u.number,
      profit: "RWF 0",
      loss: "RWF 0",
      owner: u.email,
      totalAmount: totalAmount,
    });

    if (!(await currencyRepo.save(c))) {
      return res
        .status(500)
        .json({ message: "Error while saving the currency..." });
    }

    return res
      .status(201)
      .json({ message: "Currency saved successfully...", Currency: c });
  }
};

// Returning the funds
export const getFunds = async (req: IRequest, res: IResponse) => {
  const user: User = req.user;
  const userRepo: Repository<User> = getRepository(User);
  const currencyRepo: Repository<Currency> = getRepository(Currency);
  const u = await userRepo.findOne({ where: { email: user.email } });
  if (!u) return res.status(404).json({ message: "User not found" });

  const funds = await currencyRepo.find({
    where: { number: u.number, owner: u.email },
  });
  if (funds.length == 0)
    return res.status(404).json({ message: "Funds not found!" });
  return res
    .status(201)
    .json({ message: "Funds fetched successfully...", funds });
};

// Update the funds
export const updateFund = async (req: IRequest, res: IResponse) => {
  const u: User = req.user;
  const userRepo: Repository<User> = getRepository(User);
  const currencyRepo: Repository<Currency> = getRepository(Currency);
  const user = await userRepo.findOne({ where: { email: u.email } });
  try {
    if (!user) {
      return res.status(401).json({ message: "User not found!" });
    }
    if (req.params.me === user.name) {
      const password: string = req.body.password;
      if (!password)
        return res.status(401).json({ message: "Password is required!" });

      if (!(await bcryptjs.compare(password, user.password)))
        return res.status(401).json({ message: "Invalid password provided!" });

      const fund = await currencyRepo.findOne({
        where: { number: user.number, owner: user.email },
      });
      if (!fund) return res.status(404).json({ message: "Fund not found!" });

      const tt: number = req.body.totalAmount
        ? req.body.totalAmount
        : parseFloat(fund.totalAmount.split(" ")[1]);
      const ee: number = req.body.expenses
        ? req.body.expenses
        : parseFloat(fund.expenses.split(" ")[1]);

      if (tt > ee) {
        // if the expenses are less than the total amount
        const profit: string = `RWF ${tt - ee}`;
        // save them to the database
        const c = currencyRepo.create({
          expenses: `RWF ${ee}`,
          number: user.number,
          profit,
          loss: "RWF 0",
          owner: user.email,
          totalAmount: `RWF ${tt}`,
        });

        if (!(await currencyRepo.save(c))) {
          return res
            .status(500)
            .json({ message: "Error while saving the currency" });
        }
        return res
          .status(201)
          .json({ message: "Currency successfully created...", Currency: c });
      } else if (tt < ee) {
        // if the expenses are less than the total amount
        const loss: string = `RWF ${ee - tt}`;
        // save them to the database
        const c = currencyRepo.create({
          expenses: `RWF ${ee}`,
          number: user.number,
          profit: "RWF 0",
          loss,
          owner: user.email,
          totalAmount: `RWF ${tt}`,
        });

        if (!(await currencyRepo.save(c))) {
          return res
            .status(500)
            .json({ message: "Error while saving the currency" });
        }
        return res
          .status(201)
          .json({ message: "Currency successfully created...", Currency: c });
      } else {
        // if they are equal
        const c = currencyRepo.create({
          expenses: `RWF ${ee}`,
          number: user.number,
          profit: "RWF 0",
          loss: "RWF 0",
          owner: user.email,
          totalAmount: `RWF ${tt}`,
        });

        if (!(await currencyRepo.save(c))) {
          return res
            .status(500)
            .json({ message: "Error while saving the currency..." });
        }

        return res
          .status(201)
          .json({ message: "Currency saved successfully...", Currency: c });
      }
    } else {
      console.log({ user1: user.name, user2: req.params.me });
      return res
        .status(403)
        .json({ message: "Not authorized to perform this action!" });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error..." });
  }
};

// module.exports = {
//   createFund,
//   getFunds,
//   updateFund,
// };
