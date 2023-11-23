const express = require('express')
const { createFund, getFunds, updateFund } = require('../controllers/currency.controllers')
const protect = require('../../middlewares/userAuth')
const currencyRouter = express.Router()


// Create
currencyRouter.post('/create', protect, createFund)

// Get 
currencyRouter.get('/funds', protect, getFunds)

// Update 
currencyRouter.put('/:me/funds/', protect, updateFund)


module.exports = currencyRouter



