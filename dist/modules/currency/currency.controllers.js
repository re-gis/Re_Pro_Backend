"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFund = exports.getFunds = exports.createFund = void 0;
const typeorm_1 = require("typeorm");
const currency_entity_1 = __importDefault(require("../../entities/currency.entity"));
const User_entity_1 = __importDefault(require("../../entities/User.entity"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const createFund = async (req, res) => {
    const e = req.body.expenses ? req.body.expenses : 0;
    const a = req.body.totalAmount ? req.body.totalAmount : 0;
    const expenses = `RWF ${e}`;
    const totalAmount = `RWF ${a}`;
    const currencyRepo = (0, typeorm_1.getRepository)(currency_entity_1.default);
    await currencyRepo.clear();
    const user = req.user;
    const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
    const u = await userRepo.findOne({ where: { email: user.email } });
    if (!u)
        return res.status(404).json({ message: "User not found!" });
    if (a > e) {
        // if the expenses are less than the total amount
        const profit = `RWF ${a - e}`;
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
    }
    else if (e > a) {
        // if the expenses are greater than the total amount
        const loss = `RWF ${e - a}`;
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
    }
    else {
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
exports.createFund = createFund;
// Returning the funds
const getFunds = async (req, res) => {
    const user = req.user;
    const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
    const currencyRepo = (0, typeorm_1.getRepository)(currency_entity_1.default);
    const u = await userRepo.findOne({ where: { email: user.email } });
    if (!u)
        return res.status(404).json({ message: "User not found" });
    const funds = await currencyRepo.find({
        where: { number: u.number, owner: u.email },
    });
    if (funds.length == 0)
        return res.status(404).json({ message: "Funds not found!" });
    return res
        .status(201)
        .json({ message: "Funds fetched successfully...", funds });
};
exports.getFunds = getFunds;
// Update the funds
const updateFund = async (req, res) => {
    const u = req.user;
    const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
    const currencyRepo = (0, typeorm_1.getRepository)(currency_entity_1.default);
    const user = await userRepo.findOne({ where: { email: u.email } });
    try {
        if (!user) {
            return res.status(401).json({ message: "User not found!" });
        }
        if (req.params.me === user.name) {
            const password = req.body.password;
            if (!password)
                return res.status(401).json({ message: "Password is required!" });
            if (!(await bcryptjs_1.default.compare(password, user.password)))
                return res.status(401).json({ message: "Invalid password provided!" });
            const fund = await currencyRepo.findOne({
                where: { number: user.number, owner: user.email },
            });
            if (!fund)
                return res.status(404).json({ message: "Fund not found!" });
            const tt = req.body.totalAmount
                ? req.body.totalAmount
                : parseFloat(fund.totalAmount.split(" ")[1]);
            const ee = req.body.expenses
                ? req.body.expenses
                : parseFloat(fund.expenses.split(" ")[1]);
            if (tt > ee) {
                // if the expenses are less than the total amount
                const profit = `RWF ${tt - ee}`;
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
            }
            else if (tt < ee) {
                // if the expenses are less than the total amount
                const loss = `RWF ${ee - tt}`;
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
            }
            else {
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
        }
        else {
            console.log({ user1: user.name, user2: req.params.me });
            return res
                .status(403)
                .json({ message: "Not authorized to perform this action!" });
        }
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error..." });
    }
};
exports.updateFund = updateFund;
// module.exports = {
//   createFund,
//   getFunds,
//   updateFund,
// };
