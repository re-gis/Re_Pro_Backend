import express from "express";
import { isVerified, protect } from "../../middlewares/userAuth";
import { createFund, getFunds, updateFund } from "./currency.controllers";
export const currencyRouter = express.Router();

// Create
currencyRouter.post("/create", protect, isVerified(),createFund);

// Get
currencyRouter.get('/funds', protect, isVerified(), getFunds)

// Update
currencyRouter.put('/:me/funds/', protect, isVerified(), updateFund)
