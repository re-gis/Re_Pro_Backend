"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = __importDefault(require("express"));
const userAuth_1 = require("../../middlewares/userAuth");
const Enums_1 = require("../../enums/Enums");
const admin_controller_1 = require("./admin.controller");
exports.adminRouter = express_1.default.Router();
exports.adminRouter.patch("/users/update/:user", userAuth_1.protect, (0, userAuth_1.role)(Enums_1.EPosition.SUPER), admin_controller_1.updateUserStats);
exports.adminRouter.delete("/users/delete/:user", userAuth_1.protect, (0, userAuth_1.role)(Enums_1.EPosition.SUPER), admin_controller_1.deleteUser);
exports.adminRouter.get("/users", userAuth_1.protect, (0, userAuth_1.role)(Enums_1.EPosition.SUPER), admin_controller_1.getAllUses);
exports.adminRouter.get("/users/position", userAuth_1.protect, (0, userAuth_1.role)(Enums_1.EPosition.SUPER), admin_controller_1.getUsersByPosition);
