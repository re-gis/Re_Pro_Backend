"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersByPosition = exports.getAllUses = exports.deleteUser = exports.updateUserStats = void 0;
const Enums_1 = require("../../enums/Enums");
const typeorm_1 = require("typeorm");
const User_entity_1 = __importDefault(require("../../entities/User.entity"));
const updateUserStats = async (req, res, next) => {
    try {
        const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
        const user_id = req.params.user;
        const user = await userRepo.findOneBy({ id: user_id });
        if (!user)
            return res.status(404).json({ message: "User not found!" });
        let { position, church, language, idNumber, name, email, number } = req.body;
        if (!user) {
            return res.status(404).json({ message: `User ${user_id} not found!` });
        }
        if (position != "" && position != undefined) {
            let ps = position.toLowerCase();
            switch (ps) {
                case "secretary":
                    position = Enums_1.EPosition.SECRETARY;
                    break;
                case "bishop":
                    position = Enums_1.EPosition.BISHOP;
                    break;
                case "pastor":
                    position = Enums_1.EPosition.PASTOR;
                    break;
                case "admin":
                    position = Enums_1.EPosition.SUPER;
                    break;
                case "evangelist":
                    position = Enums_1.EPosition.EVANGELIST;
                    break;
                case "human resource":
                    position = Enums_1.EPosition.HUMRE;
                    break;
                case "pos":
                    position = Enums_1.EPosition.POs;
                    break;
                case "super":
                    position = Enums_1.EPosition.SUPER;
                    break;
                default:
                    return res.status(403).json({ message: "Position not allowed..." });
            }
        }
        const updatedFiels = {
            name: name || user.name,
            email: email || user.email,
            church: church || user.church,
            language: language || user.language,
            number: number || user.number,
            idNumber: idNumber || user.idNumber,
        };
        Object.assign(user, updatedFiels);
        await userRepo.save(user);
        return res.status(201).json({
            message: "User updated successfully...",
        });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error..." });
    }
};
exports.updateUserStats = updateUserStats;
const deleteUser = async (req, res) => {
    try {
        const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
        const userId = req.params.user;
        const user = await userRepo.findOneBy({ id: userId });
        if (!user)
            return res.status(404).json({ message: "User not found!" });
        // delete the user
        const { password } = req.body;
        if (!password)
            return res
                .status(401)
                .json({ message: "Password is required to delete account" });
        await userRepo.remove(user);
        return res.status(200).json({ message: "User removed successfully!" });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error..." });
    }
};
exports.deleteUser = deleteUser;
const getAllUses = async (req, res) => {
    try {
        const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
        const users = await userRepo.find();
        if (users.length == 0) {
            return res.status(404).json({ message: "Users not found!" });
        }
        return res
            .status(200)
            .json({ message: "User fetched successfully...", users });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error..." });
    }
};
exports.getAllUses = getAllUses;
const getUsersByPosition = async (req, res) => {
    try {
        let position = req.query.position;
        if (!position)
            return res.status(200).json({ message: exports.getAllUses });
        let ps = position.toLowerCase();
        switch (ps) {
            case "secretary":
                position = Enums_1.EPosition.SECRETARY;
                break;
            case "bishop":
                position = Enums_1.EPosition.BISHOP;
                break;
            case "pastor":
                position = Enums_1.EPosition.PASTOR;
                break;
            case "admin":
                position = Enums_1.EPosition.SUPER;
                break;
            case "evangelist":
                position = Enums_1.EPosition.EVANGELIST;
                break;
            case "human resource":
                position = Enums_1.EPosition.HUMRE;
                break;
            case "pos":
                position = Enums_1.EPosition.POs;
                break;
            case "super":
                position = Enums_1.EPosition.SUPER;
                break;
            default:
                return res.status(403).json({ message: "Position not allowed..." });
        }
        // get users of the same position
        const userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
        const users = await userRepo.findBy({ position });
        if (users.length == 0)
            return res.status(404).json({ message: `No ${ps}s found!` });
        return res
            .status(200)
            .json({ message: `${ps}s fetched successfully...`, users });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error..." });
    }
};
exports.getUsersByPosition = getUsersByPosition;
