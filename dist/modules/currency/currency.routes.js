"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyRouter = void 0;
const express_1 = __importDefault(require("express"));
const userAuth_1 = require("../../middlewares/userAuth");
const currency_controllers_1 = require("./currency.controllers");
exports.currencyRouter = express_1.default.Router();
// Create
exports.currencyRouter.post("/create", userAuth_1.protect, (0, userAuth_1.isVerified)(), currency_controllers_1.createFund);
// Get
exports.currencyRouter.get('/funds', userAuth_1.protect, (0, userAuth_1.isVerified)(), currency_controllers_1.getFunds);
// Update
exports.currencyRouter.put('/:me/funds/', userAuth_1.protect, (0, userAuth_1.isVerified)(), currency_controllers_1.updateFund);
