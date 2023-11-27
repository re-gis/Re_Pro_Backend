"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVerified = exports.role = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_entity_1 = __importDefault(require("../entities/User.entity"));
const typeorm_1 = require("typeorm");
const mysql = require("mysql");
const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "re_pro",
});
const protect = async (req, res, next) => {
    let userRepo = (0, typeorm_1.getRepository)(User_entity_1.default);
    let token;
    try {
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")) {
            //Getting the token from the header
            token = req.headers.authorization.split(" ")[1];
            //Verify the token
            // @ts-ignore
            jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
                if (error)
                    return res.status(400).json({ message: "Invalid token!" });
                //@ts-ignore
                const user_id = decoded.id;
                const user = await userRepo.findOne({ where: { id: user_id } });
                console.log(user);
                if (!user) {
                    return res.status(403).json({
                        message: "Not authorised!",
                    });
                }
                req.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    church: user.church,
                    position: user.position,
                    verified: user.verified,
                    documents: user.documents,
                };
                next();
            });
        }
        else {
            return res.json({
                message: "Not authorized",
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500);
    }
};
exports.protect = protect;
const role = (...roles) => {
    return (req, res, next) => {
        if (roles[0] != req.user.position) {
            return res
                .status(403)
                .json({ message: "You are not authorised to perform this action..." });
        }
        else {
            next();
        }
    };
};
exports.role = role;
const isVerified = () => {
    return (req, res, next) => {
        console.log("hy");
        if (req.user.verified != true) {
            return res
                .status(403)
                .json({ message: "Verify the account to continue..." });
        }
        else {
            next();
        }
    };
};
exports.isVerified = isVerified;
